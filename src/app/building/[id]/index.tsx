import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/shared/components/Icon";
import { Chip } from "@/shared/components/chip";
import { EmptyState } from "@/shared/components/empty-state";
import { theme } from "@/shared/styles";
import { findMockBuilding, type MockCategory } from "@/mocks/campus";

// 시안 2번(건물 상세) — 목데이터 뷰. 와이어프레임 문법: 원형 버튼·회색 일러스트 카드·층 필·칩·리스트 카드.

const CATEGORIES: MockCategory[] = ["전체", "강의실", "시설", "계단·EV"];

function CircleButton({ name, active = false, onPress }: { name: IconName; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.circle, active && styles.circleActive]}>
      <Icon name={name} size={19} color={active ? theme.color.icon.interactive.inverse : theme.color.icon.secondary} />
    </Pressable>
  );
}

export default function BuildingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const building = findMockBuilding(id);
  const [category, setCategory] = useState<MockCategory>("전체");
  const [floorId, setFloorId] = useState(building.defaultFloorId);

  const floor = building.floors.find((f) => f.id === floorId) ?? building.floors[0];
  const highlights = (building.highlights[floor.id] ?? []).filter(
    (p) => category === "전체" || p.category === category
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}>
      <View style={styles.topRow}>
        <CircleButton name="chevron-left" onPress={() => router.back()} />
        <View style={styles.topRight}>
          <CircleButton name="bookmark" />
          <CircleButton name="ellipsis" />
        </View>
      </View>

      <View style={styles.head}>
        <Text style={styles.headLabel}>Building</Text>
        <Text style={styles.headTitle}>{building.name}</Text>
        <Text style={styles.headCount}>현재 {building.placeCount}개의 장소가 등록되어 있습니다</Text>
      </View>

      <View style={styles.illustCard}>
        <Text style={styles.illustPlaceholder}>건물 일러스트{"\n"}(AI 생성 이미지 자리)</Text>
        {building.floors
          .filter((f) => f.placeCount > 0)
          .map((f, i) => {
            const selected = f.id === floor.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFloorId(f.id)}
                style={[styles.floorPill, selected && styles.floorPillSelected, { top: 46 + i * 74, left: selected ? 96 : 150 }]}
              >
                <Text style={[styles.floorPillLabel, selected && styles.floorPillLabelSelected]}>{f.label}</Text>
                <Text style={[styles.floorPillCount, selected && styles.floorPillCountSelected]}>{f.placeCount}</Text>
              </Pressable>
            );
          })}
      </View>

      <View style={styles.actionsRow}>
        <CircleButton name="refresh-cw" />
        <CircleButton name="layers" />
        <CircleButton name="info" active />
        <CircleButton name="locate" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} tone="dark" selected={c === category} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {building.name} · {floor.label}
          </Text>
          <Pressable style={styles.listGo} onPress={() => router.push({ pathname: "/building/[id]/floors", params: { id: building.id } })}>
            <Icon name="chevron-right" size={15} color={theme.color.icon.secondary} />
          </Pressable>
        </View>
        <Text style={styles.listSub}>이 층의 주요 장소</Text>
        {highlights.length === 0 ? (
          <EmptyState type="place" />
        ) : (
          highlights.map((p) => (
            <View key={p.id} style={styles.listItem}>
              <Text style={styles.itemTitle}>{p.title}</Text>
              <Text style={styles.itemMeta}>
                {p.subtitle} · <Text style={styles.itemLink}>지도에서 보기</Text>
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg.primary },
  topRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 },
  topRight: { flexDirection: "row", gap: 10 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.color.bg.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.elevation.shadow8
  },
  circleActive: { backgroundColor: theme.color.bg.interactive.primary },
  head: { paddingHorizontal: 24, marginTop: 22 },
  headLabel: { fontSize: 13, color: theme.color.text.tertiary },
  headTitle: { fontSize: 34, fontWeight: "800", color: theme.color.text.primary, marginTop: 2 },
  headCount: { fontSize: 14, color: theme.color.text.tertiary, marginTop: 6 },
  illustCard: {
    marginHorizontal: 19,
    marginTop: 22,
    height: 320,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.primitive.neutral[100],
    alignItems: "center",
    justifyContent: "center"
  },
  illustPlaceholder: { fontSize: 13, color: theme.color.text.quaternary, textAlign: "center", lineHeight: 20 },
  floorPill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.color.bg.primary,
    ...theme.elevation.shadow8
  },
  floorPillSelected: { backgroundColor: theme.color.bg.interactive.primary },
  floorPillLabel: { fontSize: 13, fontWeight: "700", color: theme.color.text.primary },
  floorPillLabelSelected: { color: theme.color.text.interactive.inverse },
  floorPillCount: { fontSize: 13, fontWeight: "600", color: theme.color.text.tertiary },
  floorPillCountSelected: { color: "rgba(255,255,255,0.75)" },
  actionsRow: { flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 18 },
  chipsRow: { marginTop: 26 },
  chipsContent: { paddingHorizontal: 20, gap: 8 },
  listCard: {
    marginHorizontal: 12,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: theme.color.bg.primary,
    padding: 20,
    ...theme.elevation.shadow8
  },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listTitle: { fontSize: 17, fontWeight: "700", color: theme.color.text.primary },
  listGo: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: theme.color.primitive.neutral[100],
    alignItems: "center",
    justifyContent: "center"
  },
  listSub: { fontSize: 13, color: theme.color.text.tertiary, marginTop: 2 },
  listItem: { marginTop: 14 },
  itemTitle: { fontSize: 15, fontWeight: "600", color: theme.color.text.primary },
  itemMeta: { fontSize: 13, color: theme.color.text.tertiary, marginTop: 3 },
  itemLink: { color: theme.color.text.interactive.primary, fontWeight: "600" }
});
