import assert from "node:assert/strict";

import {
  engineeringRouteToGeoJSON,
  findEngineeringRoute
} from "../src/data/engineering-route.ts";

// Same-floor route: 115 (north-west) -> 107 (north-east inner) on 1F.
const sameFloor = findEngineeringRoute("1f-room-115", "1f-room-107");
assert.equal(sameFloor.segments.length, 1);
assert.equal(sameFloor.segments[0].floor, 1);
assert.equal(sameFloor.distanceMeters, 134);
assert.equal(sameFloor.estimatedSeconds, 104);
assert.deepEqual(
  sameFloor.steps.map((step) => step.kind),
  ["start", "straight", "turn-left", "arrive"]
);
assert.match(sameFloor.steps.at(-1).text, /107호 도착 · 진행 방향 오른쪽/);

// Cross-floor route: 115 (1F) -> 246 (2F) must change floors exactly once.
const crossFloor = findEngineeringRoute("1f-room-115", "2f-room-246");
assert.deepEqual(
  crossFloor.segments.map((segment) => segment.floor),
  [1, 2]
);
const floorChangeSteps = crossFloor.steps.filter(
  (step) => step.kind === "floor-change"
);
assert.equal(floorChangeSteps.length, 1);
assert.equal(floorChangeSteps[0].toFloor, 2);
assert.match(floorChangeSteps[0].text, /계단|엘리베이터/);
assert.equal(crossFloor.steps[0].kind, "start");
assert.equal(crossFloor.steps.at(-1).kind, "arrive");
assert.ok(crossFloor.distanceMeters > sameFloor.distanceMeters);

// Route GeoJSON carries per-floor features for map filtering.
const geo = engineeringRouteToGeoJSON(crossFloor);
assert.equal(geo.lines.features.length, 2);
assert.deepEqual(
  geo.markers.features.map((feature) => feature.properties.role),
  ["start", "floor-change", "destination"]
);

// Center-column room (2F 222) attaches through the center corridor.
const centerRoom = findEngineeringRoute("2f-room-222", "2f-room-208");
assert.equal(centerRoom.segments.length, 1);
assert.ok(
  centerRoom.segments[0].points.some(([x]) => x === 0),
  "expected the path to pass through the center spine"
);

assert.throws(
  () => findEngineeringRoute("1f-room-115", "1f-room-115"),
  /same space/
);
assert.throws(() => findEngineeringRoute("nope", "1f-room-107"), /Unknown/);

console.log(
  `indoor route check passed: 115→107 ${sameFloor.distanceMeters}m/${sameFloor.estimatedSeconds}s, ` +
    `115→246 ${crossFloor.distanceMeters}m (1F→2F), steps ok`
);

// ── 캠퍼스 검색·레지스트리 불변식 ──────────────────────────────────────
// 이 루프가 "새 건물 = 데이터 추가만"의 안전망이다: BUILDINGS에 등록된
// 모든 건물이 자동으로 검증된다.
const { searchPlaces, findPlace, searchFallback } = await import(
  "../src/data/campus-search.ts"
);
const { BUILDINGS } = await import("../src/data/campus.ts");

const buildingHit = searchPlaces("공학관")[0];
assert.equal(buildingHit?.kind, "building", "건물명 검색 최상위는 건물");

const roomHit = searchPlaces("115")[0];
assert.equal(roomHit?.id, "engineering.1f-room-115", "호실 검색 최상위");
assert.equal(findPlace(roomHit.id)?.title, "115호", "findPlace 왕복");

const aliasHit = searchPlaces("공대")[0];
assert.equal(aliasHit?.id, "engineering", "별칭 검색");

const fallback = searchFallback("공학관 999");
assert.equal(fallback.building?.id, "engineering", "폴백 건물 제안");
assert.ok(fallback.similar.length > 0, "폴백 유사 호실 제안");

const buildingIds = new Set();
const placeIds = new Set();
for (const building of BUILDINGS) {
  assert.ok(!buildingIds.has(building.id), `건물 id 중복: ${building.id}`);
  buildingIds.add(building.id);
  assert.ok(building.name.length > 0, `${building.id}: 이름 필수`);
  assert.ok(
    building.outline.coordinates[0].length >= 4,
    `${building.id}: 외곽 폴리곤 최소 4점`
  );

  const indoor = building.indoor;
  if (!indoor) continue;
  assert.ok(indoor.shell.length >= 4, `${building.id}: 셸 최소 4점`);
  assert.ok(indoor.floors.length > 0, `${building.id}: 층 1개 이상`);

  const floorNumbers = new Set();
  for (const { floor, rooms } of indoor.floors) {
    assert.ok(!floorNumbers.has(floor), `${building.id}: 층 중복 ${floor}`);
    floorNumbers.add(floor);
    for (const space of [...indoor.commonSpaces, ...rooms]) {
      const [west, south, east, north] = space.bounds;
      assert.ok(west < east && south < north, `${building.id}/${space.id}: bounds 정합`);
      if (space.kind === "room") {
        assert.ok(space.roomNumber && space.name, `${building.id}/${space.id}: 방 메타 필수`);
        const placeId = `${building.id}.${floor < 0 ? `b${-floor}` : `${floor}f`}-${space.id}`;
        assert.ok(!placeIds.has(placeId), `장소 id 중복: ${placeId}`);
        placeIds.add(placeId);
      }
    }
  }
}

console.log(
  `campus registry check passed: buildings=${BUILDINGS.length}, room places=${placeIds.size}`
);
