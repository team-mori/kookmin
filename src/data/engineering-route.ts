import {
  ENGINEERING_SPACES,
  type EngineeringFloor,
  type EngineeringSpaceInfo
} from "./engineering-floors.ts";

export type PlanPoint = readonly [x: number, y: number];

export type IndoorRouteNode = {
  id: string;
  floor: EngineeringFloor;
  planXY: PlanPoint;
};

export type IndoorRouteEdge = {
  from: string;
  to: string;
  meters: number;
  floorChange?: {
    via: "stairs" | "elevator";
    label: string;
  };
};

export type IndoorRouteStepKind =
  | "start"
  | "straight"
  | "turn-left"
  | "turn-right"
  | "floor-change"
  | "arrive";

export type IndoorRouteStep = {
  kind: IndoorRouteStepKind;
  text: string;
  floor: EngineeringFloor;
  meters?: number;
  toFloor?: EngineeringFloor;
  focusXY: PlanPoint;
};

export type IndoorRouteSegment = {
  floor: EngineeringFloor;
  points: PlanPoint[];
};

export type IndoorRoute = {
  start: EngineeringSpaceInfo;
  destination: EngineeringSpaceInfo;
  segments: IndoorRouteSegment[];
  steps: IndoorRouteStep[];
  distanceMeters: number;
  estimatedSeconds: number;
};

const METERS_PER_LATITUDE_DEGREE = 111_320;
const ROUTE_RENDER_ANCHOR = [126.99403, 37.61184] as const;
const METERS_PER_LONGITUDE_DEGREE =
  METERS_PER_LATITUDE_DEGREE *
  Math.cos((ROUTE_RENDER_ANCHOR[1] * Math.PI) / 180);

export const toEngineeringRouteCoordinate = (
  [x, y]: PlanPoint
): [number, number] => [
  ROUTE_RENDER_ANCHOR[0] + x / METERS_PER_LONGITUDE_DEGREE,
  ROUTE_RENDER_ANCHOR[1] + y / METERS_PER_LATITUDE_DEGREE
];

// Corridor centerlines the whole graph hangs off: two horizontal spines and
// one vertical connector through the center corridor.
const NORTH_SPINE_Y = 28;
const SOUTH_SPINE_Y = -28;
const CENTER_SPINE_X = 0;
const SPINE_X_LIMIT = 62;
// ponytail: fixed cost per floor change; elevator costs more than stairs to
// model waiting time, so short trips prefer stairs. Tune when real data lands.
const FLOOR_CHANGE_METERS = { stairs: 14, elevator: 20 } as const;
const FLOOR_CHANGE_EXTRA_SECONDS = 35;
const WALK_SPEED_METERS_PER_SECOND = 1.3;

const clampSpineX = (x: number) =>
  Math.min(SPINE_X_LIMIT, Math.max(-SPINE_X_LIMIT, x));

const spaceCenter = (space: EngineeringSpaceInfo): PlanPoint => {
  const [west, south, east, north] = space.bounds;
  return [(west + east) / 2, (south + north) / 2];
};

// Door on the corridor-facing edge plus its foot point on a spine.
const doorAndFoot = (
  space: EngineeringSpaceInfo
): { door: PlanPoint; foot: PlanPoint } => {
  const [west, south, east, north] = space.bounds;
  const [cx, cy] = spaceCenter(space);

  if (cy >= 29) {
    const x = clampSpineX(cx);
    return { door: [x, south], foot: [x, NORTH_SPINE_Y] };
  }
  if (cy <= -29) {
    const x = clampSpineX(cx);
    return { door: [x, north], foot: [x, SOUTH_SPINE_Y] };
  }

  const horizontalSpineY = cy >= 0 ? NORTH_SPINE_Y : SOUTH_SPINE_Y;
  const horizontalDoorY = cy >= 0 ? north : south;
  const horizontalLength = Math.abs(horizontalSpineY - horizontalDoorY);
  const touchesCenterWest = Math.abs(east - -8) < 0.6;
  const touchesCenterEast = Math.abs(west - 8) < 0.6;
  const centerDoorX = touchesCenterWest ? east : west;

  if (
    (touchesCenterWest || touchesCenterEast) &&
    Math.abs(CENTER_SPINE_X - centerDoorX) < horizontalLength
  ) {
    return { door: [centerDoorX, cy], foot: [CENTER_SPINE_X, cy] };
  }

  const x = clampSpineX(cx);
  return { door: [x, horizontalDoorY], foot: [x, horizontalSpineY] };
};

type IndoorGraph = {
  nodes: Map<string, IndoorRouteNode>;
  edges: IndoorRouteEdge[];
  doorNodeBySpace: Map<string, string>;
  spaceById: Map<string, EngineeringSpaceInfo>;
};

