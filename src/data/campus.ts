// 캠퍼스 레지스트리 — 건물·실외 장소의 단일 목록과 파생 GeoJSON.
// 새 건물 추가 = buildings/ 파일 하나 + BUILDINGS 배열 한 줄 (코드 수정 없음).

import {
  floorKey,
  floorLabel,
  type Building,
  type OutdoorPlace
} from "./campus-types.ts";
import { ENGINEERING } from "./buildings/engineering.ts";

export { floorKey, floorLabel };

export const BUILDINGS: readonly Building[] = [ENGINEERING];

// ponytail: 답사 전 근사 좌표 — 실측 후 갱신
export const OUTDOOR_PLACES: readonly OutdoorPlace[] = [
  { id: "main-gate", name: "정문", center: [126.9955, 37.6096] },
  { id: "playground", name: "대운동장", aliases: ["운동장"], center: [126.9958, 37.6112] }
];

export const CAMPUS_CENTER: [number, number] = [126.9967, 37.6108];

// ponytail: 웹 배포 전 자리표시 도메인 — 배포 시 실제 호스트로 교체
export const SHARE_BASE_URL = "https://daegukminjido.kookmin.app";

export const findBuilding = (id: string): Building | undefined =>
  BUILDINGS.find((building) => building.id === id);

export const CAMPUS_BUILDINGS_GEOJSON = {
  type: "FeatureCollection",
  features: BUILDINGS.map((building) => ({
    type: "Feature" as const,
    properties: { id: building.id, kind: "building", name: building.name },
    geometry: building.outline
  }))
} satisfies GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  { id: string; kind: string; name: string }
>;

export const CAMPUS_LABELS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    ...BUILDINGS.map((building) => ({
      type: "Feature" as const,
      properties: {
        id: building.id,
        kind: "building",
        label: building.name
      },
      geometry: { type: "Point" as const, coordinates: building.center }
    })),
    ...OUTDOOR_PLACES.map((place) => ({
      type: "Feature" as const,
      properties: { id: place.id, kind: "outdoor", label: place.name },
      geometry: { type: "Point" as const, coordinates: place.center }
    }))
  ]
} satisfies GeoJSON.FeatureCollection<
  GeoJSON.Point,
  { id: string; kind: string; label: string }
>;

// 수동 핀치줌으로 실내에 진입했을 때 어느 건물 층을 로드할지 고르는 폴백.
// ponytail: 중심 최근접 선택 — 인접 건물이 겹치기 시작하면 point-in-polygon으로 교체
export const buildingNear = (
  center: readonly [number, number],
  maxDegrees = 0.002
): Building | undefined => {
  let best: Building | undefined;
  let bestDistance = maxDegrees;
  for (const building of BUILDINGS) {
    if (!building.indoor) continue;
    const distance = Math.hypot(
      building.center[0] - center[0],
      building.center[1] - center[1]
    );
    if (distance < bestDistance) {
      best = building;
      bestDistance = distance;
    }
  }
  return best;
};
