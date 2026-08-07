import Svg, { Defs, G, Line, LinearGradient, Rect, Stop } from 'react-native-svg'

// 공학관 정면 입면 일러스트 — 실물 파사드(석재 패널 + 중앙 유리 타워 + 우측 커튼월) 기반 자리표시 벡터.
// AI 생성 이미지가 확정되면 이 컴포넌트를 Image로 교체한다.

type ElevationBuildingProps = {
  width?: number
  height?: number
}

export function ElevationBuilding({ width = 345, height = 356 }: ElevationBuildingProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 345 356">
      <Defs>
        <LinearGradient id="eleStripRN" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#5F87CF" />
          <Stop offset="1" stopColor="#2E4C87" />
        </LinearGradient>
        <LinearGradient id="eleGridRN" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#9CBAE8" />
          <Stop offset="1" stopColor="#5372B0" />
        </LinearGradient>
      </Defs>

      {/* 좌측 저층 윙 */}
      <Rect x={6} y={150} width={60} height={186} fill="#F0F2EF" stroke="#E3E6E2" />
      <G fill="#C9D8EE">
        <Rect x={14} y={164} width={44} height={14} rx={2} />
        <Rect x={14} y={204} width={44} height={14} rx={2} />
        <Rect x={14} y={244} width={44} height={14} rx={2} />
        <Rect x={14} y={284} width={44} height={14} rx={2} />
      </G>

      {/* 본관 석재 파사드 */}
      <Rect x={66} y={60} width={174} height={276} fill="#FAFAF8" stroke="#E6E6E1" />
      <G stroke="#ECECE7" strokeWidth={1}>
        <Line x1={66} y1={115} x2={240} y2={115} />
        <Line x1={66} y1={170} x2={240} y2={170} />
        <Line x1={66} y1={225} x2={240} y2={225} />
        <Line x1={66} y1={280} x2={240} y2={280} />
      </G>
      <G fill="#A8C7F0">
        <Rect x={80} y={78} width={30} height={20} rx={2} />
        <Rect x={118} y={78} width={30} height={20} rx={2} />
        <Rect x={80} y={133} width={30} height={20} rx={2} />
        <Rect x={118} y={133} width={30} height={20} rx={2} />
        <Rect x={80} y={188} width={30} height={20} rx={2} />
        <Rect x={118} y={188} width={30} height={20} rx={2} />
        <Rect x={80} y={243} width={30} height={20} rx={2} />
        <Rect x={118} y={243} width={30} height={20} rx={2} />
        <Rect x={200} y={78} width={30} height={20} rx={2} />
        <Rect x={200} y={133} width={30} height={20} rx={2} />
        <Rect x={200} y={188} width={30} height={20} rx={2} />
        <Rect x={200} y={243} width={30} height={20} rx={2} />
      </G>

      {/* 중앙 통유리 타워 스트립 */}
      <Rect x={152} y={30} width={42} height={306} fill="url(#eleStripRN)" />
      <Rect x={150} y={24} width={46} height={8} rx={2} fill="#D9DCE0" />
      <G stroke="#FFFFFF" strokeWidth={1.2} opacity={0.5}>
        <Line x1={152} y1={88} x2={194} y2={88} />
        <Line x1={152} y1={146} x2={194} y2={146} />
        <Line x1={152} y1={204} x2={194} y2={204} />
        <Line x1={152} y1={262} x2={194} y2={262} />
        <Line x1={173} y1={30} x2={173} y2={336} />
      </G>

      {/* 우측 커튼월 블록 */}
      <Rect x={240} y={84} width={99} height={252} fill="#F5F6F4" stroke="#E6E6E1" />
      <Rect x={250} y={96} width={79} height={240} fill="url(#eleGridRN)" />
      <G stroke="#FFFFFF" strokeWidth={1.2} opacity={0.6}>
        <Line x1={250} y1={136} x2={329} y2={136} />
        <Line x1={250} y1={176} x2={329} y2={176} />
        <Line x1={250} y1={216} x2={329} y2={216} />
        <Line x1={250} y1={256} x2={329} y2={256} />
        <Line x1={250} y1={296} x2={329} y2={296} />
        <Line x1={276} y1={96} x2={276} y2={336} />
        <Line x1={303} y1={96} x2={303} y2={336} />
      </G>

      {/* 입구: 유리문과 계단 */}
      <Rect x={158} y={288} width={30} height={48} fill="#24406F" />
      <Rect x={171.5} y={288} width={3} height={48} fill="#FFFFFF" opacity={0.4} />
      <Rect x={120} y={336} width={110} height={7} fill="#E2E5E9" />
      <Rect x={112} y={343} width={126} height={7} fill="#EAEDF0" />
      <Rect x={104} y={350} width={142} height={6} fill="#F1F3F5" />
    </Svg>
  )
}
