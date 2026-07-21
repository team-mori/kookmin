import { useState } from "react";

import {
  ENGINEERING_FLOOR_BOUNDS,
  ENGINEERING_FLOORS,
  ENGINEERING_FLOOR_SHELL,
  type EngineeringFloor,
  type EngineeringSpaceKind
} from "../data/engineering-floors";
import {
  ENGINEERING_DEMO_ROUTE,
  ENGINEERING_ROUTE_DEMO,
  toEngineeringRouteCoordinate
} from "../data/engineering-route";
import {
  searchEngineeringRooms,
  type EngineeringRoomSearchResult
} from "../data/engineering-search";

const FLOORS: EngineeringFloor[] = [2, 1];
const VIEWBOX_WIDTH = 960;
const VIEWBOX_HEIGHT = 640;
const [WEST, SOUTH, EAST, NORTH] = ENGINEERING_FLOOR_BOUNDS;
const DEMO_ROUTE_MINUTES = Math.ceil(
  ENGINEERING_DEMO_ROUTE.estimatedSeconds / 60
);
const DEMO_ROUTE_COORDINATES = ENGINEERING_DEMO_ROUTE.points.map(
  toEngineeringRouteCoordinate
);

const APPEARANCE: Record<
  EngineeringSpaceKind,
  { fill: string; side: string; stroke: string; text: string }
> = {
  room: {
    fill: "#F7FAF8",
    side: "#BCC7C1",
    stroke: "#AAB6B0",
    text: "#29352F"
  },
  corridor: {
    fill: "#FFFFFF",
    side: "#D8E0DC",
    stroke: "#CDD7D2",
    text: "#65716B"
  },
  stairs: {
    fill: "#E6F0FF",
    side: "#9DB7DE",
    stroke: "#6F94C9",
    text: "#42699F"
  },
  elevator: {
    fill: "#DFF3E7",
    side: "#93BFA3",
    stroke: "#5B9A70",
    text: "#39724E"
  }
};

const project = ([longitude, latitude]: GeoJSON.Position): [number, number] => {
  const x = (longitude - WEST) / (EAST - WEST) - 0.5;
  const y = (latitude - SOUTH) / (NORTH - SOUTH) - 0.5;

  return [
    VIEWBOX_WIDTH / 2 + x * 780 + y * 72,
    VIEWBOX_HEIGHT / 2 + x * 22 - y * 420
  ];
};

const polygonPoints = (
  coordinates: GeoJSON.Position[],
  offsetY = 0
): string =>
  coordinates
    .map((coordinate) => {
      const [x, y] = project(coordinate);
      return `${x.toFixed(1)},${(y + offsetY).toFixed(1)}`;
    })
    .join(" ");

