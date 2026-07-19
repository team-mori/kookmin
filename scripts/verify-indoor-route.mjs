import assert from "node:assert/strict";

import {
  ENGINEERING_DEMO_ROUTE,
  ENGINEERING_ROUTE_DEMO,
  shortestIndoorRoute
} from "../src/data/engineering-route.ts";

assert.deepEqual(ENGINEERING_DEMO_ROUTE.nodeIds, [
  "door-115",
  "north-west",
  "north-center",
  "north-east",
  "door-107"
]);
assert.equal(ENGINEERING_DEMO_ROUTE.distanceMeters, 124);
assert.equal(ENGINEERING_DEMO_ROUTE.estimatedSeconds, 96);
assert.equal(ENGINEERING_ROUTE_DEMO.floor, 1);
assert.throws(
  () => shortestIndoorRoute(
    [{ id: "a", planXY: [0, 0] }, { id: "b", planXY: [1, 0] }],
    [],
    "a",
    "b"
  ),
  /No indoor route found/
);

console.log("indoor route check passed: 115 -> 107, 124m, 96s");
