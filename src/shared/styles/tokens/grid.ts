/**
 * Figma `Grid/Mobile/390` 기반 모바일 레이아웃 그리드.
 * 디자인 기준 프레임: Mobile(390-844).
 *
 * @see https://www.figma.com/design/K34ypwrbG04sMtG0SihZoH/QUICKMEAT-Design-system-guide?node-id=30-2896
 */
export const grid = {
  mobile: {
    /** 디자인 기준 프레임 너비 (px ≈ dp) */
    width: 390,
    /** 디자인 기준 프레임 높이 */
    height: 844,
    columns: {
      count: 4,
      /** 열 사이 간격 (Figma gutterSize) */
      gutter: 20,
      /** 좌우 여백 (Figma columns offset, STRETCH) */
      margin: 20,
    },
    /**
     * 콘텐츠 영역 너비 = width - margin * 2.
     * 열 너비 = (contentWidth - gutter * (count - 1)) / count → 72.5
     */
    contentWidth: 350,
    /** 상단 status bar 가이드 (ROWS · MIN · sectionSize) */
    statusBar: 47,
    /** 하단 home indicator 가이드 (ROWS · MAX · sectionSize) */
    homeIndicator: 34,
  },
} as const

export type Grid = typeof grid
