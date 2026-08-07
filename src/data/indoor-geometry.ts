// planXY(도면 로컬 미터) → WGS84 변환과 건물별 실내 GeoJSON 파생.
// 파생 결과는 건물 id로 메모이즈한다 — GeoJSON 참조가 렌더 간에 안정적이어야
// 네이티브(prop 교체)와 웹(setData) 모두 불필요한 갱신이 없다.

import {
  floorKey,
  type Building,
  type FloorGeoJSON,
  type SpaceDefinition,
  type SpaceInfo,
  type SpaceProperties
} from "./campus-types.ts";

const METERS_PER_LATITUDE_DEGREE = 111_320;

export const planToWgs84 = (anchor: readonly [number, number]) => {
  const metersPerLongitudeDegree =
    METERS_PER_LATITUDE_DEGREE * Math.cos((anchor[1] * Math.PI) / 180);
  return ([x, y]: readonly [number, number]): [number, number] => [
    anchor[0] + x / metersPerLongitudeDegree,
    anchor[1] + y / METERS_PER_LATITUDE_DEGREE
  ];
};

export type IndoorData = {
  shell: GeoJSON.FeatureCollection<GeoJSON.Polygon, { id: string }>;
  floors: ReadonlyMap<number, FloorGeoJSON>;
};

const propertiesFor = (
  floor: number,
  definition: SpaceDefinition
): SpaceProperties => ({
  id: `${floorKey(floor)}-${definition.id}`,
  floor,
  kind: definition.kind,
  label: definition.label,
  name: definition.name,
  roomNumber: definition.roomNumber
});

const cache = new Map<string, IndoorData>();

export const indoorDataFor = (building: Building): IndoorData | null => {
  const indoor = building.indoor;
  if (!indoor) return null;

  const cached = cache.get(building.id);
  if (cached) return cached;

  const toWgs84 = planToWgs84(indoor.renderAnchor);

  const polygonFor = (
    floor: number,
    definition: SpaceDefinition
  ): GeoJSON.Feature<GeoJSON.Polygon, SpaceProperties> => {
    const [west, south, east, north] = definition.bounds;
    return {
      type: "Feature",
      properties: propertiesFor(floor, definition),
      geometry: {
        type: "Polygon",
        coordinates: [[
          toWgs84([west, south]),
          toWgs84([east, south]),
          toWgs84([east, north]),
          toWgs84([west, north]),
          toWgs84([west, south])
        ]]
      }
    };
  };

  const labelFor = (
    floor: number,
    definition: SpaceDefinition
  ): GeoJSON.Feature<GeoJSON.Point, SpaceProperties> => {
    const [west, south, east, north] = definition.bounds;
    return {
      type: "Feature",
      properties: propertiesFor(floor, definition),
      geometry: {
        type: "Point",
        coordinates: toWgs84([(west + east) / 2, (south + north) / 2])
      }
    };
  };

  const floors = new Map<number, FloorGeoJSON>();
  for (const { floor, rooms } of indoor.floors) {
    const definitions = [...indoor.commonSpaces, ...rooms];
    floors.set(floor, {
      spaces: {
        type: "FeatureCollection",
        features: definitions.map((definition) => polygonFor(floor, definition))
      },
      labels: {
        type: "FeatureCollection",
        features: definitions.map((definition) => labelFor(floor, definition))
      }
    });
  }

  const data: IndoorData = {
    shell: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { id: `${building.id}-floor-shell` },
          geometry: {
            type: "Polygon",
            coordinates: [indoor.shell.map((point) => toWgs84(point))]
          }
        }
      ]
    },
    floors
  };
  cache.set(building.id, data);
  return data;
};

// 라우팅 등 planXY 계산용 평면 목록.
export const buildingSpaces = (building: Building): SpaceInfo[] => {
  const indoor = building.indoor;
  if (!indoor) return [];
  return indoor.floors.flatMap(({ floor, rooms }) =>
    [...indoor.commonSpaces, ...rooms].map((definition) => ({
      ...propertiesFor(floor, definition),
      bounds: definition.bounds
    }))
  );
};
