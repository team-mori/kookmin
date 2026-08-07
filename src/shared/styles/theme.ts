import {
  unit,
  percentage,
  space,
  grid,
  primitiveColor,
  brandColor,
  semanticColor,
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
} from './tokens'

/**
 * 앱에서 쓰는 theme.
 * 키는 Figma Variables 이름과 동일 (kebab/공백/오타 포함) → bracket 접근.
 * 예: `theme.color.text['info-bold']`, `theme.color.bg['dim-32%']`,
 *     `theme.typography.Heading.md['font size']`
 */
export const theme = {
  unit,
  percentage,
  space,
  grid,
  color: {
    primitive: primitiveColor,
    brand: brandColor,
    ...semanticColor,
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

export type Theme = typeof theme
