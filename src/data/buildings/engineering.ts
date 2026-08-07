// 공학관 — 건물 데이터 정의. 파생(GeoJSON 변환)은 indoor-geometry가 담당한다.
// 새 건물 추가 = buildings/ 아래 이런 파일 하나 + campus.ts의 BUILDINGS 배열 한 줄.

import {
  type Building,
  type FloorGeoJSON,
  type LocalBounds,
  type SpaceDefinition,
  type SpaceInfo,
  type SpaceProperties
} from "../campus-types.ts";
import {
  buildingSpaces,
  indoorDataFor,
  planToWgs84
} from "../indoor-geometry.ts";

const CENTER: [number, number] = [126.99403, 37.61184];

// 단순화된 트레이싱 — UI 검증용. 방 선택·접근성·라우팅이 정밀도에 의존하기
// 전에 실측/CAD 형상으로 교체해야 한다.
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

const FLOOR_1_ROOMS: readonly SpaceDefinition[] = [
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
];

const FLOOR_2_ROOMS: readonly SpaceDefinition[] = [
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
];

// OpenStreetMap way 172918337 (ODbL), fetched 2026-07-13.
const OUTLINE: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [126.9934119, 37.6115876],
      [126.9934871, 37.6116731],
      [126.9934593, 37.6116884],
      [126.9937349, 37.6120016],
      [126.9937661, 37.6119843],
      [126.9937799, 37.612],
      [126.9938445, 37.6119643],
      [126.9938942, 37.6120208],
      [126.9938045, 37.6120703],
      [126.9938382, 37.6121087],
      [126.9938206, 37.6121184],
      [126.9940343, 37.6123613],
      [126.9940509, 37.6123521],
      [126.9940799, 37.6123851],
      [126.9942671, 37.6122817],
      [126.9942305, 37.6122401],
      [126.9942397, 37.6122351],
      [126.9940326, 37.6119996],
      [126.9940108, 37.6120116],
      [126.9939605, 37.6119545],
      [126.9939953, 37.6119353],
      [126.9939524, 37.6118864],
      [126.9941897, 37.6117553],
      [126.9942024, 37.6117697],
      [126.9941565, 37.6117951],
      [126.9944767, 37.612159],
      [126.9946559, 37.61206],
      [126.9943335, 37.6116936],
      [126.9943252, 37.6116842],
      [126.9942627, 37.6116131],
      [126.9942247, 37.6116341],
      [126.9939299, 37.611299],
      [126.9937689, 37.6113879],
      [126.9940058, 37.6116572],
      [126.9938132, 37.6117636],
      [126.9935778, 37.611496],
      [126.9934119, 37.6115876]
    ]
  ]
};

export const ENGINEERING: Building = {
  id: "engineering",
  name: "공학관",
  aliases: ["공대"],
  center: CENTER,
  outline: OUTLINE,
  entranceNote: "정문 쪽 입구로 진입하면 1층",
  indoor: {
    renderAnchor: CENTER,
    shell: FLOOR_SHELL_PLAN_XY,
    commonSpaces: COMMON_SPACES,
    floors: [
      { floor: 1, rooms: FLOOR_1_ROOMS },
      { floor: 2, rooms: FLOOR_2_ROOMS }
    ]
  }
};

// ── 레거시 호환 export — 화면·라우팅이 레지스트리 API로 옮겨가면 제거한다 ──

export type EngineeringFloor = number;
export type EngineeringSpaceKind = SpaceProperties["kind"];
export type EngineeringSpaceProperties = SpaceProperties;
export type EngineeringSpaceInfo = SpaceInfo;
export type EngineeringFloorData = FloorGeoJSON;
export type { LocalBounds };

const INDOOR = indoorDataFor(ENGINEERING)!;

export const ENGINEERING_CENTER = CENTER;

export const ENGINEERING_BUILDING = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "engineering-building",
        kind: "building",
        name: "공학관"
      },
      geometry: OUTLINE
    }
  ]
} satisfies GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  { id: string; kind: string; name: string }
>;

export const ENGINEERING_FLOOR_SHELL = INDOOR.shell;

export const ENGINEERING_FLOORS: Record<number, FloorGeoJSON> =
  Object.fromEntries(INDOOR.floors);

export const ENGINEERING_SPACES: readonly SpaceInfo[] =
  buildingSpaces(ENGINEERING);

export const engineeringPlanToWgs84 = planToWgs84(CENTER);