export default function IndoorMapWebPreview() {
  const [floor, setFloor] = useState<EngineeringFloor>(1);
  const [routeVisible, setRouteVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] =
    useState<EngineeringRoomSearchResult | null>(null);
  const floorData = ENGINEERING_FLOORS[floor];
  const shell = ENGINEERING_FLOOR_SHELL.features[0].geometry.coordinates[0];
  const searchResults = searchEngineeringRooms(searchQuery);
  const hasSearchQuery = searchQuery.trim().length > 0;
  const [routeStartX, routeStartY] = project(DEMO_ROUTE_COORDINATES[0]);
  const [routeEndX, routeEndY] = project(DEMO_ROUTE_COORDINATES.at(-1)!);

  const showDemoRoute = () => {
    setFloor(ENGINEERING_ROUTE_DEMO.floor);
    setSelectedRoom(null);
    setRouteVisible(true);
  };

  const selectRoom = (room: EngineeringRoomSearchResult) => {
    setFloor(room.floor);
    setSelectedRoom(room);
    setRouteVisible(false);
    setSearchOpen(false);
  };

  const resetSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
    setSelectedRoom(null);
  };

  const changeFloor = (nextFloor: EngineeringFloor) => {
    setFloor(nextFloor);
    setRouteVisible(false);
    if (selectedRoom?.floor !== nextFloor) setSelectedRoom(null);
  };

  return (
    <main className="app-shell">
      <style>{styles}</style>

      <header className="map-header">
        <span className="brand-mark">MORI</span>
        <div>
          <strong>공학관</strong>
          <span>{floor}층 실내지도</span>
        </div>
      </header>

      <section className="search-panel" aria-label="호실 검색">
        <div className="search-bar">
          <input
            aria-label="호실 또는 장소 검색"
            autoCapitalize="none"
            autoComplete="off"
            onChange={(event) => {
              setSearchQuery(event.currentTarget.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="호실 또는 장소 검색"
            spellCheck={false}
            type="search"
            value={searchQuery}
          />
          {(hasSearchQuery || selectedRoom) && (
            <button
              aria-label="검색 초기화"
              className="search-reset"
              onClick={resetSearch}
              type="button"
            >
              ×
            </button>
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
                <strong>검색 결과가 없습니다</strong>
                <span>호실 번호 또는 장소명을 확인해 주세요.</span>
              </div>
            )}
          </div>
        )}
      </section>

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

      <svg
        aria-label={`공학관 ${floor}층 공간 배치도`}
        className="indoor-map"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#D7E0DB" strokeWidth="1" />
          </pattern>
          <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="12" floodColor="#53645B" floodOpacity="0.22" stdDeviation="12" />
          </filter>
          <marker
            id="route-chevron"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path d="M1 1 L7 4 L1 7" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </marker>
          <filter id="selected-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="5" floodColor="#0B4EB9" floodOpacity="0.42" stdDeviation="5" />
          </filter>
        </defs>

        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#E8EEEB" />
        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#map-grid)" opacity="0.45" />

        <g key={floor} aria-hidden="true" className="floor-plan">
          <polygon
            fill="#8C9C94"
            opacity="0.68"
            points={polygonPoints(shell, 15)}
          />
          <polygon
            fill="#FCFEFD"
            filter="url(#map-shadow)"
            points={polygonPoints(shell)}
            stroke="#91A098"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          {floorData.spaces.features.map((feature) => {
            const { id, kind } = feature.properties;
            const appearance = APPEARANCE[kind];
            const offset = kind === "corridor" ? 1.5 : kind === "elevator" ? 8 : 5;
            const selected = id === selectedRoom?.id;

            return (
              <polygon
                key={`${id}-side`}
                fill={selected ? "#0B4EB9" : appearance.side}
                opacity={kind === "corridor" ? 0.45 : 0.9}
                points={polygonPoints(feature.geometry.coordinates[0], offset)}
              />
            );
          })}

          {floorData.spaces.features.map((feature) => {
            const { id, kind } = feature.properties;
            const appearance = APPEARANCE[kind];
            const selected = id === selectedRoom?.id;

            return (
              <polygon
                key={id}
                className={selected ? "space selected" : "space"}
                fill={selected ? "#2478F4" : appearance.fill}
                filter={selected ? "url(#selected-shadow)" : undefined}
                points={polygonPoints(feature.geometry.coordinates[0])}
                stroke={selected ? "#0B4EB9" : appearance.stroke}
                strokeLinejoin="round"
                strokeWidth={selected ? 4 : kind === "corridor" ? 1.2 : 1.5}
              />
            );
          })}

          {routeVisible && floor === ENGINEERING_ROUTE_DEMO.floor && (
            <g aria-label="115호에서 107호까지 고정 데모 경로">
              <polyline
                className="route-casing"
                fill="none"
                points={polygonPoints(DEMO_ROUTE_COORDINATES)}
              />
              <polyline
                className="route-line"
                fill="none"
                markerEnd="url(#route-chevron)"
                markerMid="url(#route-chevron)"
                points={polygonPoints(DEMO_ROUTE_COORDINATES)}
              />
              <circle className="route-marker start" cx={routeStartX} cy={routeStartY} r="9" />
              <circle className="route-marker destination" cx={routeEndX} cy={routeEndY} r="9" />
              <text className="route-marker-label" textAnchor="middle" x={routeStartX} y={routeStartY - 16}>
                115 출발
              </text>
              <text className="route-marker-label" textAnchor="middle" x={routeEndX} y={routeEndY - 16}>
                107 도착
              </text>
            </g>
          )}

          {floorData.labels.features.map((feature) => {
            const { id, kind, label } = feature.properties;
            if (kind === "corridor") return null;

            const [x, y] = project(feature.geometry.coordinates);
            const fontSize = kind === "room" ? (label.length > 5 ? 8 : 10) : 9;
            const selected = id === selectedRoom?.id;

            return (
              <text
                key={`${id}-label`}
                className={label.length > 5 ? "space-label compact" : "space-label"}
                dominantBaseline="central"
                fill={selected ? "#FFFFFF" : APPEARANCE[kind].text}
                fontSize={fontSize}
                fontWeight="700"
                paintOrder="stroke"
                stroke={selected ? "#0B4EB9" : "#FFFFFF"}
                strokeWidth={selected ? 3.2 : 2.6}
                textAnchor="middle"
                x={x}
                y={y}
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      <aside className="map-legend" aria-label="지도 범례">
        <span><i className="room" />호실</span>
        <span><i className="stairs" />계단</span>
        <span><i className="elevator" />엘리베이터</span>
      </aside>

      <section aria-live="polite" className="route-bar">
        <div>
          <strong>고정 데모 · {ENGINEERING_ROUTE_DEMO.startLabel} → {ENGINEERING_ROUTE_DEMO.destinationLabel}</strong>
          <span>
            {routeVisible
              ? `${Math.round(ENGINEERING_DEMO_ROUTE.distanceMeters)}m · 약 ${DEMO_ROUTE_MINUTES}분`
              : "공학관 1층 실내 경로"}
          </span>
        </div>
        <button
          className={routeVisible ? "clear" : undefined}
          onClick={routeVisible ? () => setRouteVisible(false) : showDemoRoute}
          type="button"
        >
          {routeVisible ? "안내 종료" : "경로 보기"}
        </button>
      </section>
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

  .indoor-map {
    display: block;
    width: 100%;
    height: 100%;
  }

  .floor-plan {
    animation: floor-in 260ms cubic-bezier(.2,.8,.2,1);
  }

  .space {
    transition: filter 120ms ease, stroke-width 120ms ease;
  }

  .space:hover {
    filter: brightness(.97);
    stroke-width: 2.4;
  }

  .route-casing,
  .route-line {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .route-casing { stroke: #FFFFFF; stroke-width: 12; opacity: .96; }
  .route-line { stroke: #1767E8; stroke-width: 7; }
  .route-marker { stroke: #FFFFFF; stroke-width: 3; }
  .route-marker.start { fill: #12A36D; }
  .route-marker.destination { fill: #E64867; }
  .route-marker-label {
    fill: #17231D;
    font-size: 12px;
    font-weight: 800;
    paint-order: stroke;
    stroke: #FFFFFF;
    stroke-width: 4px;
  }
  .space.selected { stroke-width: 4; }

  .map-header {
    position: absolute;
    z-index: 2;
    top: max(18px, env(safe-area-inset-top));
    left: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 228px;
    min-height: 58px;
    padding: 9px 13px;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.95);
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
    backdrop-filter: blur(14px);
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 7px;
    background: #1767E8;
    color: white;
    font-size: 10px;
    font-weight: 800;
  }

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
    min-height: 48px;
    padding: 0 5px 0 14px;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.97);
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
    backdrop-filter: blur(14px);
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
  .search-result:hover, .search-result:focus-visible { background: #EEF4FD; outline: 0; }
  .search-result > span { display: grid; min-width: 0; flex: 1; gap: 2px; }
  .search-result strong { font-size: 14px; }
  .search-result small { overflow: hidden; color: #66716C; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  .search-result b {
    margin-left: 10px;
    padding: 4px 7px;
    border-radius: 5px;
    background: #EAF2FE;
    color: #185FCB;
    font-size: 11px;
  }

  .no-results { display: grid; gap: 4px; padding: 16px 14px; }
  .no-results strong { font-size: 14px; }
  .no-results span { color: #738078; font-size: 12px; }

  .map-header div {
    display: grid;
    gap: 2px;
  }

  .map-header strong {
    font-size: 16px;
    line-height: 20px;
  }

  .map-header div span {
    color: #68756E;
    font-size: 11px;
    line-height: 16px;
  }

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
  .floor-selector button.selected { background: #1767E8; color: white; }
  .floor-selector button:focus-visible { outline: 3px solid #8DB8FF; outline-offset: -3px; }

  .map-legend {
    position: absolute;
    z-index: 2;
    right: 18px;
    bottom: max(18px, env(safe-area-inset-bottom));
    display: flex;
    gap: 14px;
    padding: 9px 12px;
    border: 1px solid #D0D9D4;
    border-radius: 7px;
    background: rgba(255,255,255,.92);
    box-shadow: 0 6px 18px rgba(41,58,49,.1);
    color: #59665F;
    font-size: 11px;
    backdrop-filter: blur(12px);
  }

  .map-legend span { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .map-legend i { width: 10px; height: 10px; border: 1px solid; border-radius: 2px; }
  .map-legend i.room { background: #F7FAF8; border-color: #AAB6B0; }
  .map-legend i.stairs { background: #E6F0FF; border-color: #6F94C9; }
  .map-legend i.elevator { background: #DFF3E7; border-color: #5B9A70; }

  .route-bar {
    position: absolute;
    z-index: 3;
    left: 18px;
    bottom: max(18px, env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    width: min(410px, calc(100% - 36px));
    min-height: 64px;
    padding: 10px 11px 10px 14px;
    border: 1px solid #CBD5D0;
    border-radius: 8px;
    background: rgba(255,255,255,.96);
    box-shadow: 0 8px 24px rgba(36,52,44,.14);
    backdrop-filter: blur(14px);
  }

  .route-bar div { display: grid; min-width: 0; flex: 1; gap: 4px; padding-right: 10px; }
  .route-bar strong,
  .route-bar span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .route-bar strong { font-size: 13px; line-height: 17px; }
  .route-bar span { color: #68756E; font-size: 11px; line-height: 15px; }
  .route-bar button {
    flex: 0 0 auto;
    min-width: 84px;
    height: 40px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: #1767E8;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
  .route-bar button:hover { background: #0F58CF; }
  .route-bar button.clear { background: #EDF1EF; color: #34413B; }
  .route-bar button.clear:hover { background: #E1E7E4; }
  .route-bar button:focus-visible { outline: 3px solid #8DB8FF; outline-offset: 2px; }

  @keyframes floor-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 560px) {
    .map-header { top: max(12px, env(safe-area-inset-top)); left: 12px; width: 210px; }
    .floor-selector { top: max(12px, env(safe-area-inset-top)); right: 12px; }
    .search-panel {
      top: calc(max(12px, env(safe-area-inset-top)) + 66px);
      left: 12px;
      width: calc(100% - 84px);
      transform: none;
    }
    .space-label { font-size: 18px; stroke-width: 3.5px; }
    .space-label.compact { font-size: 13px; }
    .map-legend { display: none; }
    .route-bar {
      right: 12px;
      bottom: max(12px, env(safe-area-inset-bottom));
      left: 12px;
      width: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .floor-plan { animation: none; }
    .space { transition: none; }
  }
`;
