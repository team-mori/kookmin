import { Redirect, useLocalSearchParams } from "expo-router";

// 공유 링크 진입점 — /place/engineering.1f-room-115 등.
// 지도 화면(index)이 place 파람을 읽어 카드를 열고 카메라를 이동한다.
export default function PlaceLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: "/", params: { place: id } }} />;
}
