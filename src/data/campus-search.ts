import {
  ENGINEERING_FLOORS,
  type EngineeringFloor
} from "./buildings/engineering.ts";
import { floorLabel, type Place } from "./campus-types.ts";
import { BUILDINGS, OUTDOOR_PLACES } from "./campus.ts";
import { buildingSpaces, planToWgs84 } from "./indoor-geometry.ts";

export type EngineeringRoomSearchResult = {
  id: string;
  floor: EngineeringFloor;
  roomNumber: string;
  name: string;
  center: [number, number];
};

const ROOM_SEARCH_INDEX: EngineeringRoomSearchResult[] = [1, 2]
  .flatMap((floor: EngineeringFloor) => {
    const labelsById = new Map(
      ENGINEERING_FLOORS[floor].labels.features.map((feature) => [
        feature.properties.id,
        feature.geometry.coordinates
      ])
    );

    return ENGINEERING_FLOORS[floor].spaces.features
      .filter((feature) => feature.properties.kind === "room")
      .map((feature) => {
        const { id, name, roomNumber } = feature.properties;
        const center = labelsById.get(id);

        if (!name || !roomNumber || !center) return null;

        return {
          id,
          floor,
          roomNumber,
          name,
          center: [center[0], center[1]] as [number, number]
        };
      })
      .filter((room): room is EngineeringRoomSearchResult => room !== null);
  });

export const findEngineeringRoom = (
  id: string
): EngineeringRoomSearchResult | undefined =>
  ROOM_SEARCH_INDEX.find((room) => room.id === id);

const normalizeSearchValue = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/[\s·._-]+/g, "");

export const searchEngineeringRooms = (
  query: string,
  limit = 6
): EngineeringRoomSearchResult[] => {
  const normalizedQuery = normalizeSearchValue(query.trim()).replace(/호$/, "");
  if (!normalizedQuery) return [];

  return ROOM_SEARCH_INDEX
    .map((room) => {
      const roomNumber = normalizeSearchValue(room.roomNumber);
      const name = normalizeSearchValue(room.name);
      const rank =
        roomNumber === normalizedQuery
          ? 0
          : roomNumber.startsWith(normalizedQuery)
            ? 1
            : name.startsWith(normalizedQuery)
              ? 2
              : roomNumber.includes(normalizedQuery)
                ? 3
                : name.includes(normalizedQuery)
                  ? 4
                  : -1;

      return { room, rank };
    })
    .filter(({ rank }) => rank >= 0)
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        left.room.roomNumber.localeCompare(right.room.roomNumber, "ko", {
          numeric: true
        })
    )
    .slice(0, limit)
    .map(({ room }) => room);
};

// ── 캠퍼스 전역 장소 인덱스 ──────────────────────────────────────────────
// 모든 장소(건물·방·실외)는 고유 Place id를 가진다:
//   방 "engineering.1f-room-115" · 건물 "engineering" · 실외 "main-gate"

export const placeIdFor = (buildingId: string, spaceId?: string): string =>
  spaceId ? `${buildingId}.${spaceId}` : buildingId;

export const parsePlaceId = (
  id: string
): { buildingId: string; spaceId?: string } => {
  const dot = id.indexOf(".");
  return dot < 0
    ? { buildingId: id }
    : { buildingId: id.slice(0, dot), spaceId: id.slice(dot + 1) };
};

type PlaceEntry = { place: Place; primary: string; secondary: string[] };

const PLACE_INDEX: PlaceEntry[] = [
  ...BUILDINGS.map((building) => ({
    place: {
      id: building.id,
      kind: "building" as const,
      title: building.name,
      subtitle: building.indoor ? "건물 · 실내지도 제공" : "건물",
      buildingId: building.id,
      center: building.center
    },
    primary: building.name,
    secondary: [...(building.aliases ?? [])]
  })),
  ...BUILDINGS.flatMap((building) => {
    if (!building.indoor) return [];
    const toWgs84 = planToWgs84(building.indoor.renderAnchor);
    return buildingSpaces(building)
      .filter((space) => space.kind === "room" && space.roomNumber && space.name)
      .map((space) => {
        const [west, south, east, north] = space.bounds;
        return {
          place: {
            id: placeIdFor(building.id, space.id),
            kind: "room" as const,
            title: `${space.roomNumber}호`,
            subtitle: `${space.name} · ${building.name} ${floorLabel(space.floor)}`,
            buildingId: building.id,
            floor: space.floor,
            center: toWgs84([(west + east) / 2, (south + north) / 2])
          },
          primary: space.roomNumber!,
          secondary: [space.name!]
        };
      });
  }),
  ...OUTDOOR_PLACES.map((place) => ({
    place: {
      id: place.id,
      kind: "outdoor" as const,
      title: place.name,
      subtitle: "실외",
      center: place.center
    },
    primary: place.name,
    secondary: [...(place.aliases ?? [])]
  }))
];

export const findPlace = (id: string): Place | undefined =>
  PLACE_INDEX.find((entry) => entry.place.id === id)?.place;

export const searchPlaces = (query: string, limit = 8): Place[] => {
  const normalizedQuery = normalizeSearchValue(query.trim()).replace(/호$/, "");
  if (!normalizedQuery) return [];

  return PLACE_INDEX.map((entry) => {
    const primary = normalizeSearchValue(entry.primary);
    const secondary = entry.secondary.map(normalizeSearchValue);
    const rank =
      primary === normalizedQuery
        ? 0
        : primary.startsWith(normalizedQuery)
          ? 1
          : secondary.some((value) => value.startsWith(normalizedQuery))
            ? 2
            : primary.includes(normalizedQuery)
              ? 3
              : secondary.some((value) => value.includes(normalizedQuery))
                ? 4
                : -1;
    return { entry, rank };
  })
    .filter(({ rank }) => rank >= 0)
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        left.entry.place.title.localeCompare(right.entry.place.title, "ko", {
          numeric: true
        })
    )
    .slice(0, limit)
    .map(({ entry }) => entry.place);
};

// 미등록 장소 폴백 — 명세 2.4: 건물 카드 제안 + 유사 검색어 제안.
export const searchFallback = (
  query: string
): { building?: Place; similar: Place[] } => {
  const normalizedQuery = normalizeSearchValue(query.trim()).replace(/호$/, "");
  if (!normalizedQuery) return { similar: [] };

  const buildingEntry = PLACE_INDEX.find((entry) => {
    if (entry.place.kind !== "building") return false;
    return [entry.primary, ...entry.secondary].some((keyword) => {
      const normalized = normalizeSearchValue(keyword);
      return (
        normalizedQuery.includes(normalized) ||
        normalized.includes(normalizedQuery)
      );
    });
  });

  const digits = query.match(/\d+/)?.[0];
  let similar: Place[] = [];
  if (digits) {
    const target = Number(digits);
    similar = PLACE_INDEX.filter(
      (entry) =>
        entry.place.kind === "room" &&
        (!buildingEntry || entry.place.buildingId === buildingEntry.place.id)
    )
      .map((entry) => {
        const roomDigits = entry.primary.match(/\d+/)?.[0] ?? "";
        return { place: entry.place, gap: Math.abs(Number(roomDigits) - target) };
      })
      .sort((left, right) => left.gap - right.gap)
      .slice(0, 3)
      .map(({ place }) => place);
  }

  return { building: buildingEntry?.place, similar };
};
