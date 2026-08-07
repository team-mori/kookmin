import Svg, { Defs, Ellipse, G, Line, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg'

// 공학관 아이소메트릭 일러스트 — 미래관 실물 매싱(중앙 통유리 스트립 + 우측 커튼월) 기반 자리표시 벡터.
// AI 생성 이미지가 확정되면 이 컴포넌트를 Image로 교체한다.

type IsoBuildingProps = {
  width?: number
  height?: number
}

export function IsoBuilding({ width = 355, height = 320 }: IsoBuildingProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 355 320">
      <Defs>
        <LinearGradient id="isoGlassV" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#6E93D6" />
          <Stop offset="1" stopColor="#33528F" />
        </LinearGradient>
        <LinearGradient id="isoGlassGrid" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#8FB0E2" />
          <Stop offset="1" stopColor="#4A6BAB" />
        </LinearGradient>
      </Defs>

      {/* 플랫폼 */}
      <Polygon points="177,120 327,195 177,270 27,195" fill="#F3F4F6" />
      <Polygon points="27,195 177,270 177,281 27,206" fill="#DFE2E6" />
      <Polygon points="327,195 177,270 177,281 327,206" fill="#E8EAED" />

      {/* 건물 그림자 (블러 미지원 대비: 겹친 반투명 타원) */}
      <Ellipse cx={182} cy={244} rx={140} ry={30} fill="#1B1D1F" opacity={0.05} />
      <Ellipse cx={182} cy={242} rx={126} ry={24} fill="#1B1D1F" opacity={0.08} />

      {/* 좌측 저층 윙 */}
      <Polygon points="77,188 77,133 32,155.5 32,210.5" fill="#E7EAEE" />
      <Polygon points="77,188 77,133 117,113 117,168" fill="#F6F8FA" />
      <Polygon points="32,155.5 77,133 117,113 72,90.5" fill="#FFFFFF" />
      <G fill="#C9D8EE">
        <Polygon points="40,158 68,144 68,153 40,167" />
        <Polygon points="40,174 68,160 68,169 40,183" />
      </G>
      <G fill="#DCE8F8">
        <Polygon points="84,136 110,123 110,132 84,145" />
        <Polygon points="84,152 110,139 110,148 84,161" />
      </G>

      {/* 본관 */}
      <Polygon points="177,238 77,188 77,98 177,148" fill="#ECEFF2" />
      <Polygon points="177,238 277,188 277,98 177,148" fill="#FAFBFC" />
      <Polygon points="77,98 177,48 277,98 177,148" fill="#FFFFFF" />

      {/* 좌측면 리본창 */}
      <G fill="#C9D8EE">
        <Polygon points="86,116 168,157 168,166 86,125" />
        <Polygon points="86,134 168,175 168,184 86,143" />
        <Polygon points="86,152 168,193 168,202 86,161" />
        <Polygon points="86,170 168,211 168,220 86,179" />
      </G>

      {/* 중앙 통유리 스트립 */}
      <Polygon points="212,142.5 232,132.5 232,215.5 212,225.5" fill="url(#isoGlassV)" />
      <G stroke="#FFFFFF" strokeWidth={1} opacity={0.55}>
        <Line x1={212} y1={160} x2={232} y2={150} />
        <Line x1={212} y1={177} x2={232} y2={167} />
        <Line x1={212} y1={194} x2={232} y2={184} />
        <Line x1={212} y1={211} x2={232} y2={201} />
      </G>

      {/* 우측 커튼월 블록 */}
      <Polygon points="239,133 271,117 271,193 239,209" fill="url(#isoGlassGrid)" />
      <G stroke="#FFFFFF" strokeWidth={1} opacity={0.65}>
        <Line x1={239} y1={152} x2={271} y2={136} />
        <Line x1={239} y1={171} x2={271} y2={155} />
        <Line x1={239} y1={190} x2={271} y2={174} />
        <Line x1={250} y1={127.5} x2={250} y2={203.5} />
        <Line x1={260} y1={122.5} x2={260} y2={198.5} />
      </G>

      {/* 정면 석재 패널 창 */}
      <G fill="#DCE8F8">
        <Polygon points="184,153 204,143 204,152 184,162" />
        <Polygon points="184,171 204,161 204,170 184,180" />
        <Polygon points="184,189 204,179 204,188 184,198" />
      </G>

      {/* 입구 계단과 캐노피 */}
      <Polygon points="177,238 212,220.5 212,228.5 177,246" fill="#D8DCE1" />
      <Polygon points="177,246 212,228.5 212,235.5 177,253" fill="#E3E6EA" />
      <Polygon points="184,231 205,220.5 205,204 184,214.5" fill="#3D5C9E" />

      {/* 나무 */}
      <G>
        <Ellipse cx={52} cy={226} rx={12} ry={10} fill="#CBDCC4" />
        <Rect x={50} y={233} width={4} height={11} fill="#B9C4B6" />
      </G>
      <G>
        <Ellipse cx={305} cy={212} rx={10} ry={9} fill="#D6E4D0" />
        <Rect x={303} y={218} width={4} height={9} fill="#B9C4B6" />
      </G>
      <G>
        <Ellipse cx={252} cy={238} rx={9} ry={8} fill="#CBDCC4" />
        <Rect x={250} y={243} width={3.5} height={8} fill="#B9C4B6" />
      </G>
    </Svg>
  )
}
