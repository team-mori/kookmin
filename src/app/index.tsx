import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  ImageSource,
  Layer,
  Map,
  ViewAnnotation
} from "@maplibre/maplibre-react-native";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ENGINEERING_BUILDING,
  ENGINEERING_CENTER,
  ENGINEERING_FLOOR_BOUNDS,
  ENGINEERING_FLOOR_COORDINATES,
  ENGINEERING_FLOOR_IMAGES,
  type EngineeringFloor
} from "../data/engineering-building";

const CAMPUS_CENTER: [number, number] = [126.9964, 37.6118];
const FLOORS: EngineeringFloor[] = [2, 1];

export default function CampusMapScreen() {
  const cameraRef = useRef<CameraRef>(null);
  const insets = useSafeAreaInsets();
  const [indoor, setIndoor] = useState(false);
  const [floor, setFloor] = useState<EngineeringFloor>(1);

  const openEngineeringBuilding = () => {
    setIndoor(true);
    setFloor(1);
    cameraRef.current?.fitBounds(ENGINEERING_FLOOR_BOUNDS, {
      duration: 550,
      padding: { top: 116, right: 72, bottom: 64, left: 24 }
    });
  };

  const closeEngineeringBuilding = () => {
    setIndoor(false);
    cameraRef.current?.easeTo({
      center: CAMPUS_CENTER,
      zoom: 16,
      duration: 450
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Map
        style={styles.map}
        mapStyle="https://demotiles.maplibre.org/style.json"
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

        <GeoJSONSource
          id="engineering-building"
          data={ENGINEERING_BUILDING}
          hitbox={{ top: 16, right: 16, bottom: 16, left: 16 }}
          onPress={indoor ? undefined : openEngineeringBuilding}
        >
          <Layer
            id="engineering-building-fill"
            type="fill"
            paint={{
              "fill-color": "#2F7EF7",
              "fill-opacity": indoor ? 0 : 0.42
            }}
          />
          <Layer
            id="engineering-building-outline"
            type="line"
            paint={{
              "line-color": "#165EC8",
              "line-opacity": indoor ? 0 : 1,
              "line-width": 2
            }}
          />
        </GeoJSONSource>

        {!indoor && (
          <ViewAnnotation
            id="engineering-building-label"
            lngLat={ENGINEERING_CENTER}
            onPress={openEngineeringBuilding}
          >
            <View style={styles.buildingLabel}>
              <Text style={styles.buildingLabelText}>공학관</Text>
            </View>
          </ViewAnnotation>
        )}

        {indoor && (
          <ImageSource
            key={floor}
            id={`engineering-${floor}f`}
            url={ENGINEERING_FLOOR_IMAGES[floor]}
            coordinates={ENGINEERING_FLOOR_COORDINATES}
          >
            <Layer
              id={`engineering-${floor}f-raster`}
              type="raster"
              paint={{ "raster-opacity": 1 }}
            />
          </ImageSource>
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

        <View
          style={[
            styles.sourceBadge,
            { marginBottom: Math.max(insets.bottom, 8) }
          ]}
        >
          <Text style={styles.sourceText}>
            {indoor
              ? "도면: 국민대학교 공과대학"
              : "건물 윤곽: OpenStreetMap contributors"}
          </Text>
        </View>
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
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
    top: 0
  },
  header: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE2E6",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4
  },
  title: {
    color: "#171A1C",
    fontSize: 17,
    fontWeight: "700"
  },
  subtitle: {
    color: "#687078",
    fontSize: 12,
    marginTop: 2
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44
  },
  backIcon: {
    color: "#171A1C",
    fontSize: 34,
    lineHeight: 36
  },
  buildingLabel: {
    backgroundColor: "#171A1C",
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
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE2E6",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  floorButton: {
    alignItems: "center",
    borderBottomColor: "#E7EAED",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  floorButtonSelected: {
    backgroundColor: "#171A1C"
  },
  floorButtonText: {
    color: "#515960",
    fontSize: 14,
    fontWeight: "700"
  },
  floorButtonTextSelected: {
    color: "#FFFFFF"
  },
  controlPressed: {
    opacity: 0.65
  },
  sourceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 4,
    marginTop: "auto",
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  sourceText: {
    color: "#687078",
    fontSize: 10
  }
});
