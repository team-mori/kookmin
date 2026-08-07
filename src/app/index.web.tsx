import maplibregl from "maplibre-gl";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { ENGINEERING_BUILDING } from "../data/buildings/engineering";
import {
  ENGINEERING_FLOORS,
  ENGINEERING_FLOOR_SHELL,
  type EngineeringFloor
} from "../data/buildings/engineering";
import {
  engineeringRouteToGeoJSON,
  findEngineeringRoute,
  toEngineeringRouteCoordinate,
  type IndoorRoute,
  type IndoorRouteStep
} from "../data/engineering-route";
import {
  findEngineeringRoom,
  searchEngineeringRooms,
  type EngineeringRoomSearchResult
} from "../data/engineering-search";
import {
  BUILDING_CAMERA,
  BUILDING_LABEL_GEOJSON,
  CAMPUS_CAMERA,
  EASE_DURATION_MS,
  EMPTY_FEATURE_COLLECTION,
  FLY_DURATION_MS,
  INDOOR_UI_ZOOM,
  MAP_STYLE_URL,
  ROOM_PITCH,
  ROOM_ZOOM,
  SOURCE_IDS,
  STEP_ZOOM,
  buildingLabelLayerSpecs,
  buildingLayerSpecs,
  floorLabelLayerSpecs,
  floorShellLayerSpecs,
  floorSpaceLayerSpecs,
  routeLineLayerSpecs,
  routeMarkerLayerSpecs
} from "../map/campus-map-spec";

const FLOORS: EngineeringFloor[] = [2, 1];

const STEP_ICONS: Record<IndoorRouteStep["kind"], string> = {
  start: "◉",
  straight: "↑",
  "turn-left": "↰",
  "turn-right": "↱",
  "floor-change": "⇅",
  arrive: "◎"
};

const ROOM_PADDING = { top: 170, right: 40, bottom: 230, left: 40 };

const roomTitle = (room: EngineeringRoomSearchResult) => `${room.roomNumber}호`;

