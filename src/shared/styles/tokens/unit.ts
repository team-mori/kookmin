/**
 * Figma Primitive : Measurement / unit · percentage.
 * @see ./figma-variables.json
 */

export const unit = {
  0: 0,
  1: 1,
  2: 2,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  36: 36,
  40: 40,
  48: 48,
  64: 64,
  half: 0.5,
} as const

export const percentage = {
  0: 0,
  20: 20,
  40: 40,
  60: 60,
  80: 80,
  100: 100,
} as const

export type Unit = typeof unit
export type Percentage = typeof percentage
