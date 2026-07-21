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
import { Pressable, StyleSheet, Text, View } from "react-native";
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

const CAMPUS_CENTER = ENGINEERING_CENTER;
const FLOORS: EngineeringFloor[] = [2, 1];
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

  const syncCamera = () => {
    if (indoor) {
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
  };

  const closeEngineeringBuilding = () => {
    setIndoor(false);
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
            </GeoJSONSource>
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
                  onPress={() => setFloor(item)}
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
  controlPressed: {
    opacity: 0.65
  }
});
