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
