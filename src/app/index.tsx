import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  type StyleSpecification,
  ViewAnnotation
} from "@maplibre/maplibre-react-native";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ENGINEERING_BUILDING,
  ENGINEERING_CENTER
} from "../data/engineering-building";
import {
  ENGINEERING_FLOOR_BOUNDS,
  ENGINEERING_FLOORS,
  ENGINEERING_FLOOR_SHELL,
  type EngineeringFloor
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

const CAMPUS_CENTER = ENGINEERING_CENTER;
const FLOORS: EngineeringFloor[] = [2, 1];
const DEMO_ROUTE_MINUTES = Math.ceil(
  ENGINEERING_DEMO_ROUTE.estimatedSeconds / 60
);
const DEMO_ROUTE_LINE = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "engineering-1f-demo-route" },
      geometry: {
        type: "LineString",
        coordinates: ENGINEERING_DEMO_ROUTE.points.map(
          toEngineeringRouteCoordinate
        )
      }
    }
  ]
} satisfies GeoJSON.FeatureCollection<GeoJSON.LineString, { id: string }>;
const DEMO_ROUTE_MARKERS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { role: "start", label: "115 출발" },
      geometry: {
        type: "Point",
        coordinates: toEngineeringRouteCoordinate(
          ENGINEERING_DEMO_ROUTE.points[0]
        )
      }
    },
    {
      type: "Feature",
      properties: { role: "destination", label: "107 도착" },
      geometry: {
        type: "Point",
        coordinates: toEngineeringRouteCoordinate(
          ENGINEERING_DEMO_ROUTE.points.at(-1)!
        )
      }
    }
  ]
} satisfies GeoJSON.FeatureCollection<
  GeoJSON.Point,
  { role: "start" | "destination"; label: string }
>;
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const INDOOR_MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "indoor-background",
      type: "background",
      paint: { "background-color": "#E9EEEC" }
    }
  ]
};

