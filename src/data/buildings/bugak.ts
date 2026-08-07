// 북악관 — 수용 테스트용 최소 데이터. 코드 수정 없이 데이터만으로 건물이
// 등록되는지 검증한다 (외곽·좌표는 답사 전 근사값, 실측 후 갱신).

import type { Building, SpaceDefinition } from "../campus-types.ts";

const CENTER: [number, number] = [126.9978, 37.6118];

// ponytail: 사각형 근사 외곽 — OSM 트레이싱으로 교체 예정
const OUTLINE: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [126.9974, 37.6115],
      [126.9982, 37.6115],
      [126.9982, 37.6121],
      [126.9974, 37.6121],
      [126.9974, 37.6115]
    ]
  ]
};

const COMMON_SPACES: readonly SpaceDefinition[] = [
  { id: "corridor-main", kind: "corridor", label: "복도", bounds: [-30, -4, 30, 4] },
  { id: "stairs-main", kind: "stairs", label: "계단", bounds: [-30, 4, -24, 14] },
  { id: "elevator-main", kind: "elevator", label: "EV", bounds: [24, 4, 30, 14] }
];

export const BUGAK: Building = {
  id: "bugak",
  name: "북악관",
  aliases: ["북악"],
  center: CENTER,
  outline: OUTLINE,
  entranceNote: "정면 중앙 출입구로 진입하면 1층",
  indoor: {
    renderAnchor: CENTER,
    shell: [
      [-32, -16],
      [32, -16],
      [32, 16],
      [-32, 16],
      [-32, -16]
    ],
    commonSpaces: COMMON_SPACES,
    floors: [
      {
        floor: 1,
        rooms: [
          {
            id: "room-101",
            kind: "room",
            label: "101",
            roomNumber: "101",
            name: "학생서비스센터",
            bounds: [-20, 4, -4, 14]
          },
          {
            id: "room-102",
            kind: "room",
            label: "102",
            roomNumber: "102",
            name: "강의실",
            bounds: [0, 4, 20, 14]
          }
        ]
      },
      {
        floor: -1,
        rooms: [
          {
            id: "room-b101",
            kind: "room",
            label: "B101",
            roomNumber: "B101",
            name: "편의점",
            bounds: [-20, -14, 0, -4]
          }
        ]
      }
    ]
  }
};
