import { unit } from './unit'

/**
 * Figma Semantic : Appearance / spacing.
 * @see ./figma-variables.json
 */
export const space = {
  0: unit[0],
  2: unit[2],
  4: unit[4],
  8: unit[8],
  12: unit[12],
  16: unit[16],
  20: unit[20],
  24: unit[24],
  32: unit[32],
  36: unit[36],
  40: unit[40],
  48: unit[48],
  64: unit[64],
} as const

export type Space = typeof space