export default function CampusMapWebScreen() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const indoorVisibleRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [floor, setFloor] = useState<EngineeringFloor>(1);
  const [indoorVisible, setIndoorVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] =
    useState<EngineeringRoomSearchResult | null>(null);
  const [originRoom, setOriginRoom] =
    useState<EngineeringRoomSearchResult | null>(null);
  const [destinationRoom, setDestinationRoom] =
    useState<EngineeringRoomSearchResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const searchResults = searchEngineeringRooms(searchQuery);
  const hasSearchQuery = searchQuery.trim().length > 0;

  const route: IndoorRoute | null = useMemo(() => {
    if (!originRoom || !destinationRoom) return null;
    if (originRoom.id === destinationRoom.id) return null;
    try {
      return findEngineeringRoute(originRoom.id, destinationRoom.id);
    } catch {
      return null;
    }
  }, [originRoom, destinationRoom]);

  const routeGeoJSON = useMemo(
    () => (route ? engineeringRouteToGeoJSON(route) : null),
    [route]
  );
  const routeMinutes = route ? Math.ceil(route.estimatedSeconds / 60) : 0;

  useEffect(() => {
    indoorVisibleRef.current = indoorVisible;
  }, [indoorVisible]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: CAMPUS_CAMERA.center as [number, number],
      zoom: CAMPUS_CAMERA.zoom,
      pitch: CAMPUS_CAMERA.pitch,
      bearing: CAMPUS_CAMERA.bearing,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false
    });
    mapRef.current = map;
    // ponytail: dev-only handle for debugging in headless previews.
    if (process.env.NODE_ENV !== "production") {
      (window as { __map?: maplibregl.Map }).__map = map;
    }

    map.on("load", () => {
      if (mapRef.current !== map) return;

      map.addSource(SOURCE_IDS.building, {
        type: "geojson",
        data: ENGINEERING_BUILDING
      });
      map.addSource(SOURCE_IDS.buildingLabel, {
        type: "geojson",
        data: BUILDING_LABEL_GEOJSON
      });
      map.addSource(SOURCE_IDS.floorShell, {
        type: "geojson",
        data: ENGINEERING_FLOOR_SHELL
      });
      map.addSource(SOURCE_IDS.floorSpaces, {
        type: "geojson",
        data: ENGINEERING_FLOORS[1].spaces
      });
      map.addSource(SOURCE_IDS.floorLabels, {
        type: "geojson",
        data: ENGINEERING_FLOORS[1].labels
      });
      map.addSource(SOURCE_IDS.routeLines, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION
      });
      map.addSource(SOURCE_IDS.routeMarkers, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION
      });

      const specs = [
        ...buildingLayerSpecs(),
        ...floorShellLayerSpecs(),
        ...floorSpaceLayerSpecs(null),
        ...routeLineLayerSpecs(1),
        ...floorLabelLayerSpecs(null),
        ...routeMarkerLayerSpecs(1),
        ...buildingLabelLayerSpecs()
      ];
      for (const spec of specs) {
        map.addLayer(spec);
      }

      setMapReady(true);
    });

    const syncIndoorChrome = () => {
      const zoom = map.getZoom();
      setIndoorVisible((visible) =>
        zoom >= INDOOR_UI_ZOOM
          ? true
          : zoom <= INDOOR_UI_ZOOM - 0.3
            ? false
            : visible
      );
    };
    map.on("move", syncIndoorChrome);

    const setPointer = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const clearPointer = () => {
      map.getCanvas().style.cursor = "";
    };
    for (const layerId of ["building-fill", "building-label", "floor-spaces"]) {
      map.on("mouseenter", layerId, setPointer);
      map.on("mouseleave", layerId, clearPointer);
    }

    const openBuilding = () => {
      if (indoorVisibleRef.current) return;
      // 시안 흐름: 캠퍼스 뷰에서 건물 클릭 → 건물 상세 화면
      router.push({ pathname: "/building/[id]", params: { id: "engineering" } });
    };
    map.on("click", "building-fill", openBuilding);
    map.on("click", "building-label", openBuilding);

    map.on("click", "floor-spaces", (event) => {
      if (!indoorVisibleRef.current) return;
      const feature = event.features?.find(
        (item) => item.properties?.kind === "room"
      );
      const roomId = feature?.properties?.id;
      const room =
        typeof roomId === "string" ? findEngineeringRoom(roomId) : undefined;
      if (!room) return;

      setFloor(room.floor);
      setSelectedRoom(room);
      setSearchOpen(false);
      map.easeTo({
        center: room.center,
        duration: EASE_DURATION_MS,
        padding: ROOM_PADDING
      });
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Swap floor data and per-floor route filters in place.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    (map.getSource(SOURCE_IDS.floorSpaces) as maplibregl.GeoJSONSource).setData(
      ENGINEERING_FLOORS[floor].spaces
    );
    (map.getSource(SOURCE_IDS.floorLabels) as maplibregl.GeoJSONSource).setData(
      ENGINEERING_FLOORS[floor].labels
    );
    for (const spec of [
      ...routeLineLayerSpecs(floor),
      ...routeMarkerLayerSpecs(floor)
    ]) {
      if ("filter" in spec && spec.filter) map.setFilter(spec.id, spec.filter);
    }
  }, [floor, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const selectedId =
      selectedRoom && selectedRoom.floor === floor ? selectedRoom.id : null;
    for (const spec of [
      ...floorSpaceLayerSpecs(selectedId),
      ...floorLabelLayerSpecs(selectedId)
    ]) {
      if ("filter" in spec && spec.filter) map.setFilter(spec.id, spec.filter);
    }
  }, [selectedRoom, floor, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    (map.getSource(SOURCE_IDS.routeLines) as maplibregl.GeoJSONSource).setData(
      routeGeoJSON?.lines ?? EMPTY_FEATURE_COLLECTION
    );
    (map.getSource(SOURCE_IDS.routeMarkers) as maplibregl.GeoJSONSource).setData(
      routeGeoJSON?.markers ?? EMPTY_FEATURE_COLLECTION
    );
  }, [routeGeoJSON, mapReady]);

  const focusRoom = (room: EngineeringRoomSearchResult) => {
    mapRef.current?.flyTo({
      center: room.center,
      zoom: ROOM_ZOOM,
      pitch: ROOM_PITCH,
      duration: FLY_DURATION_MS,
      padding: ROOM_PADDING
    });
  };

  const backToCampus = () => {
    setSelectedRoom(null);
    mapRef.current?.easeTo({
      center: CAMPUS_CAMERA.center as [number, number],
      zoom: CAMPUS_CAMERA.zoom,
      pitch: CAMPUS_CAMERA.pitch,
      duration: 900,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    });
  };

  const selectRoom = (room: EngineeringRoomSearchResult) => {
    setFloor(room.floor);
    setSelectedRoom(room);
    setSearchOpen(false);
    focusRoom(room);
  };

  const resetSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
    setSelectedRoom(null);
  };

  const clearRoute = () => {
    setOriginRoom(null);
    setDestinationRoom(null);
    setActiveStep(0);
  };

  const setAsOrigin = (room: EngineeringRoomSearchResult) => {
    setOriginRoom(room);
    if (destinationRoom?.id === room.id) setDestinationRoom(null);
    setSelectedRoom(null);
    setActiveStep(0);
  };

  const setAsDestination = (room: EngineeringRoomSearchResult) => {
    setDestinationRoom(room);
    if (originRoom?.id === room.id) setOriginRoom(null);
    setSelectedRoom(null);
    setActiveStep(0);
  };

  const focusStep = (index: number) => {
    if (!route) return;
    const step = route.steps[index];
    setActiveStep(index);
    setFloor(step.floor);
    mapRef.current?.easeTo({
      center: toEngineeringRouteCoordinate(step.focusXY),
      zoom: STEP_ZOOM,
      pitch: ROOM_PITCH,
      duration: EASE_DURATION_MS,
      padding: { top: 120, right: 40, bottom: 320, left: 40 }
    });
  };

  const changeFloor = (nextFloor: EngineeringFloor) => {
    setFloor(nextFloor);
    if (selectedRoom && selectedRoom.floor !== nextFloor) setSelectedRoom(null);
  };

  const pendingLabel =
    originRoom && !destinationRoom
      ? { chip: `출발 ${roomTitle(originRoom)}`, hint: "도착지를 선택하세요" }
      : destinationRoom && !originRoom
        ? { chip: `도착 ${roomTitle(destinationRoom)}`, hint: "출발지를 선택하세요" }
        : null;

  return (
    <main className="app-shell">
      <style>{styles}</style>

      <div ref={containerRef} className="map-canvas" />

      <header className="map-header">
        {indoorVisible && (
          <button
            aria-label="캠퍼스 지도로 돌아가기"
            className="back-button"
            onClick={backToCampus}
            type="button"
          >
            ‹
          </button>
        )}
        <span className="brand-mark">MORI</span>
        <div>
          <strong>{indoorVisible ? "공학관" : "대국민지도"}</strong>
          <span>{indoorVisible ? `${floor}층 실내지도` : "국민대학교"}</span>
        </div>
      </header>

      <section className="search-panel" aria-label="호실 검색">
        <div className="search-bar">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            aria-label="호실 또는 장소 검색"
            autoCapitalize="none"
            autoComplete="off"
            onChange={(event) => {
              setSearchQuery(event.currentTarget.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="건물 또는 호실을 검색해보세요"
            spellCheck={false}
            type="search"
            value={searchQuery}
          />
          {hasSearchQuery || selectedRoom ? (
            <button
              aria-label="검색 초기화"
              className="search-reset"
              onClick={resetSearch}
              type="button"
            >
              ×
            </button>
          ) : (
            <span aria-hidden className="search-avatar">K</span>
          )}
        </div>

        {searchOpen && hasSearchQuery && (
          <div className="search-results" role="listbox">
            {searchResults.length > 0 ? (
              searchResults.map((room) => (
                <button
                  key={room.id}
                  aria-label={`${room.roomNumber}호 ${room.name}, ${room.floor}층`}
                  className="search-result"
                  onClick={() => selectRoom(room)}
                  role="option"
                  type="button"
                >
                  <span>
                    <strong>{room.roomNumber}호</strong>
                    <small>{room.name}</small>
                  </span>
                  <b>{room.floor}F</b>
                </button>
              ))
            ) : (
              <div className="no-results">
                <strong>등록되지 않은 장소예요</strong>
                <span>호실 번호 또는 장소명을 확인해 주세요.</span>
              </div>
            )}
          </div>
        )}
      </section>

      {indoorVisible && (
        <nav className="floor-selector" aria-label="층 선택">
          {FLOORS.map((item) => (
            <button
              key={item}
              aria-label={`공학관 ${item}층`}
              aria-pressed={item === floor}
              className={item === floor ? "selected" : undefined}
              onClick={() => changeFloor(item)}
              type="button"
            >
              {item}F
            </button>
          ))}
        </nav>
      )}

      {pendingLabel && !route && (
        <div className="pending-chip">
          <span>
            {pendingLabel.chip} · {pendingLabel.hint}
          </span>
          <button
            aria-label="경로 선택 취소"
            onClick={clearRoute}
            type="button"
          >
            ×
          </button>
        </div>
      )}

      {selectedRoom && !route && (
        <section className="room-card" aria-label="선택한 호실">
          <div className="room-card-text">
            <strong>{roomTitle(selectedRoom)}</strong>
            <span>
              {selectedRoom.name} · 공학관 {selectedRoom.floor}층
            </span>
          </div>
          <button
            className="ghost"
            onClick={() => setAsOrigin(selectedRoom)}
            type="button"
          >
            출발
          </button>
          <button onClick={() => setAsDestination(selectedRoom)} type="button">
            도착
          </button>
          <button
            aria-label="호실 정보 닫기"
            className="close"
            onClick={() => setSelectedRoom(null)}
            type="button"
          >
            ×
          </button>
        </section>
      )}

      {route && (
        <section className="route-panel" aria-live="polite">
          <div className="route-summary-row">
            <div>
              <strong>
                {route.start.roomNumber}호 → {route.destination.roomNumber}호
              </strong>
              <span>
                {route.distanceMeters}m · 약 {routeMinutes}분
                {route.segments.length > 1 ? " · 층간 이동 포함" : ""}
              </span>
            </div>
            <button onClick={clearRoute} type="button">
              종료
            </button>
          </div>
          <ol className="step-list">
            {route.steps.map((step, index) => (
              <li key={`${index}-${step.kind}`}>
                <button
                  className={index === activeStep ? "active" : undefined}
                  onClick={() => focusStep(index)}
                  type="button"
                >
                  <i>{STEP_ICONS[step.kind]}</i>
                  <span>{step.text}</span>
                  <b>{step.floor}F</b>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="map-attribution">
        © MapLibre · © OpenFreeMap · © OpenMapTiles · © OpenStreetMap
      </footer>
    </main>
  );
}

const styles = `
  :root {
    color-scheme: light;
    font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
  }

  * { box-sizing: border-box; }
  html, body, #root { width: 100%; height: 100%; margin: 0; }
  body { overflow: hidden; }
  button { font: inherit; }
  input { font: inherit; }

  .app-shell {
    position: fixed;
    inset: 0;
    min-width: 320px;
    overflow: hidden;
    background: #E8EEEB;
    color: #1D2822;
  }

  .map-canvas {
    position: absolute;
    inset: 0;
  }

  .map-canvas canvas {
    display: block;
    outline: none;
  }

  .map-header {
    position: absolute;
    z-index: 2;
    top: max(18px, env(safe-area-inset-top));
    left: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 228px;
    min-height: 58px;
    padding: 9px 13px;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.95);
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
    backdrop-filter: blur(14px);
  }

  .back-button {
    width: 34px;
    height: 38px;
    padding: 0 0 4px;
    border: 0;
    background: transparent;
    color: #1D2822;
    font-size: 27px;
    line-height: 34px;
    cursor: pointer;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 7px;
    background: #0CA35B;
    color: white;
    font-size: 10px;
    font-weight: 800;
  }

  .map-header div { display: grid; gap: 2px; }
  .map-header strong { font-size: 16px; line-height: 20px; }
  .map-header div span { color: #68756E; font-size: 11px; line-height: 16px; }

  .search-panel {
    position: absolute;
    z-index: 3;
    top: max(18px, env(safe-area-inset-top));
    left: 50%;
    width: min(360px, calc(100% - 24px));
    transform: translateX(-50%);
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 10px 0 16px;
    border: 0;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
  }

  .search-icon { flex: none; color: #8B95A1; }

  .search-avatar {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: #eaf9f1;
    color: #0ca35b;
    font-size: 14px;
    font-weight: 700;
  }

  .search-bar input {
    min-width: 0;
    min-height: 46px;
    flex: 1;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #1D2822;
    font-size: 16px;
  }

  .search-bar input::placeholder { color: #7A8580; }
  .search-bar input::-webkit-search-cancel-button { display: none; }

  .search-reset {
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #66716C;
    font-size: 25px;
    line-height: 40px;
    cursor: pointer;
  }

  .search-reset:hover { color: #1D2822; }
  .search-reset:focus-visible { outline: 3px solid #8DB8FF; border-radius: 5px; }

  .search-results {
    max-height: 286px;
    margin-top: 4px;
    overflow-y: auto;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.98);
    box-shadow: 0 10px 30px rgba(41,58,49,.16);
  }

  .search-result {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 54px;
    padding: 8px 13px;
    border: 0;
    border-bottom: 1px solid #E6EBE8;
    background: transparent;
    color: #1D2822;
    text-align: left;
    cursor: pointer;
  }

  .search-result:last-child { border-bottom: 0; }
  .search-result:hover, .search-result:focus-visible { background: #EAF9F1; outline: 0; }
  .search-result > span { display: grid; min-width: 0; flex: 1; gap: 2px; }
  .search-result strong { font-size: 14px; }
  .search-result small { overflow: hidden; color: #66716C; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  .search-result b {
    margin-left: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    background: #eaf9f1;
    color: #0a8c4e;
    font-size: 11px;
  }

  .no-results { display: grid; gap: 4px; padding: 16px 14px; }
  .no-results strong { font-size: 14px; }
  .no-results span { color: #738078; font-size: 12px; }

  .floor-selector {
    position: absolute;
    z-index: 2;
    top: max(18px, env(safe-area-inset-top));
    right: 18px;
    display: grid;
    overflow: hidden;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.96);
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
  }

  .floor-selector button {
    width: 48px;
    height: 48px;
    border: 0;
    border-bottom: 1px solid #E1E7E4;
    background: transparent;
    color: #59665F;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .floor-selector button:last-child { border-bottom: 0; }
  .floor-selector button:hover { background: #F2F5F3; }
  .floor-selector button.selected { background: #0CA35B; color: white; }
  .floor-selector button:focus-visible { outline: 3px solid #8DB8FF; outline-offset: -3px; }

  .pending-chip {
    position: absolute;
    z-index: 3;
    top: calc(max(18px, env(safe-area-inset-top)) + 62px);
    left: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 8px 9px 14px;
    border-radius: 999px;
    background: #087540;
    box-shadow: 0 6px 18px rgba(18,62,143,.3);
    color: white;
    font-size: 12px;
    font-weight: 700;
  }

  .pending-chip button {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #B9CDF2;
    font-size: 16px;
    line-height: 20px;
    cursor: pointer;
  }

  .pending-chip button:hover { color: white; }

  .room-card {
    position: absolute;
    z-index: 3;
    left: 18px;
    bottom: max(18px, env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    gap: 8px;
    width: min(430px, calc(100% - 36px));
    min-height: 66px;
    padding: 10px 8px 10px 14px;
    border: 1px solid #CBD5D0;
    border-radius: 10px;
    background: rgba(255,255,255,.97);
    box-shadow: 0 8px 24px rgba(36,52,44,.14);
    backdrop-filter: blur(14px);
  }

  .room-card-text { display: grid; min-width: 0; flex: 1; gap: 2px; }
  .room-card-text strong { font-size: 16px; }
  .room-card-text span { overflow: hidden; color: #68756E; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }

  .room-card button {
    flex: 0 0 auto;
    min-width: 56px;
    height: 40px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: #0CA35B;
    color: white;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .room-card button:hover { background: #0F58CF; }
  .room-card button.ghost { background: #DDF3E6; color: #0A8C4E; }
  .room-card button.ghost:hover { background: #DBE9FD; }
  .room-card button.close {
    min-width: 32px;
    width: 32px;
    padding: 0;
    background: transparent;
    color: #66716C;
    font-size: 22px;
  }
  .room-card button.close:hover { background: #F2F5F3; }

  .route-panel {
    position: absolute;
    z-index: 3;
    left: 18px;
    bottom: max(18px, env(safe-area-inset-bottom));
    overflow: hidden;
    width: min(430px, calc(100% - 36px));
    border: 1px solid #CBD5D0;
    border-radius: 10px;
    background: rgba(255,255,255,.97);
    box-shadow: 0 8px 24px rgba(36,52,44,.14);
    backdrop-filter: blur(14px);
  }

  .route-summary-row {
    display: flex;
    align-items: center;
    padding: 11px 11px 11px 14px;
    border-bottom: 1px solid #E4E9E6;
  }

  .route-summary-row > div { display: grid; min-width: 0; flex: 1; gap: 3px; padding-right: 10px; }
  .route-summary-row strong,
  .route-summary-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .route-summary-row strong { font-size: 14px; }
  .route-summary-row span { color: #68756E; font-size: 11px; }

  .route-summary-row button {
    flex: 0 0 auto;
    height: 36px;
    padding: 0 14px;
    border: 0;
    border-radius: 7px;
    background: #EDF1EF;
    color: #34413B;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .route-summary-row button:hover { background: #E1E7E4; }

  .step-list {
    max-height: 236px;
    margin: 0;
    padding: 4px 0;
    overflow-y: auto;
    list-style: none;
  }

  .step-list button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 46px;
    padding: 6px 14px;
    border: 0;
    background: transparent;
    color: #25302B;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
  }

  .step-list button:hover { background: #F3F7F5; }
  .step-list button.active { background: #EAF9F1; color: #087540; font-weight: 700; }
  .step-list i {
    width: 22px;
    color: #5A6660;
    font-size: 15px;
    font-style: normal;
    text-align: center;
  }
  .step-list button.active i { color: #1767E8; }
  .step-list span { flex: 1; line-height: 18px; }
  .step-list b { color: #8B968F; font-size: 11px; }

  .map-attribution {
    position: absolute;
    z-index: 2;
    right: 8px;
    bottom: 4px;
    color: #6D7A73;
    font-size: 10px;
    text-shadow: 0 1px 0 rgba(255,255,255,.8);
    pointer-events: none;
  }

  @media (max-width: 560px) {
    .map-header { top: max(12px, env(safe-area-inset-top)); left: 12px; min-width: 210px; }
    .floor-selector { top: calc(max(12px, env(safe-area-inset-top)) + 66px); right: 12px; }
    .search-panel {
      top: calc(max(12px, env(safe-area-inset-top)) + 66px);
      left: 12px;
      width: calc(100% - 84px);
      transform: none;
    }
    .pending-chip { top: calc(max(12px, env(safe-area-inset-top)) + 122px); left: 12px; }
    .room-card, .route-panel {
      right: 12px;
      bottom: max(12px, env(safe-area-inset-bottom));
      left: 12px;
      width: auto;
    }
    .step-list { max-height: 190px; }
  }
`;
