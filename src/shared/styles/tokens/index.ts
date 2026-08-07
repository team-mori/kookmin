export { unit, percentage } from './unit'
export type { Unit, Percentage } from './unit'
export { space } from './spacing'
export type { Space } from './spacing'
export { grid } from './grid'
export type { Grid } from './grid'
export { primitiveColor, brandColor, semanticColor } from './color'
export {
  fontFamily,
  fontSize,
  lineHeight,
  fontStyle,
  letterSpacing,
  typography,
} from './typography'
export { radius, borderWidth, shadow, elevation } from './appearance'

import { unit, percentage } from './unit'
import { space } from './spacing'
import { grid } from './grid'
import { primitiveColor, brandColor, semanticColor } from './color'
import {
  fontFamily,
  fontSize,
  lineHeight,
  fontStyle,
  letterSpacing,
  typography,
} from './typography'
import { radius, borderWidth, shadow, elevation } from './appearance'

export const tokens = {
  unit,
  percentage,
  space,
  grid,
  color: {
    primitive: primitiveColor,
    brand: brandColor,
    semantic: semanticColor,
  },
  fontFamily,
  fontSize,
  lineHeight,
  fontStyle,
  letterSpacing,
  typography,
  radius,
  borderWidth,
  shadow,
  elevation,
} as const

export type Tokens = typeof tokens
