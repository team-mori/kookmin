import { ENGINEERING_CENTER } from "./engineering-building";

export type EngineeringFloor = 1 | 2;

export type EngineeringSpaceKind =
  | "room"
  | "corridor"
  | "stairs"
  | "elevator";

export type EngineeringSpaceProperties = {
  id: string;
  floor: EngineeringFloor;
  kind: EngineeringSpaceKind;
  label: string;
  name?: string;
  roomNumber?: string;
};

export type EngineeringFloorData = {
  spaces: GeoJSON.FeatureCollection<
    GeoJSON.Polygon,
    EngineeringSpaceProperties
  >;
  labels: GeoJSON.FeatureCollection<GeoJSON.Point, EngineeringSpaceProperties>;
};

// planXY bounds in meters from the floor drawing's local origin.
type LocalBounds = readonly [
  west: number,
  south: number,
  east: number,
  north: number
];

type SpaceDefinition = {
  id: string;
  kind: EngineeringSpaceKind;
  label: string;
  bounds: LocalBounds;
  name?: string;
  roomNumber?: string;
};

// MapLibre requires lng/lat geometry. This display anchor is not surveyed GPS
// alignment; planXY remains the source coordinate system for indoor data.
const RENDER_ANCHOR = ENGINEERING_CENTER;
const METERS_PER_LATITUDE_DEGREE = 111_320;
const METERS_PER_LONGITUDE_DEGREE =
  METERS_PER_LATITUDE_DEGREE *
  Math.cos((RENDER_ANCHOR[1] * Math.PI) / 180);
const FLOOR_EXTENT: LocalBounds = [-68, -44, 68, 44];
const FLOOR_SHELL_PLAN_XY: readonly (readonly [number, number])[] = [
  [-68, 44],
  [68, 44],
  [68, 16],
  [10, 16],
  [10, -16],
  [68, -16],
  [68, -44],
  [-68, -44],
  [-68, -16],
  [-10, -16],
  [-10, 16],
  [-68, 16],
  [-68, 44]
];

// Simplified tracing for UI validation only. It preserves the recognizable
// wings and circulation structure, but must be replaced with surveyed or CAD
// geometry before room selection, accessibility, or routing depends on it.
const COMMON_SPACES: readonly SpaceDefinition[] = [
  { id: "corridor-north-west", kind: "corridor", label: "복도", bounds: [-66, 26, -8, 30] },
  { id: "corridor-north-east", kind: "corridor", label: "복도", bounds: [8, 26, 66, 30] },
  { id: "corridor-center", kind: "corridor", label: "중앙 복도", bounds: [-8, -30, 8, 30] },
  { id: "corridor-south-west", kind: "corridor", label: "복도", bounds: [-66, -30, -8, -26] },
  { id: "corridor-south-east", kind: "corridor", label: "복도", bounds: [8, -30, 66, -26] },
  { id: "stairs-north-west", kind: "stairs", label: "계단", bounds: [-54, 30, -48, 42] },
  { id: "stairs-center", kind: "stairs", label: "계단", bounds: [-4, 30, 2, 42] },
  { id: "stairs-north-east", kind: "stairs", label: "계단", bounds: [60, 30, 66, 42] },
  { id: "stairs-south-west", kind: "stairs", label: "계단", bounds: [-18, -42, -12, -30] },
  { id: "stairs-south-center", kind: "stairs", label: "계단", bounds: [-4, -42, 2, -30] },
  { id: "stairs-south-east", kind: "stairs", label: "계단", bounds: [60, -42, 66, -30] },
  { id: "elevator-north-west", kind: "elevator", label: "EV", bounds: [-48, 30, -44, 36] },
  { id: "elevator-center", kind: "elevator", label: "EV", bounds: [2, 30, 6, 36] },
  { id: "elevator-south", kind: "elevator", label: "EV", bounds: [2, -42, 6, -36] }
];

const room = (
  roomNumber: string,
  name: string,
  bounds: LocalBounds
): SpaceDefinition => ({
  id: `room-${roomNumber}`,
  kind: "room",
  label: roomNumber,
  roomNumber,
  name,
  bounds
});

