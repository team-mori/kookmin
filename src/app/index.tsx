import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  type PressEventWithFeatures,
  type ViewStateChangeEvent
} from "@maplibre/maplibre-react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import type { NativeSyntheticEvent } from "react-native";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/shared/components/Icon";
import { EmptyState } from "@/shared/components/empty-state";
import { theme } from "@/shared/styles";

import {
  buildingNear,
  CAMPUS_BUILDINGS_GEOJSON,
  CAMPUS_LABELS_GEOJSON,
  findBuilding,
  floorLabel,
  SHARE_BASE_URL
} from "../data/campus";
import { indoorDataFor } from "../data/indoor-geometry";
import type { EngineeringFloor } from "../data/buildings/engineering";
import {
  engineeringRouteToGeoJSON,
  findEngineeringRoute,
  toEngineeringRouteCoordinate,
  type IndoorRoute,
  type IndoorRouteStep
} from "../data/engineering-route";
import {
  findEngineeringRoom,
  parsePlaceId,
  placeIdFor,
  searchFallback,
  searchPlaces,
  type EngineeringRoomSearchResult
} from "../data/campus-search";
import type { Place } from "../data/campus-types";
import {
  BUILDING_CAMERA,
  CAMPUS_CAMERA,
  EASE_DURATION_MS,
  EMPTY_FEATURE_COLLECTION,
  FLY_DURATION_MS,
  INDOOR_UI_ZOOM,
  MAP_STYLE_URL,
  ROOM_PITCH,
  ROOM_ZOOM,
  STEP_ZOOM,
  buildingLabelLayerSpecs,
  buildingLayerSpecs,
  floorLabelLayerSpecs,
  floorShellLayerSpecs,
  floorSpaceLayerSpecs,
  routeLineLayerSpecs,
  routeMarkerLayerSpecs
} from "../map/campus-map-spec";

const STEP_ICONS: Record<IndoorRouteStep["kind"], string> = {
  start: "◉",
  straight: "↑",
  "turn-left": "↰",
  "turn-right": "↱",
  "floor-change": "⇅",
  arrive: "◎"
};

const roomTitle = (room: EngineeringRoomSearchResult) => `${room.roomNumber}호`;

