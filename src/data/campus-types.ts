// 캠퍼스 레지스트리 타입 — 다른 data 모듈을 import하지 않는다 (순환 방지).

export type SpaceKind = "room" | "corridor" | "stairs" | "elevator";

// planXY bounds in meters from the floor drawing's local origin.
export type LocalBounds = readonly [
  west: number,
  south: number,
  east: number,
  north: number
];

export type SpaceDefinition = {
  id: string; // 건물·층 안에서 유일 (예: "room-115")
  kind: SpaceKind;
  label: string;
  bounds: LocalBounds;
  name?: string;
  roomNumber?: string;
};

export type SpaceProperties = {
  id: string; // 건물 안에서 유일 (예: "1f-room-115")
  floor: number;
  kind: SpaceKind;
  label: string;
  name?: string;
  roomNumber?: string;
};

export type SpaceInfo = SpaceProperties & { bounds: LocalBounds };

export type FloorGeoJSON = {
  spaces: GeoJSON.FeatureCollection<GeoJSON.Polygon, SpaceProperties>;
  labels: GeoJSON.FeatureCollection<GeoJSON.Point, SpaceProperties>;
};

export type BuildingIndoor = {
  // MapLibre 표시용 앵커. 실측 GPS 정렬이 아니며 planXY가 소스 좌표계다.
  renderAnchor: readonly [number, number];
  shell: readonly (readonly [number, number])[]; // planXY 외곽 링
  commonSpaces: readonly SpaceDefinition[]; // 모든 층에 반복되는 코어
  floors: readonly { floor: number; rooms: readonly SpaceDefinition[] }[];
};

export type Building = {
  id: string; // "engineering"
  name: string; // "공학관"
  aliases?: readonly string[];
  center: [number, number];
  outline: GeoJSON.Polygon; // WGS84 외곽 (OSM 등)
  indoor?: BuildingIndoor; // 없으면 외곽만 있는 건물
  photos?: readonly string[];
  entranceNote?: string; // "정문 쪽 입구로 들어가면 1층"
};

export type OutdoorPlace = {
  id: string; // "main-gate"
  name: string;
  aliases?: readonly string[];
  center: [number, number];
};

export type Place = {
  id: string; // URL id: "engineering.1f-room-115" | "engineering" | "main-gate"
  kind: "room" | "building" | "outdoor";
  title: string;
  subtitle?: string;
  buildingId?: string;
  floor?: number;
  center: [number, number];
};

// 층 표기 헬퍼 — 지하는 음수 (B1 = -1).
export const floorLabel = (floor: number): string =>
  floor < 0 ? `B${-floor}` : `${floor}F`;

// space id 접두어 — 기존 "1f-room-115" 체계 유지, 지하는 "b1-room-…".
export const floorKey = (floor: number): string =>
  floor < 0 ? `b${-floor}` : `${floor}f`;