const FLOOR_ROOMS: Record<EngineeringFloor, readonly SpaceDefinition[]> = {
  1: [
    room("115", "재료시험실", [-66, 30, -56, 42]),
    room("114", "수리실험실", [-44, 30, -28, 42]),
    room("113", "실험준비실", [-28, 30, -18, 42]),
    room("112", "나노연구소 연구실", [-18, 30, -8, 42]),
    room("116", "MEDVIC 실험실", [-66, 18, -54, 26]),
    room("117", "신에너지연구실", [-54, 18, -42, 26]),
    room("118", "MEDVIC 실험실", [-42, 18, -34, 26]),
    room("119", "신재생에너지연구실", [-34, 18, -26, 26]),
    room("121", "Water-AI 연구실", [-26, 18, -8, 26]),
    room("111-2", "지능형 차량 연구실", [8, 30, 18, 42]),
    room("111-1", "모빌리티 추진연구실", [18, 30, 28, 42]),
    room("110", "미래모빌리티 제어연구실", [28, 30, 38, 42]),
    room("109", "차량인간공학 실험실", [38, 30, 48, 42]),
    room("108", "차량임베디드 실험실", [48, 30, 60, 42]),
    room("101", "지능형모빌리티 연구실", [8, 18, 16, 26]),
    room("102", "무인차량연구실", [16, 18, 24, 26]),
    room("103", "모빌리티사이버보안 연구실", [24, 18, 32, 26]),
    room("105", "지능형모빌리티 연구실", [32, 18, 42, 26]),
    room("106", "차체설계실험실", [42, 18, 52, 26]),
    room("107", "지능형 차량 연구실", [52, 18, 66, 26]),
    room("125", "F-EMBD", [-66, -26, -54, -18]),
    room("124", "반도체융합실험실", [-54, -26, -42, -18]),
    room("123", "반도체융합실험실", [-42, -26, -26, -18]),
    room("122", "교통·스마트구조 연구실", [-26, -26, -8, -18]),
    room("126", "전자회로실습실", [-66, -42, -54, -30]),
    room("127", "광전자재료실험실", [-54, -42, -40, -30]),
    room("127-1", "광전자재료 연구실", [-40, -42, -28, -30]),
    room("128", "위험물 저장창고", [-28, -42, -18, -30]),
    room("129", "학생회실", [-12, -42, -8, -30]),
    room("137", "매점", [8, -26, 20, -18]),
    room("136", "카페", [20, -26, 32, -18]),
    room("135", "패스트푸드점", [32, -26, 44, -18]),
    room("134", "휴게실", [54, -26, 66, -18]),
    room("130", "매점 휴게실", [8, -42, 18, -30]),
    room("131", "소모임방", [18, -42, 28, -30]),
    room("132", "로봇제어연구실", [28, -42, 54, -30]),
    room("133", "관리실", [54, -42, 60, -30])
  ],
  2: [
    room("217", "나노옵트로닉스 I", [-66, 30, -56, 42]),
    room("216", "강의실", [-44, 30, -28, 42]),
    room("215", "전기모터제어실험실 준비실", [-28, 30, -18, 42]),
    room("214", "나노옵트로닉스 II", [-18, 30, -8, 42]),
    room("218", "유기박막실험실", [-66, 18, -54, 26]),
    room("219-1", "나노융합구조소재실험실", [-54, 18, -42, 26]),
    room("219-2", "계산실험실", [-42, 18, -34, 26]),
    room("220", "강의실", [-34, 18, -22, 26]),
    room("221", "교수자료실·강사실", [-22, 18, -8, 26]),
    room("213", "바이오의료기기실험실", [8, 30, 18, 42]),
    room("212", "표면설계 및 생산연구실", [18, 30, 28, 42]),
    room("211", "파워트레인 설계실험실", [28, 30, 38, 42]),
    room("210", "다빈치 스튜디오", [38, 30, 50, 42]),
    room("209", "다빈치 스튜디오", [50, 30, 60, 42]),
    room("201", "KUST", [8, 18, 14, 26]),
    room("202", "응용레이저기술연구실", [14, 18, 22, 26]),
    room("203-1", "에너지변환실험실", [22, 18, 28, 26]),
    room("203-2", "유체실험실", [28, 18, 34, 26]),
    room("204", "엔진시험 준비실", [34, 18, 40, 26]),
    room("205", "파워트레인 설계실", [40, 18, 46, 26]),
    room("206", "연구실", [46, 18, 52, 26]),
    room("207", "연구실", [52, 18, 58, 26]),
    room("208", "창의공학실", [58, 18, 66, 26]),
    room("222", "공과대학 학장실", [-18, 6, -8, 18]),
    room("223", "공학 종합행정실", [-18, -18, -8, 6]),
    room("228", "계단강의실", [-66, -26, -42, -18]),
    room("226", "자동차융합전문대학원 준비실", [-42, -26, -24, -18]),
    room("228-1", "자동차모빌리티대학 소모임", [-66, -42, -54, -30]),
    room("227", "미래모빌리티학과 고학년실", [-54, -42, -18, -30]),
    room("248", "자동차융합대학 학과실", [8, -26, 18, -18]),
    room("247", "공과대학 연구실", [18, -26, 26, -18]),
    room("246", "시청각강의실", [26, -26, 46, -18]),
    room("245", "Water-AI 전산실", [46, -26, 54, -18]),
    room("244", "환경실험 준비실", [54, -26, 60, -18]),
    room("243", "환경실험실", [60, -26, 66, -18]),
    room("229-233", "교수 연구실", [8, -42, 28, -30]),
    room("234-238", "교수 연구실", [28, -42, 48, -30]),
    room("239-242", "교수 연구실", [48, -42, 60, -30])
  ]
};