export default function CampusMapScreen() {
  const cameraRef = useRef<CameraRef>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [floor, setFloor] = useState<EngineeringFloor>(1);
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
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

  const searchResults = searchPlaces(searchQuery);
  const hasSearchQuery = searchQuery.trim().length > 0;
  const fallback =
    hasSearchQuery && searchResults.length === 0
      ? searchFallback(searchQuery)
      : null;

  const activeBuilding = activeBuildingId
    ? findBuilding(activeBuildingId)
    : undefined;
  const activeIndoor = activeBuilding ? indoorDataFor(activeBuilding) : null;
  const floorList = activeIndoor
    ? [...activeIndoor.floors.keys()].sort((a, b) => b - a)
    : [];
  const activeFloorData = activeIndoor?.floors.get(floor);

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

  const focusRoom = (room: EngineeringRoomSearchResult) => {
    cameraRef.current?.flyTo({
      center: room.center,
      duration: FLY_DURATION_MS,
      padding: { top: 164, right: 28, bottom: 200, left: 28 },
      pitch: ROOM_PITCH,
      zoom: ROOM_ZOOM
    });
  };

  const backToCampus = () => {
    setSelectedRoom(null);
    setActiveBuildingId(null);
    cameraRef.current?.easeTo({
      ...CAMPUS_CAMERA,
      duration: 900,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    });
  };

  const handleRegionChange = (
    event: NativeSyntheticEvent<ViewStateChangeEvent>
  ) => {
    const { zoom, center } = event.nativeEvent;
    // Hysteresis so the chrome doesn't flicker right at the threshold.
    setIndoorVisible((visible) =>
      zoom >= INDOOR_UI_ZOOM ? true : zoom <= INDOOR_UI_ZOOM - 0.3 ? false : visible
    );
    // 수동 핀치줌으로 실내에 들어오면 카메라 중심에서 가장 가까운 실내 건물을 편다.
    if (zoom >= INDOOR_UI_ZOOM) {
      setActiveBuildingId(
        (current) =>
          current ?? buildingNear(center as [number, number])?.id ?? null
      );
    }
  };

  const selectRoom = (room: EngineeringRoomSearchResult, fly = true) => {
    // 검색 인덱스는 아직 공학관 전용 (4단계에서 캠퍼스 전역으로 확장).
    setActiveBuildingId("engineering");
    setFloor(room.floor);
    setSelectedRoom(room);
    setSearchOpen(false);
    if (fly) focusRoom(room);
  };

  const handleBuildingPress = () => {
    // 시안 흐름: 캠퍼스 뷰에서 건물 탭 → 건물 상세 화면. 실내 진입은 상세의 [보러 가기]로.
    if (!indoorVisible) {
      router.push({ pathname: "/building/[id]", params: { id: "engineering" } });
    }
  };

  const selectPlace = (place: Place) => {
    if (place.kind === "room") {
      const { spaceId } = parsePlaceId(place.id);
      const room = spaceId ? findEngineeringRoom(spaceId) : undefined;
      if (room) selectRoom(room);
      return;
    }
    setSearchOpen(false);
    if (place.kind === "building") {
      router.push({ pathname: "/building/[id]", params: { id: place.id } });
      return;
    }
    cameraRef.current?.flyTo({
      center: place.center,
      duration: FLY_DURATION_MS,
      zoom: 16.5
    });
  };

  const shareRoom = (room: EngineeringRoomSearchResult) => {
    // 명세 2.6 공유 링크 — 배포 전에는 SHARE_BASE_URL이 자리표시 도메인이다.
    void Share.share({
      message: `${SHARE_BASE_URL}/place/${placeIdFor("engineering", room.id)}`
    });
  };

  const handleSpacePress = (
    event: NativeSyntheticEvent<PressEventWithFeatures>
  ) => {
    if (!indoorVisible) return;
    const feature = event.nativeEvent.features.find(
      (item) => item.properties?.kind === "room"
    );
    const roomId = feature?.properties?.id;
    const room = typeof roomId === "string" ? findEngineeringRoom(roomId) : null;
    if (!room) return;

    setFloor(room.floor);
    setSelectedRoom(room);
    cameraRef.current?.easeTo({
      center: room.center,
      duration: EASE_DURATION_MS,
      padding: { top: 164, right: 28, bottom: 200, left: 28 }
    });
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
    cameraRef.current?.easeTo({
      center: toEngineeringRouteCoordinate(step.focusXY),
      duration: EASE_DURATION_MS,
      padding: { top: 120, right: 28, bottom: 320, left: 28 },
      pitch: ROOM_PITCH,
      zoom: STEP_ZOOM
    });
  };

  const changeFloor = (nextFloor: EngineeringFloor) => {
    setFloor(nextFloor);
    if (selectedRoom && selectedRoom.floor !== nextFloor) setSelectedRoom(null);
  };

  const selectedRoomId =
    selectedRoom && selectedRoom.floor === floor ? selectedRoom.id : null;
  const pendingLabel = originRoom && !destinationRoom
    ? { chip: `출발 ${roomTitle(originRoom)}`, hint: "도착지를 선택하세요" }
    : destinationRoom && !originRoom
      ? { chip: `도착 ${roomTitle(destinationRoom)}`, hint: "출발지를 선택하세요" }
      : null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        logo={false}
        onRegionIsChanging={handleRegionChange}
        onRegionDidChange={handleRegionChange}
        touchPitch={false}
        touchRotate={false}
      >
        <Camera ref={cameraRef} initialViewState={CAMPUS_CAMERA} />

        <GeoJSONSource
          id="engineering-building"
          data={CAMPUS_BUILDINGS_GEOJSON}
          hitbox={{ top: 16, right: 16, bottom: 16, left: 16 }}
          onPress={handleBuildingPress}
        >
          {buildingLayerSpecs().map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>

        <GeoJSONSource
          id="engineering-floor-shell"
          data={activeIndoor?.shell ?? EMPTY_FEATURE_COLLECTION}
        >
          {floorShellLayerSpecs().map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>

        <GeoJSONSource
          id="engineering-floor-spaces"
          data={activeFloorData?.spaces ?? EMPTY_FEATURE_COLLECTION}
          onPress={handleSpacePress}
        >
          {floorSpaceLayerSpecs(selectedRoomId).map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>

        <GeoJSONSource
          id="engineering-route-lines"
          data={routeGeoJSON?.lines ?? EMPTY_FEATURE_COLLECTION}
        >
          {routeLineLayerSpecs(floor).map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>

        <GeoJSONSource
          id="engineering-floor-labels"
          data={activeFloorData?.labels ?? EMPTY_FEATURE_COLLECTION}
        >
          {floorLabelLayerSpecs(selectedRoomId).map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>

        <GeoJSONSource
          id="engineering-route-markers"
          data={routeGeoJSON?.markers ?? EMPTY_FEATURE_COLLECTION}
        >
          {routeMarkerLayerSpecs(floor).map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>

        <GeoJSONSource
          id="engineering-building-label"
          data={CAMPUS_LABELS_GEOJSON}
          hitbox={{ top: 20, right: 20, bottom: 20, left: 20 }}
          onPress={handleBuildingPress}
        >
          {buildingLabelLayerSpecs().map((spec) => (
            <Layer key={spec.id} {...spec} />
          ))}
        </GeoJSONSource>
      </Map>

      <View
        pointerEvents="box-none"
        style={[styles.overlay, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.header}>
          {indoorVisible && (
            <Pressable
              accessibilityLabel="캠퍼스 지도로 돌아가기"
              accessibilityRole="button"
              hitSlop={8}
              onPress={backToCampus}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.controlPressed
              ]}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {indoorVisible ? activeBuilding?.name ?? "대국민지도" : "대국민지도"}
            </Text>
            <Text style={styles.subtitle}>
              {indoorVisible ? `${floorLabel(floor)} 실내지도` : "국민대학교"}
            </Text>
          </View>
        </View>

        <View style={styles.searchArea}>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={theme.color.icon.tertiary} />
            <TextInput
              accessibilityLabel="호실 또는 장소 검색"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(value) => {
                setSearchQuery(value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="건물 또는 호실을 검색해보세요"
              placeholderTextColor={theme.color.text.quaternary}
              returnKeyType="search"
              style={styles.searchInput}
              value={searchQuery}
            />
            {hasSearchQuery || selectedRoom ? (
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
                <Icon name="x" size={18} color={theme.color.icon.tertiary} />
              </Pressable>
            ) : (
              <View style={styles.searchAvatar}>
                <Text style={styles.searchAvatarLabel}>K</Text>
              </View>
            )}
          </View>

          {searchOpen && hasSearchQuery && (
            <View style={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map((place) => (
                  <Pressable
                    key={place.id}
                    accessibilityLabel={`${place.title} ${place.subtitle ?? ""}`}
                    accessibilityRole="button"
                    onPress={() => selectPlace(place)}
                    style={({ pressed }) => [
                      styles.searchResult,
                      pressed && styles.searchResultPressed
                    ]}
                  >
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultRoom}>{place.title}</Text>
                      <Text numberOfLines={1} style={styles.searchResultName}>
                        {place.subtitle ?? ""}
                      </Text>
                    </View>
                    {place.kind === "room" && place.floor !== undefined && (
                      <Text style={styles.searchResultFloor}>
                        {floorLabel(place.floor)}
                      </Text>
                    )}
                  </Pressable>
                ))
              ) : (
                <View>
                  <EmptyState type="search" />
                  {fallback?.building && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => selectPlace(fallback.building!)}
                      style={({ pressed }) => [
                        styles.searchResult,
                        pressed && styles.searchResultPressed
                      ]}
                    >
                      <View style={styles.searchResultText}>
                        <Text style={styles.searchResultRoom}>
                          {fallback.building.title}
                        </Text>
                        <Text style={styles.searchResultName}>
                          건물로 이동
                        </Text>
                      </View>
                    </Pressable>
                  )}
                  {fallback && fallback.similar.length > 0 && (
                    <>
                      <Text style={styles.fallbackHint}>
                        혹시 이 장소를 찾으세요?
                      </Text>
                      {fallback.similar.map((place) => (
                        <Pressable
                          key={place.id}
                          accessibilityRole="button"
                          onPress={() => selectPlace(place)}
                          style={({ pressed }) => [
                            styles.searchResult,
                            pressed && styles.searchResultPressed
                          ]}
                        >
                          <View style={styles.searchResultText}>
                            <Text style={styles.searchResultRoom}>
                              {place.title}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={styles.searchResultName}
                            >
                              {place.subtitle ?? ""}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {indoorVisible && floorList.length > 0 && (
          <View style={styles.floorSelector}>
            {floorList.map((item) => {
              const selected = item === floor;

              return (
                <Pressable
                  key={item}
                  accessibilityLabel={`${activeBuilding?.name ?? ""} ${floorLabel(item)}`}
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
                    {floorLabel(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {pendingLabel && !route && (
          <View style={styles.pendingChip}>
            <Text numberOfLines={1} style={styles.pendingChipText}>
              {pendingLabel.chip} · {pendingLabel.hint}
            </Text>
            <Pressable
              accessibilityLabel="경로 선택 취소"
              accessibilityRole="button"
              hitSlop={6}
              onPress={clearRoute}
              style={({ pressed }) => pressed && styles.controlPressed}
            >
              <Text style={styles.pendingChipClose}>×</Text>
            </Pressable>
          </View>
        )}

        {selectedRoom && !route && (
          <View style={[styles.roomCard, { bottom: insets.bottom + 12 }]}>
            <View style={styles.roomCardText}>
              <Text style={styles.roomCardTitle}>
                {roomTitle(selectedRoom)}
              </Text>
              <Text numberOfLines={1} style={styles.roomCardMeta}>
                {selectedRoom.name} · 공학관 {selectedRoom.floor}층
              </Text>
            </View>
            <Pressable
              accessibilityLabel={`${roomTitle(selectedRoom)} 출발지로 설정`}
              accessibilityRole="button"
              onPress={() => setAsOrigin(selectedRoom)}
              style={({ pressed }) => [
                styles.roomCardButton,
                styles.roomCardButtonGhost,
                pressed && styles.controlPressed
              ]}
            >
              <Text style={styles.roomCardButtonGhostText}>출발</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`${roomTitle(selectedRoom)} 도착지로 설정`}
              accessibilityRole="button"
              onPress={() => setAsDestination(selectedRoom)}
              style={({ pressed }) => [
                styles.roomCardButton,
                pressed && styles.controlPressed
              ]}
            >
              <Text style={styles.roomCardButtonText}>도착</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`${roomTitle(selectedRoom)} 공유`}
              accessibilityRole="button"
              onPress={() => shareRoom(selectedRoom)}
              style={({ pressed }) => [
                styles.roomCardShare,
                pressed && styles.controlPressed
              ]}
            >
              <Icon name="share" size={17} color={theme.color.icon.secondary} />
            </Pressable>
            <Pressable
              accessibilityLabel="호실 정보 닫기"
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => setSelectedRoom(null)}
              style={({ pressed }) => [
                styles.roomCardClose,
                pressed && styles.controlPressed
              ]}
            >
              <Text style={styles.roomCardCloseIcon}>×</Text>
            </Pressable>
          </View>
        )}

        {route && (
          <View style={[styles.routePanel, { bottom: insets.bottom + 12 }]}>
            <View style={styles.routeSummaryRow}>
              <View style={styles.routeSummary}>
                <Text numberOfLines={1} style={styles.routeTitle}>
                  {route.start.roomNumber}호 → {route.destination.roomNumber}호
                </Text>
                <Text numberOfLines={1} style={styles.routeMeta}>
                  {route.distanceMeters}m · 약 {routeMinutes}분
                  {route.segments.length > 1 ? " · 층간 이동 포함" : ""}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="경로 안내 종료"
                accessibilityRole="button"
                onPress={clearRoute}
                style={({ pressed }) => [
                  styles.routeEndButton,
                  pressed && styles.controlPressed
                ]}
              >
                <Text style={styles.routeEndButtonText}>종료</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.stepList}
              contentContainerStyle={styles.stepListContent}
            >
              {route.steps.map((step, index) => {
                const active = index === activeStep;

                return (
                  <Pressable
                    key={`${index}-${step.kind}`}
                    accessibilityLabel={step.text}
                    accessibilityRole="button"
                    onPress={() => focusStep(index)}
                    style={({ pressed }) => [
                      styles.stepRow,
                      active && styles.stepRowActive,
                      pressed && styles.controlPressed
                    ]}
                  >
                    <Text
                      style={[styles.stepIcon, active && styles.stepIconActive]}
                    >
                      {STEP_ICONS[step.kind]}
                    </Text>
                    <Text
                      style={[styles.stepText, active && styles.stepTextActive]}
                    >
                      {step.text}
                    </Text>
                    <Text style={styles.stepFloor}>{step.floor}F</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
    backgroundColor: theme.color.bg.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingLeft: 16,
    paddingRight: 10,
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
  searchAvatar: {
    alignItems: "center",
    backgroundColor: theme.color.bg.interactive.selected,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  searchAvatarLabel: {
    color: theme.color.text.interactive.primary,
    fontSize: 14,
    fontWeight: "700"
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
  fallbackHint: {
    color: theme.color.text.tertiary,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 14,
    paddingBottom: 4,
    paddingTop: 10
  },
  searchResultFloor: {
    backgroundColor: theme.color.bg.interactive.selected,
    borderRadius: 999,
    color: theme.color.text.interactive.primary,
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
  pendingChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#123E8F",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3
  },
  pendingChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700"
  },
  pendingChipClose: {
    color: "#B9CDF2",
    fontSize: 17,
    lineHeight: 18
  },
  roomCardShare: {
    alignItems: "center",
    backgroundColor: theme.color.primitive.neutral[100],
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  roomCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderColor: "#CBD5D0",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    left: 12,
    minHeight: 66,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: "absolute",
    right: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4
  },
  roomCardText: {
    flex: 1,
    minWidth: 0
  },
  roomCardTitle: {
    color: "#16211C",
    fontSize: 16,
    fontWeight: "800"
  },
  roomCardMeta: {
    color: "#68756E",
    fontSize: 12,
    marginTop: 2
  },
  roomCardButton: {
    alignItems: "center",
    backgroundColor: "#1767E8",
    borderRadius: 7,
    height: 40,
    justifyContent: "center",
    minWidth: 56,
    paddingHorizontal: 12
  },
  roomCardButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  roomCardButtonGhost: {
    backgroundColor: "#EAF2FE"
  },
  roomCardButtonGhostText: {
    color: "#185FCB",
    fontSize: 13,
    fontWeight: "700"
  },
  roomCardClose: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 32
  },
  roomCardCloseIcon: {
    color: "#66716C",
    fontSize: 24,
    lineHeight: 26
  },
  routePanel: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderColor: "#CBD5D0",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    left: 12,
    overflow: "hidden",
    position: "absolute",
    right: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4
  },
  routeSummaryRow: {
    alignItems: "center",
    borderBottomColor: "#E4E9E6",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  routeSummary: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10
  },
  routeTitle: {
    color: "#1C2822",
    fontSize: 14,
    fontWeight: "800"
  },
  routeMeta: {
    color: "#68756E",
    fontSize: 11,
    marginTop: 3
  },
  routeEndButton: {
    alignItems: "center",
    backgroundColor: "#EDF1EF",
    borderRadius: 7,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  routeEndButtonText: {
    color: "#34413B",
    fontSize: 12,
    fontWeight: "700"
  },
  stepList: {
    maxHeight: 236
  },
  stepListContent: {
    paddingVertical: 4
  },
  stepRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  stepRowActive: {
    backgroundColor: "#EEF4FD"
  },
  stepIcon: {
    color: "#5A6660",
    fontSize: 16,
    textAlign: "center",
    width: 22
  },
  stepIconActive: {
    color: "#1767E8"
  },
  stepText: {
    color: "#25302B",
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  stepTextActive: {
    color: "#123E8F",
    fontWeight: "700"
  },
  stepFloor: {
    color: "#8B968F",
    fontSize: 11,
    fontWeight: "700"
  },
  controlPressed: {
    opacity: 0.65
  }
});
