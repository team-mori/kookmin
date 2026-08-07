// 목데이터 — 프론트 뷰 우선 개발용. 실데이터 연결 시 src/data/*로 대체된다.
// 공학관 층·장소 수치는 실제 평면도 데이터(ENGINEERING_SPACES) 기준.

export type MockCategory = "전체" | "강의실" | "시설" | "계단·EV";

export type MockFloor = {
  id: string;
  label: string;
  placeCount: number;
};

export type MockPlace = {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<MockCategory, "전체">;
};

export type MockBuilding = {
  id: string;
  name: string;
  aliases: string[];
  placeCount: number;
  floors: MockFloor[];
  defaultFloorId: string;
  highlights: Record<string, MockPlace[]>;
};

export const MOCK_BUILDINGS: Record<string, MockBuilding> = {
  engineering: {
    id: "engineering",
    name: "공학관",
    aliases: ["공대"],
    placeCount: 76,
    floors: [
      { id: "2f", label: "2F", placeCount: 39 },
      { id: "1f", label: "1F", placeCount: 37 },
      { id: "b1", label: "B1", placeCount: 0 }
    ],
    defaultFloorId: "1f",
    highlights: {
      "1f": [
        { id: "1f-room-115", title: "115호 재료시험실", subtitle: "실습실", category: "강의실" },
        { id: "1f-room-107", title: "107호", subtitle: "강의실", category: "강의실" },
        { id: "1f-elevator-center", title: "중앙 엘리베이터", subtitle: "1F–2F", category: "계단·EV" }
      ],
      "2f": [
        { id: "2f-room-246", title: "246호", subtitle: "강의실", category: "강의실" },
        { id: "2f-room-222", title: "222호", subtitle: "세미나실", category: "강의실" }
      ],
      b1: []
    }
  }
};

export const findMockBuilding = (id: string | undefined): MockBuilding =>
  (id && MOCK_BUILDINGS[id]) || MOCK_BUILDINGS.engineering;
