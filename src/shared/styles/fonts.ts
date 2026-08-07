/**
 * Pretendard 로컬 폰트 맵 (`assets/fonts`).
 * RN은 weight별 파일·family 이름이 필요함 (Figma Variables의 typeface/sans = "Pretendard").
 * Metro는 로컬 폰트 에셋을 `require()`로 번들함.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Metro local font assets */
export const pretendardFontMap = {
  'Pretendard-Regular': require('../../../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../../../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../../../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../../../assets/fonts/Pretendard-Bold.otf'),
} as const

/** Figma font weight → expo-font에 등록한 family */
export const pretendardFace = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const

const faceByWeight = {
  '400': pretendardFace.regular,
  '500': pretendardFace.medium,
  '600': pretendardFace.semibold,
  '700': pretendardFace.bold,
} as const

export function pretendardForWeight(weight: string): string {
  return faceByWeight[weight as keyof typeof faceByWeight] ?? pretendardFace.regular
}