export default function CampusMapScreen() {
  const cameraRef = useRef<CameraRef>(null);
  const insets = useSafeAreaInsets();
  const [indoor, setIndoor] = useState(false);
  const [floor, setFloor] = useState<EngineeringFloor>(1);
  const [routeVisible, setRouteVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] =
    useState<EngineeringRoomSearchResult | null>(null);
  const searchResults = searchEngineeringRooms(searchQuery);
  const hasSearchQuery = searchQuery.trim().length > 0;

  const focusRoom = (room: EngineeringRoomSearchResult) => {
    cameraRef.current?.easeTo({
      bearing: 0,
      center: room.center,
      duration: 550,
      padding: { top: 164, right: 28, bottom: 120, left: 28 },
      pitch: 36,
      zoom: 19.4
    });
  };

  const syncCamera = () => {
    if (indoor) {
      if (selectedRoom) {
        focusRoom(selectedRoom);
        return;
      }

      cameraRef.current?.fitBounds(ENGINEERING_FLOOR_BOUNDS, {
        bearing: 0,
        duration: 550,
        padding: { top: 96, right: 52, bottom: 144, left: 12 },
        pitch: 36
      });
      return;
    }

    cameraRef.current?.easeTo({
      bearing: 0,
      center: CAMPUS_CENTER,
      duration: 450,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      pitch: 0,
      zoom: 16
    });
  };

  const openEngineeringBuilding = () => {
    setIndoor(true);
    setFloor(1);
    setRouteVisible(false);
    setSelectedRoom(null);
  };

  const closeEngineeringBuilding = () => {
    setIndoor(false);
    setRouteVisible(false);
    setSelectedRoom(null);
  };

  const showDemoRoute = () => {
    setFloor(ENGINEERING_ROUTE_DEMO.floor);
    setSelectedRoom(null);
    setRouteVisible(true);
  };

  const selectRoom = (room: EngineeringRoomSearchResult) => {
    setIndoor(true);
    setFloor(room.floor);
    setSelectedRoom(room);
    setRouteVisible(false);
    setSearchOpen(false);
    focusRoom(room);
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
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Map
        style={styles.map}
        mapStyle={indoor ? INDOOR_MAP_STYLE : MAP_STYLE}
        attribution={!indoor}
        logo={false}
        onDidFinishLoadingStyle={syncCamera}
        touchPitch={false}
        touchRotate={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: CAMPUS_CENTER,
            zoom: 16
          }}
        />

        {!indoor && (
          <>
            <GeoJSONSource
              id="engineering-building"
              data={ENGINEERING_BUILDING}
              hitbox={{ top: 16, right: 16, bottom: 16, left: 16 }}
              onPress={openEngineeringBuilding}
            >
              <Layer
                id="engineering-building-fill"
                type="fill"
                paint={{
                  "fill-color": "#2F7EF7",
                  "fill-opacity": 0.42
                }}
              />
              <Layer
                id="engineering-building-outline"
                type="line"
                paint={{
                  "line-color": "#165EC8",
                  "line-width": 2
                }}
              />
            </GeoJSONSource>
            <ViewAnnotation
              id="engineering-building-label"
              lngLat={ENGINEERING_CENTER}
              onPress={openEngineeringBuilding}
            >
              <View style={styles.buildingLabel}>
                <Text style={styles.buildingLabelText}>공학관</Text>
              </View>
            </ViewAnnotation>
          </>
        )}

        {indoor && (
          <>
            <GeoJSONSource
              id="engineering-floor-shell"
              data={ENGINEERING_FLOOR_SHELL}
            >
              <Layer
                id="engineering-floor-shell-shadow"
                type="line"
                paint={{
                  "line-blur": 4,
                  "line-color": "#65726C",
                  "line-opacity": 0.2,
                  "line-width": 7
                }}
              />
              <Layer
                id="engineering-floor-shell-fill"
                type="fill"
                paint={{ "fill-color": "#FBFCFC" }}
              />
              <Layer
                id="engineering-floor-shell-outline"
                type="line"
                paint={{
                  "line-color": "#9FAAA5",
                  "line-width": 1.4
                }}
              />
            </GeoJSONSource>

            <GeoJSONSource
              key={`spaces-${floor}`}
              id={`engineering-${floor}f-spaces`}
              data={ENGINEERING_FLOORS[floor].spaces}
            >
              <Layer
                id={`engineering-${floor}f-fill`}
                type="fill-extrusion"
                paint={{
                  "fill-extrusion-base": 0,
                  "fill-extrusion-color": [
                    "match",
                    ["get", "kind"],
                    "corridor",
                    "#FFFFFF",
                    "stairs",
                    "#E8F0FC",
                    "elevator",
                    "#E4F3EA",
                    "#F3F6F5"
                  ],
                  "fill-extrusion-height": [
                    "match",
                    ["get", "kind"],
                    "corridor",
                    0.2,
                    "stairs",
                    1.8,
                    "elevator",
                    4.2,
                    3.2
                  ],
                  "fill-extrusion-opacity": 0.98,
                  "fill-extrusion-vertical-gradient": true
                }}
              />
              <Layer
                id={`engineering-${floor}f-outline`}
                type="line"
                paint={{
                  "line-color": [
                    "match",
                    ["get", "kind"],
                    "corridor",
                    "#D0D7D4",
                    "stairs",
                    "#7396C9",
                    "elevator",
                    "#67A17C",
                    "#B4BFBA"
                  ],
                  "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    17,
                    0.7,
                    19,
                    1.15
                  ]
                }}
              />
              {selectedRoom?.floor === floor && (
                <>
                  <Layer
                    id={`engineering-${floor}f-selected-fill`}
                    type="fill-extrusion"
                    filter={["==", ["get", "id"], selectedRoom.id]}
                    paint={{
                      "fill-extrusion-base": 0,
                      "fill-extrusion-color": "#2478F4",
                      "fill-extrusion-height": 5.4,
                      "fill-extrusion-opacity": 1
                    }}
                  />
                  <Layer
                    id={`engineering-${floor}f-selected-outline`}
                    type="line"
                    filter={["==", ["get", "id"], selectedRoom.id]}
                    paint={{
                      "line-color": "#0B4EB9",
                      "line-width": 3
                    }}
                  />
                </>
              )}
            </GeoJSONSource>

            <GeoJSONSource
              key={`labels-${floor}`}
              id={`engineering-${floor}f-labels`}
              data={ENGINEERING_FLOORS[floor].labels}
            >
              <Layer
                id={`engineering-${floor}f-labels-layer`}
                type="symbol"
                layout={{
                  "text-allow-overlap": false,
                  "text-field": [
                    "case",
                    ["==", ["get", "kind"], "corridor"],
                    "",
                    ["get", "label"]
                  ],
                  "text-font": ["Noto Sans Regular"],
                  "text-padding": 3,
                  "text-pitch-alignment": "viewport",
                  "text-rotation-alignment": "viewport",
                  "text-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    17,
                    8.5,
                    19,
                    12.5
                  ]
                }}
                paint={{
                  "text-color": [
                    "match",
                    ["get", "kind"],
                    "stairs",
                    "#496B9A",
                    "elevator",
                    "#3F7654",
                    "#34413B"
                  ],
                  "text-halo-color": "#FFFFFF",
                  "text-halo-width": 0.8
                }}
              />
              {selectedRoom?.floor === floor && (
                <Layer
                  id={`engineering-${floor}f-selected-label`}
                  type="symbol"
                  filter={["==", ["get", "id"], selectedRoom.id]}
                  layout={{
                    "text-allow-overlap": true,
                    "text-field": ["get", "label"],
                    "text-font": ["Noto Sans Regular"],
                    "text-pitch-alignment": "viewport",
                    "text-rotation-alignment": "viewport",
                    "text-size": 13
                  }}
                  paint={{
                    "text-color": "#FFFFFF",
                    "text-halo-color": "#0B4EB9",
                    "text-halo-width": 1
                  }}
                />
              )}
            </GeoJSONSource>

            {routeVisible && floor === ENGINEERING_ROUTE_DEMO.floor && (
              <>
                <GeoJSONSource
                  id="engineering-demo-route"
                  data={DEMO_ROUTE_LINE}
                >
                  <Layer
                    id="engineering-demo-route-casing"
                    type="line"
                    paint={{
                      "line-color": "#FFFFFF",
                      "line-opacity": 0.96,
                      "line-width": 10
                    }}
                  />
                  <Layer
                    id="engineering-demo-route-line"
                    type="line"
                    paint={{
                      "line-color": "#1767E8",
                      "line-width": 6
                    }}
                  />
                  <Layer
                    id="engineering-demo-route-direction"
                    type="symbol"
                    layout={{
                      "symbol-placement": "line",
                      "symbol-spacing": 54,
                      "text-field": "›",
                      "text-font": ["Noto Sans Regular"],
                      "text-keep-upright": false,
                      "text-size": 15
                    }}
                    paint={{ "text-color": "#FFFFFF" }}
                  />
                </GeoJSONSource>

                <GeoJSONSource
                  id="engineering-demo-route-markers"
                  data={DEMO_ROUTE_MARKERS}
                >
                  <Layer
                    id="engineering-demo-route-marker-circles"
                    type="circle"
                    paint={{
                      "circle-color": [
                        "match",
                        ["get", "role"],
                        "start",
                        "#12A36D",
                        "#E64867"
                      ],
                      "circle-radius": 8,
                      "circle-stroke-color": "#FFFFFF",
                      "circle-stroke-width": 3
                    }}
                  />
                  <Layer
                    id="engineering-demo-route-marker-labels"
                    type="symbol"
                    layout={{
                      "text-anchor": "bottom",
                      "text-field": ["get", "label"],
                      "text-font": ["Noto Sans Regular"],
                      "text-offset": [0, -1.1],
                      "text-size": 11
                    }}
                    paint={{
                      "text-color": "#16211C",
                      "text-halo-color": "#FFFFFF",
                      "text-halo-width": 1.5
                    }}
                  />
                </GeoJSONSource>
              </>
            )}
          </>
        )}
      </Map>

      <View
        pointerEvents="box-none"
        style={[styles.overlay, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.header}>
          {indoor && (
            <Pressable
              accessibilityLabel="캠퍼스 지도로 돌아가기"
              accessibilityRole="button"
              hitSlop={8}
              onPress={closeEngineeringBuilding}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.controlPressed
              ]}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{indoor ? "공학관" : "대국민지도"}</Text>
            <Text style={styles.subtitle}>{indoor ? `${floor}층` : "국민대학교"}</Text>
          </View>
        </View>

        <View style={styles.searchArea}>
          <View style={styles.searchBar}>
            <TextInput
              accessibilityLabel="호실 또는 장소 검색"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(value) => {
                setSearchQuery(value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="호실 또는 장소 검색"
              placeholderTextColor="#7A8580"
              returnKeyType="search"
              style={styles.searchInput}
              value={searchQuery}
            />
            {(hasSearchQuery || selectedRoom) && (
              <Pressable
                accessibilityLabel="검색 초기화"
                accessibilityRole="button"
                hitSlop={6}
                onPress={resetSearch}
                style={({ pressed }) => [
                  styles.searchResetButton,
                  pressed && styles.controlPressed
                ]}
              >
                <Text style={styles.searchResetIcon}>×</Text>
              </Pressable>
            )}
          </View>

          {searchOpen && hasSearchQuery && (
            <View style={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map((room) => (
                  <Pressable
                    key={room.id}
                    accessibilityLabel={`${room.roomNumber}호 ${room.name}, ${room.floor}층`}
                    accessibilityRole="button"
                    onPress={() => selectRoom(room)}
                    style={({ pressed }) => [
                      styles.searchResult,
                      pressed && styles.searchResultPressed
                    ]}
                  >
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultRoom}>{room.roomNumber}호</Text>
                      <Text numberOfLines={1} style={styles.searchResultName}>
                        {room.name}
                      </Text>
                    </View>
                    <Text style={styles.searchResultFloor}>{room.floor}F</Text>
                  </Pressable>
                ))
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsTitle}>검색 결과가 없습니다</Text>
                  <Text style={styles.noResultsText}>
                    호실 번호 또는 장소명을 확인해 주세요.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {indoor && (
          <View style={styles.floorSelector}>
            {FLOORS.map((item) => {
              const selected = item === floor;

              return (
                <Pressable
                  key={item}
                  accessibilityLabel={`공학관 ${item}층`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => changeFloor(item)}
                  style={({ pressed }) => [
                    styles.floorButton,
                    selected && styles.floorButtonSelected,
                    pressed && styles.controlPressed
                  ]}
                >
                  <Text
                    style={[
                      styles.floorButtonText,
                      selected && styles.floorButtonTextSelected
                    ]}
                  >
                    {item}F
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {indoor && (
          <View style={[styles.routeBar, { bottom: insets.bottom + 12 }]}>
            <View style={styles.routeSummary}>
              <Text numberOfLines={1} style={styles.routeTitle}>
                고정 데모 · {ENGINEERING_ROUTE_DEMO.startLabel} → {ENGINEERING_ROUTE_DEMO.destinationLabel}
              </Text>
              <Text numberOfLines={1} style={styles.routeMeta}>
                {routeVisible
                  ? `${Math.round(ENGINEERING_DEMO_ROUTE.distanceMeters)}m · 약 ${DEMO_ROUTE_MINUTES}분`
                  : "공학관 1층 실내 경로"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={routeVisible ? "실내 경로 안내 종료" : "실내 경로 보기"}
              accessibilityRole="button"
              onPress={routeVisible ? () => setRouteVisible(false) : showDemoRoute}
              style={({ pressed }) => [
                styles.routeButton,
                routeVisible && styles.routeButtonClear,
                pressed && styles.controlPressed
              ]}
            >
              <Text
                style={[
                  styles.routeButtonText,
                  routeVisible && styles.routeButtonClearText
                ]}
              >
                {routeVisible ? "안내 종료" : "경로 보기"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5"
  },
  map: {
    flex: 1
  },
  overlay: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 12,
    position: "absolute",
    right: 0,
    top: 0
  },
  header: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderColor: "#D4DBD8",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 8,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: 220,
    elevation: 3
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  searchArea: {
    marginTop: 8,
    maxWidth: 360,
    width: "100%"
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderColor: "#D4DBD8",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 48,
    paddingLeft: 14,
    paddingRight: 6,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  searchInput: {
    color: "#1C2420",
    flex: 1,
    fontSize: 15,
    minHeight: 46,
    paddingVertical: 0
  },
  searchResetButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40
  },
  searchResetIcon: {
    color: "#66716C",
    fontSize: 25,
    lineHeight: 28
  },
  searchResults: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderColor: "#D4DBD8",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  searchResult: {
    alignItems: "center",
    borderBottomColor: "#E6EBE8",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  searchResultPressed: {
    backgroundColor: "#EEF4FD"
  },
  searchResultText: {
    flex: 1,
    minWidth: 0
  },
  searchResultRoom: {
    color: "#1C2420",
    fontSize: 14,
    fontWeight: "700"
  },
  searchResultName: {
    color: "#66716C",
    fontSize: 12,
    marginTop: 2
  },
  searchResultFloor: {
    backgroundColor: "#EAF2FE",
    borderRadius: 5,
    color: "#185FCB",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 10,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  noResults: {
    paddingHorizontal: 14,
    paddingVertical: 16
  },
  noResultsTitle: {
    color: "#25302B",
    fontSize: 14,
    fontWeight: "700"
  },
  noResultsText: {
    color: "#738078",
    fontSize: 12,
    marginTop: 4
  },
  title: {
    color: "#1C2420",
    fontSize: 16,
    fontWeight: "700"
  },
  subtitle: {
    color: "#66716C",
    fontSize: 11,
    marginTop: 2
  },
  backButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40
  },
  backIcon: {
    color: "#1C2420",
    fontSize: 31,
    lineHeight: 33
  },
  buildingLabel: {
    backgroundColor: "#246BDE",
    borderColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  buildingLabelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  floorSelector: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderColor: "#D4DBD8",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  floorButton: {
    alignItems: "center",
    borderBottomColor: "#E2E7E5",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  floorButtonSelected: {
    backgroundColor: "#246BDE"
  },
  floorButtonText: {
    color: "#57625D",
    fontSize: 13,
    fontWeight: "700"
  },
  floorButtonTextSelected: {
    color: "#FFFFFF"
  },
  routeBar: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderColor: "#CBD5D0",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    left: 12,
    minHeight: 62,
    paddingHorizontal: 12,
    position: "absolute",
    right: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4
  },
  routeSummary: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10
  },
  routeTitle: {
    color: "#1C2822",
    fontSize: 13,
    fontWeight: "700"
  },
  routeMeta: {
    color: "#68756E",
    fontSize: 11,
    marginTop: 4
  },
  routeButton: {
    alignItems: "center",
    backgroundColor: "#1767E8",
    borderRadius: 7,
    height: 40,
    justifyContent: "center",
    minWidth: 82,
    paddingHorizontal: 12
  },
  routeButtonClear: {
    backgroundColor: "#EDF1EF"
  },
  routeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  routeButtonClearText: {
    color: "#34413B"
  },
  controlPressed: {
    opacity: 0.65
  }
});
