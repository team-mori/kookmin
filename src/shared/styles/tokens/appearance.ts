import { unit } from './unit'
import { primitiveColor } from './color'

/**
 * Figma Semantic : Appearance — border · effect/shadow.
 * @see ./figma-variables.json
 */

export const radius = {
  sm: unit[2],
  md: unit[4],
  lg: unit[8],
  xl: unit[12],
  '2xl': unit[16],
  rounded: 9999,
} as const

export const borderWidth = {
  sm: unit[1],
  md: unit[2],
  lg: unit[4],
  xs: unit.half,
} as const

/** Figma effect/shadow/* 원시 수치 */
export const shadow = {
  2: {
    'cast-y': 1,
    'cast-blur': 2,
    'core-y': 0,
    'core-blur': 1,
  },
  4: {
    'cast-y': 2,
    'cast-blur': 4,
    'core-y': 0,
    'core-blur': 2,
  },
  8: {
    'cast-y': 4,
    'cast-blur': 8,
    'core-y': 0,
    'core-blur': 4,
  },
  16: {
    'cast-y': 8,
    'cast-blur': 16,
    'core-y': 0,
    'core-blur': 8,
  },
} as const

type ShadowLayer = {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

/**
 * RN StyleSheet용 그림자 근사 (Variables의 cast-y/blur + transparent/16).
 * Figma 이중 레이어(core)는 RN에서 단일 cast로 근사함.
 */
function shadowStyle(level: keyof typeof shadow, androidElevation: number): ShadowLayer {
  const s = shadow[level]
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: s['cast-y'] },
    shadowOpacity: 0.16,
    shadowRadius: s['cast-blur'],
    elevation: androidElevation,
  }
}

export const elevation = {
  shadow2: shadowStyle(2, 2),
  shadow4: shadowStyle(4, 4),
  shadow8: shadowStyle(8, 8),
  shadow16: shadowStyle(16, 16),
  colors: {
    cast: primitiveColor.transparent[16],
    core: primitiveColor.transparent[12],
  },
} as const
