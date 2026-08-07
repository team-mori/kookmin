import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/shared/components/Icon";
import { ElevationBuilding } from "@/shared/components/building-art";
import { Chip } from "@/shared/components/chip";
import { Button } from "@/shared/components/input/Button";
import { BottomActionBar } from "@/shared/components/input/BottomActionBar";
import { theme } from "@/shared/styles";
import { findMockBuilding, type MockCategory } from "@/mocks/campus";

// 시안 3번(층 선택 입면) — 목데이터 뷰. 하늘 배경 + 입면 일러스트 자리 + 층 배지 + 검정 CTA.

const CATEGORIES: MockCategory[] = ["전체", "강의실", "시설", "계단·EV"];

export default function BuildingFloorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const building = findMockBuilding(id);
  const [category, setCategory] = useState<MockCategory>("전체");
  const [floorId, setFloorId] = useState(building.defaultFloorId);

  return (
    <View style={styles.root}>
      <View style={[styles.sky, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
            <Icon name="chevron-left" size={22} color={theme.color.icon.primary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>대국민지도</Text>
            <Text style={styles.headerSub}>{building.name} 실내지도</Text>
          </View>
          <Icon name="ellipsis-vertical" size={19} color={theme.color.icon.primary} />
        </View>

        <View style={styles.elevation}>
          <ElevationBuilding width={321} height={331} />
          {building.floors.map((f, i) => {
            const selected = f.id === floorId;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFloorId(f.id)}
                style={[styles.floorBadge, selected && styles.floorBadgeSelected, { top: 28 + i * 96, left: 60 + (i % 2) * 120 }]}
              >
                <Text style={[styles.floorBadgeLabel, selected && styles.floorBadgeLabelSelected]}>
                  {f.placeCount > 0 ? `${f.label} · ${f.placeCount}` : f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.locRow}>
        <View>
          <View style={styles.locKeyRow}>
            <Icon name="map-pin" size={12} color={theme.color.icon.tertiary} />
            <Text style={styles.locKey}>위치 정보</Text>
          </View>
          <Text style={styles.locValue}>{building.name}</Text>
        </View>
        <Pressable accessibilityRole="button" style={styles.locLinkRow}>
          <Text style={styles.locLink}>지도에서 위치 확인</Text>
          <Icon name="chevron-right" size={14} color={theme.color.icon.interactive.primary} />
        </Pressable>
      </View>

      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} tone="brand" selected={c === category} onPress={() => setCategory(c)} />
        ))}
      </View>

      <View style={styles.spacer} />

      <BottomActionBar>
        {/* ponytail: 지금은 캠퍼스 뷰로 복귀만 — place 파람 기반 실내 자동 진입은 딥링크 단계에서 */}
        <Button label="보러 가기" type="cta" size={52} onPress={() => router.push("/")} />
      </BottomActionBar>
      <View style={{ height: insets.bottom + 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg.primary },
  sky: { backgroundColor: theme.color.primitive.blue[50], paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: theme.color.text.primary },
  headerSub: { fontSize: 12, color: theme.color.text.tertiary, marginTop: 2 },
  elevation: {
    marginHorizontal: 24,
    marginTop: 16,
    height: 340,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center"
  },
  elevationPlaceholder: { fontSize: 13, color: theme.color.text.quaternary, textAlign: "center", lineHeight: 20 },
  floorBadge: {
    position: "absolute",
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.color.bg.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.elevation.shadow8
  },
  floorBadgeSelected: { backgroundColor: theme.color.bg.interactive.primary },
  floorBadgeLabel: { fontSize: 14, fontWeight: "700", color: theme.color.text.primary },
  floorBadgeLabelSelected: { color: theme.color.text.interactive.inverse },
  locRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.primitive.neutral[100]
  },
  locKeyRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locKey: { fontSize: 11, color: theme.color.text.tertiary },
  locValue: { fontSize: 15, fontWeight: "700", color: theme.color.text.primary, marginTop: 3 },
  locLinkRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  locLink: { fontSize: 13, fontWeight: "600", color: theme.color.text.interactive.primary },
  chips: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16, paddingHorizontal: 20 },
  spacer: { flex: 1 }
});
