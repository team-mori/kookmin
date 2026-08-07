/**
 * Figma Primitive : Typography + Semantic :  Typograhy (철자 포함 거울).
 * @see ./figma-variables.json
 */

export const fontFamily = {
  typeface: {
    sans: 'Pretendard',
  },
  system: {
    android: 'Roboto',
    IOS: 'SF pro',
  },
} as const

export const fontSize = {
  300: 12,
  350: 14,
  400: 16,
  500: 20,
  600: 24,
  700: 28,
  900: 36,
  1000: 40,
  1200: 48,
} as const

export const lineHeight = {
  300: 12,
  350: 14,
  400: 16,
  500: 20,
  600: 24,
  700: 28,
  800: 32,
  900: 36,
  1000: 40,
  1200: 48,
  1400: 56,
} as const

export const fontStyle = {
  normal: {
    thin: '100',
    'extra light': '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

export const letterSpacing = {
  tighter: -0.4000000059604645,
  tight: -0.20000000298023224,
  narmal: 0,
  loose: 0.20000000298023224,
  looser: 0.4000000059604645,
  loosest: 1,
  expanded: 1.5,
} as const

/** Semantic :  Typograhy (Figma 컬렉션명 철자 그대로). */
export const typography = {
  Heading: {
    'font family': fontFamily.typeface.sans,
    'letter spacing': letterSpacing.tight,
    '2xl': {
      'font size': 36,
      'line height': 40,
      'font weight': '600',
    },
    xl: {
      'font size': 28,
      'line height': 36,
      'font weight': '600',
    },
    lg: {
      'font size': 24,
      'line height': 32,
      'font weight': '600',
    },
    md: {
      'font size': 20,
      'line height': 28,
      'font weight': '600',
    },
    sm: {
      'font size': 16,
      'line height': 24,
      'font weight': '600',
    },
  },
  Body: {
    'font family': fontFamily.typeface.sans,
    'font weight': {
      semibold: '600',
      medium: '500',
      regular: '400',
      Bold: '700',
    },
    lg: {
      'letter spacing': 0,
      'font size': 16,
      'line height': 24,
    },
    md: {
      'font size': 14,
      'line height': 20,
      'letter spacing': 0,
    },
    sm: {
      'font size': 12,
      'line height': 16,
      'letter spacing': 0,
    },
  },
} as const