const buildGraph = (): IndoorGraph => {
  const nodes = new Map<string, IndoorRouteNode>();
  const edges: IndoorRouteEdge[] = [];
  const doorNodeBySpace = new Map<string, string>();
  const spaceById = new Map(
    ENGINEERING_SPACES.map((space) => [space.id, space])
  );

  const nodeId = (floor: EngineeringFloor, [x, y]: PlanPoint) =>
    `${floor}:${x.toFixed(2)}:${y.toFixed(2)}`;

  const ensureNode = (floor: EngineeringFloor, point: PlanPoint): string => {
    const id = nodeId(floor, point);
    if (!nodes.has(id)) nodes.set(id, { id, floor, planXY: point });
    return id;
  };

  const link = (a: string, b: string, floorChange?: IndoorRouteEdge["floorChange"]) => {
    if (a === b) return;
    const nodeA = nodes.get(a)!;
    const nodeB = nodes.get(b)!;
    const meters = floorChange
      ? FLOOR_CHANGE_METERS[floorChange.via]
      : Math.hypot(
          nodeB.planXY[0] - nodeA.planXY[0],
          nodeB.planXY[1] - nodeA.planXY[1]
        );
    edges.push({ from: a, to: b, meters, floorChange });
  };

  for (const floor of [1, 2] as const) {
    const northXs = new Set<number>([CENTER_SPINE_X]);
    const southXs = new Set<number>([CENTER_SPINE_X]);
    const centerYs = new Set<number>([NORTH_SPINE_Y, SOUTH_SPINE_Y]);

    for (const space of ENGINEERING_SPACES) {
      if (space.floor !== floor || space.kind === "corridor") continue;

      const { door, foot } = doorAndFoot(space);
      const doorNode = ensureNode(floor, door);
      const footNode = ensureNode(floor, foot);
      link(doorNode, footNode);
      doorNodeBySpace.set(space.id, doorNode);

      if (foot[1] === NORTH_SPINE_Y) northXs.add(foot[0]);
      else if (foot[1] === SOUTH_SPINE_Y) southXs.add(foot[0]);
      else centerYs.add(foot[1]);
    }

    const chain = (points: PlanPoint[]) => {
      for (let index = 1; index < points.length; index += 1) {
        link(
          ensureNode(floor, points[index - 1]),
          ensureNode(floor, points[index])
        );
      }
    };

    chain([...northXs].sort((a, b) => a - b).map((x) => [x, NORTH_SPINE_Y]));
    chain([...southXs].sort((a, b) => a - b).map((x) => [x, SOUTH_SPINE_Y]));
    chain(
      [...centerYs].sort((a, b) => a - b).map((y) => [CENTER_SPINE_X, y])
    );
  }

  // Stairs and elevators exist on both floors with the same base id; connect
  // their doors vertically.
  for (const space of ENGINEERING_SPACES) {
    if (space.floor !== 1) continue;
    if (space.kind !== "stairs" && space.kind !== "elevator") continue;

    const upperId = space.id.replace(/^1f-/, "2f-");
    const lowerDoor = doorNodeBySpace.get(space.id);
    const upperDoor = doorNodeBySpace.get(upperId);
    if (!lowerDoor || !upperDoor) continue;

    link(lowerDoor, upperDoor, {
      via: space.kind,
      label: space.kind === "elevator" ? "엘리베이터" : "계단"
    });
  }

  return { nodes, edges, doorNodeBySpace, spaceById };
};

const GRAPH = buildGraph();

export function shortestIndoorRoute(
  nodes: ReadonlyMap<string, IndoorRouteNode>,
  edges: readonly IndoorRouteEdge[],
  startId: string,
  destinationId: string
): { nodeIds: string[]; meters: number } {
  if (!nodes.has(startId) || !nodes.has(destinationId)) {
    throw new Error("Route endpoint is not in the graph");
  }

  const neighbors = new Map<string, { edge: IndoorRouteEdge; next: string }[]>();
  for (const edge of edges) {
    if (!neighbors.has(edge.from)) neighbors.set(edge.from, []);
    if (!neighbors.has(edge.to)) neighbors.set(edge.to, []);
    neighbors.get(edge.from)!.push({ edge, next: edge.to });
    neighbors.get(edge.to)!.push({ edge, next: edge.from });
  }

  const distances = new Map<string, number>([[startId, 0]]);
  const previous = new Map<string, string>();
  const unvisited = new Set(nodes.keys());

  // ponytail: O(n^2) selection is fine for a ~250 node building; use a heap
  // once this covers the whole campus.
  while (unvisited.size > 0) {
    let current: string | undefined;
    let currentDistance = Infinity;

    for (const id of unvisited) {
      const distance = distances.get(id) ?? Infinity;
      if (distance < currentDistance) {
        current = id;
        currentDistance = distance;
      }
    }

    if (!current || currentDistance === Infinity) break;
    if (current === destinationId) break;
    unvisited.delete(current);

    for (const { edge, next } of neighbors.get(current) ?? []) {
      if (!unvisited.has(next)) continue;
      const candidate = currentDistance + edge.meters;
      if (candidate < (distances.get(next) ?? Infinity)) {
        distances.set(next, candidate);
        previous.set(next, current);
      }
    }
  }

  const meters = distances.get(destinationId) ?? Infinity;
  if (!Number.isFinite(meters)) throw new Error("No indoor route found");

  const nodeIds = [destinationId];
  while (nodeIds[0] !== startId) {
    const predecessor = previous.get(nodeIds[0]);
    if (!predecessor) throw new Error("No indoor route found");
    nodeIds.unshift(predecessor);
  }

  return { nodeIds, meters };
}

