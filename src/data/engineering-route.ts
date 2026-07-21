export type IndoorRouteNode = {
  id: string;
  planXY: readonly [x: number, y: number];
};

export type IndoorRouteEdge = {
  from: string;
  to: string;
  meters: number;
};

export type IndoorRoute = {
  nodeIds: string[];
  points: (readonly [number, number])[];
  distanceMeters: number;
  estimatedSeconds: number;
};

const METERS_PER_LATITUDE_DEGREE = 111_320;
const ROUTE_RENDER_ANCHOR = [126.99403, 37.61184] as const;
const METERS_PER_LONGITUDE_DEGREE =
  METERS_PER_LATITUDE_DEGREE *
  Math.cos((ROUTE_RENDER_ANCHOR[1] * Math.PI) / 180);

export const toEngineeringRouteCoordinate = (
  [x, y]: readonly [number, number]
): GeoJSON.Position => [
  ROUTE_RENDER_ANCHOR[0] + x / METERS_PER_LONGITUDE_DEGREE,
  ROUTE_RENDER_ANCHOR[1] + y / METERS_PER_LATITUDE_DEGREE
];

export const ENGINEERING_ROUTE_DEMO = {
  floor: 1 as const,
  startLabel: "115",
  destinationLabel: "107",
  startNodeId: "door-115",
  destinationNodeId: "door-107"
};

export const ENGINEERING_ROUTE_NODES: readonly IndoorRouteNode[] = [
  { id: "door-115", planXY: [-61, 30] },
  { id: "north-west", planXY: [-61, 28] },
  { id: "north-center", planXY: [0, 28] },
  { id: "north-east", planXY: [59, 28] },
  { id: "door-107", planXY: [59, 26] },
  { id: "south-center", planXY: [0, -28] },
  { id: "south-east", planXY: [59, -28] }
];

const nodeById = new Map(ENGINEERING_ROUTE_NODES.map((node) => [node.id, node]));

const edge = (from: string, to: string): IndoorRouteEdge => {
  const start = nodeById.get(from);
  const end = nodeById.get(to);

  if (!start || !end) throw new Error(`Unknown route edge: ${from} -> ${to}`);

  return {
    from,
    to,
    meters: Math.hypot(
      end.planXY[0] - start.planXY[0],
      end.planXY[1] - start.planXY[1]
    )
  };
};

export const ENGINEERING_ROUTE_EDGES: readonly IndoorRouteEdge[] = [
  edge("door-115", "north-west"),
  edge("north-west", "north-center"),
  edge("north-center", "north-east"),
  edge("north-east", "door-107"),
  edge("north-center", "south-center"),
  edge("south-center", "south-east"),
  edge("south-east", "north-east")
];

export function shortestIndoorRoute(
  nodes: readonly IndoorRouteNode[],
  edges: readonly IndoorRouteEdge[],
  startId: string,
  destinationId: string
): IndoorRoute {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  if (!nodesById.has(startId) || !nodesById.has(destinationId)) {
    throw new Error("Route endpoint is not in the graph");
  }

  const distances = new Map(nodes.map((node) => [node.id, Infinity]));
  const previous = new Map<string, string>();
  const unvisited = new Set(nodes.map((node) => node.id));
  distances.set(startId, 0);

  // ponytail: O(n^2) is enough for this seven-node demo; use a heap for campus scale.
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

    for (const edgeItem of edges) {
      const neighbor = edgeItem.from === current
        ? edgeItem.to
        : edgeItem.to === current
          ? edgeItem.from
          : undefined;

      if (!neighbor || !unvisited.has(neighbor)) continue;

      const candidate = currentDistance + edgeItem.meters;
      if (candidate < (distances.get(neighbor) ?? Infinity)) {
        distances.set(neighbor, candidate);
        previous.set(neighbor, current);
      }
    }
  }

  const distanceMeters = distances.get(destinationId) ?? Infinity;
  if (!Number.isFinite(distanceMeters)) throw new Error("No indoor route found");

  const nodeIds = [destinationId];
  while (nodeIds[0] !== startId) {
    const predecessor = previous.get(nodeIds[0]);
    if (!predecessor) throw new Error("No indoor route found");
    nodeIds.unshift(predecessor);
  }

  return {
    nodeIds,
    points: nodeIds.map((id) => nodesById.get(id)!.planXY),
    distanceMeters,
    estimatedSeconds: Math.ceil(distanceMeters / 1.3)
  };
}

export const ENGINEERING_DEMO_ROUTE = shortestIndoorRoute(
  ENGINEERING_ROUTE_NODES,
  ENGINEERING_ROUTE_EDGES,
  ENGINEERING_ROUTE_DEMO.startNodeId,
  ENGINEERING_ROUTE_DEMO.destinationNodeId
);
