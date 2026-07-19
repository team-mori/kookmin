import {
  ENGINEERING_FLOORS,
  type EngineeringFloor
} from "./engineering-floors";

export type EngineeringRoomSearchResult = {
  id: string;
  floor: EngineeringFloor;
  roomNumber: string;
  name: string;
  center: [number, number];
};

const ROOM_SEARCH_INDEX: EngineeringRoomSearchResult[] = ([1, 2] as const)
  .flatMap((floor) => {
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