const toWgs84 = ([x, y]: readonly [number, number]): GeoJSON.Position => [
  RENDER_ANCHOR[0] + x / METERS_PER_LONGITUDE_DEGREE,
  RENDER_ANCHOR[1] + y / METERS_PER_LATITUDE_DEGREE
];

export const ENGINEERING_FLOOR_SHELL = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "engineering-floor-shell" },
      geometry: {
        type: "Polygon",
        coordinates: [FLOOR_SHELL_PLAN_XY.map(toWgs84)]
      }
    }
  ]
} satisfies GeoJSON.FeatureCollection<GeoJSON.Polygon, { id: string }>;

const propertiesFor = (
  floor: EngineeringFloor,
  definition: SpaceDefinition
): EngineeringSpaceProperties => ({
  id: `${floor}f-${definition.id}`,
  floor,
  kind: definition.kind,
  label: definition.label,
  name: definition.name,
  roomNumber: definition.roomNumber
});

const polygonFor = (
  floor: EngineeringFloor,
  definition: SpaceDefinition
): GeoJSON.Feature<GeoJSON.Polygon, EngineeringSpaceProperties> => {
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
  floor: EngineeringFloor,
  definition: SpaceDefinition
): GeoJSON.Feature<GeoJSON.Point, EngineeringSpaceProperties> => {
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

const floorData = (floor: EngineeringFloor): EngineeringFloorData => {
  const definitions = [...COMMON_SPACES, ...FLOOR_ROOMS[floor]];

  return {
    spaces: {
      type: "FeatureCollection",
      features: definitions.map((definition) => polygonFor(floor, definition))
    },
    labels: {
      type: "FeatureCollection",
      features: definitions.map((definition) => labelFor(floor, definition))
    }
  };
};

export const ENGINEERING_FLOORS: Record<
  EngineeringFloor,
  EngineeringFloorData
> = {
  1: floorData(1),
  2: floorData(2)
};

const [west, south, east, north] = FLOOR_EXTENT;
const southWest = toWgs84([west, south]);
const northEast = toWgs84([east, north]);

export const ENGINEERING_FLOOR_BOUNDS: [number, number, number, number] = [
  southWest[0],
  southWest[1],
  northEast[0],
  northEast[1]
];