const compressCollinear = (points: PlanPoint[]): PlanPoint[] => {
  const result: PlanPoint[] = [];

  for (const point of points) {
    const last = result.at(-1);
    if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < 0.05) {
      continue;
    }
    result.push(point);

    while (result.length >= 3) {
      const [ax, ay] = result[result.length - 3];
      const [bx, by] = result[result.length - 2];
      const [cx, cy] = result[result.length - 1];
      const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
      const dot = (bx - ax) * (cx - bx) + (by - ay) * (cy - by);
      if (Math.abs(cross) < 0.05 && dot > 0) {
        result.splice(result.length - 2, 1);
      } else {
        break;
      }
    }
  }

  return result;
};

const spaceLabel = (space: EngineeringSpaceInfo) =>
  space.roomNumber ? `${space.roomNumber}호` : space.name ?? space.label;

const turnOf = (
  previous: PlanPoint,
  corner: PlanPoint,
  next: PlanPoint
): "left" | "right" | "straight" => {
  const cross =
    (corner[0] - previous[0]) * (next[1] - corner[1]) -
    (corner[1] - previous[1]) * (next[0] - corner[0]);
  if (cross > 0.05) return "left";
  if (cross < -0.05) return "right";
  return "straight";
};

const runLength = (from: PlanPoint, to: PlanPoint) =>
  Math.hypot(to[0] - from[0], to[1] - from[1]);

const SIDE_TEXT = {
  left: "진행 방향 왼쪽",
  right: "진행 방향 오른쪽",
  straight: "정면"
} as const;

export function findEngineeringRoute(
  startSpaceId: string,
  destinationSpaceId: string
): IndoorRoute {
  const { nodes, edges, doorNodeBySpace, spaceById } = GRAPH;
  const start = spaceById.get(startSpaceId);
  const destination = spaceById.get(destinationSpaceId);
  const startDoor = doorNodeBySpace.get(startSpaceId);
  const destinationDoor = doorNodeBySpace.get(destinationSpaceId);

  if (!start || !destination || !startDoor || !destinationDoor) {
    throw new Error("Unknown route endpoint");
  }
  if (startSpaceId === destinationSpaceId) {
    throw new Error("Start and destination are the same space");
  }

  const { nodeIds } = shortestIndoorRoute(
    nodes,
    edges,
    startDoor,
    destinationDoor
  );
  const pathNodes = nodeIds.map((id) => nodes.get(id)!);

  const floorChangeByPair = new Map<string, IndoorRouteEdge>();
  for (const edge of edges) {
    if (edge.floorChange) {
      floorChangeByPair.set(`${edge.from}>${edge.to}`, edge);
      floorChangeByPair.set(`${edge.to}>${edge.from}`, edge);
    }
  }

  // Split the node path into per-floor segments at floor-change edges.
  type RawSegment = {
    floor: EngineeringFloor;
    points: PlanPoint[];
    changeAfter?: IndoorRouteEdge["floorChange"];
  };
  const rawSegments: RawSegment[] = [
    { floor: start.floor, points: [spaceCenter(start), pathNodes[0].planXY] }
  ];

  for (let index = 1; index < pathNodes.length; index += 1) {
    const previousNode = pathNodes[index - 1];
    const node = pathNodes[index];
    const change = floorChangeByPair.get(`${previousNode.id}>${node.id}`);

    if (change) {
      rawSegments.at(-1)!.changeAfter = change.floorChange;
      rawSegments.push({ floor: node.floor, points: [node.planXY] });
    } else {
      rawSegments.at(-1)!.points.push(node.planXY);
    }
  }
  rawSegments.at(-1)!.points.push(spaceCenter(destination));

  const segments: IndoorRouteSegment[] = rawSegments.map((segment) => ({
    floor: segment.floor,
    points: compressCollinear(segment.points)
  }));

  // --- steps ---
  const steps: IndoorRouteStep[] = [];
  let walkMeters = 0;
  let floorChanges = 0;

  steps.push({
    kind: "start",
    text: `${spaceLabel(start)}에서 출발합니다`,
    floor: start.floor,
    focusXY: spaceCenter(start)
  });

  segments.forEach((segment, segmentIndex) => {
    const isFinalSegment = segmentIndex === segments.length - 1;
    const { points, floor } = segment;
    const changeAfter = rawSegments[segmentIndex].changeAfter;

    for (let index = 1; index < points.length; index += 1) {
      const from = points[index - 1];
      const to = points[index];
      const meters = runLength(from, to);
      walkMeters += meters;

      const isFinalRun = index === points.length - 1;
      const turn =
        index >= 2 ? turnOf(points[index - 2], from, to) : "straight";

      if (isFinalRun && isFinalSegment) {
        steps.push({
          kind: "arrive",
          text: `${spaceLabel(destination)} 도착 · ${SIDE_TEXT[turn]}에 있습니다`,
          floor,
          meters: Math.round(meters),
          focusXY: spaceCenter(destination)
        });
        continue;
      }

      if (isFinalRun && changeAfter) {
        floorChanges += 1;
        const nextFloor = segments[segmentIndex + 1].floor;
        const direction = nextFloor > floor ? "올라갑니다" : "내려갑니다";
        const via =
          changeAfter.via === "stairs" ? "계단으로" : "엘리베이터로";
        steps.push({
          kind: "floor-change",
          text: `${SIDE_TEXT[turn]}의 ${via} ${nextFloor}층에 ${direction}`,
          floor,
          toFloor: nextFloor,
          focusXY: to
        });
        continue;
      }

      if (index === 1) {
        steps.push({
          kind: "straight",
          text:
            segmentIndex === 0
              ? `복도로 나가 ${Math.round(meters)}m 직진합니다`
              : `복도를 따라 ${Math.round(meters)}m 직진합니다`,
          floor,
          meters: Math.round(meters),
          focusXY: from
        });
        continue;
      }

      steps.push({
        kind: turn === "left" ? "turn-left" : turn === "right" ? "turn-right" : "straight",
        text:
          turn === "straight"
            ? `계속 ${Math.round(meters)}m 직진합니다`
            : `${turn === "left" ? "왼쪽" : "오른쪽"}으로 돌아 ${Math.round(meters)}m 직진합니다`,
        floor,
        meters: Math.round(meters),
        focusXY: from
      });
    }
  });

  return {
    start,
    destination,
    segments,
    steps,
    distanceMeters: Math.round(walkMeters),
    estimatedSeconds: Math.ceil(
      walkMeters / WALK_SPEED_METERS_PER_SECOND +
        floorChanges * FLOOR_CHANGE_EXTRA_SECONDS
    )
  };
}

export type EngineeringRouteGeoJSON = {
  lines: GeoJSON.FeatureCollection<
    GeoJSON.LineString,
    { floor: EngineeringFloor }
  >;
  markers: GeoJSON.FeatureCollection<
    GeoJSON.Point,
    { role: "start" | "destination" | "floor-change"; label: string; floor: EngineeringFloor }
  >;
};

export const engineeringRouteToGeoJSON = (
  route: IndoorRoute
): EngineeringRouteGeoJSON => {
  const lines: EngineeringRouteGeoJSON["lines"] = {
    type: "FeatureCollection",
    features: route.segments.map((segment) => ({
      type: "Feature",
      properties: { floor: segment.floor },
      geometry: {
        type: "LineString",
        coordinates: segment.points.map(toEngineeringRouteCoordinate)
      }
    }))
  };

  const markers: EngineeringRouteGeoJSON["markers"] = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          role: "start",
          label: `${spaceLabel(route.start)} 출발`,
          floor: route.segments[0].floor
        },
        geometry: {
          type: "Point",
          coordinates: toEngineeringRouteCoordinate(route.segments[0].points[0])
        }
      },
      ...route.steps
        .filter((step) => step.kind === "floor-change")
        .map((step): EngineeringRouteGeoJSON["markers"]["features"][number] => ({
          type: "Feature",
          properties: {
            role: "floor-change",
            label: `${step.toFloor}층으로`,
            floor: step.floor
          },
          geometry: {
            type: "Point",
            coordinates: toEngineeringRouteCoordinate(step.focusXY)
          }
        })),
      {
        type: "Feature",
        properties: {
          role: "destination",
          label: `${spaceLabel(route.destination)} 도착`,
          floor: route.segments.at(-1)!.floor
        },
        geometry: {
          type: "Point",
          coordinates: toEngineeringRouteCoordinate(
            route.segments.at(-1)!.points.at(-1)!
          )
        }
      }
    ]
  };

  return { lines, markers };
};
