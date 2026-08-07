import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  root: {
    // Figma 원본 28px — unit 스케일(…24, 32…)에 없는 값
    width: 28,
    height: 28,
    borderRadius: theme.radius.rounded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgDefault: { backgroundColor: theme.color.bg.tertiary },
  // Figma에서 변수 미바인딩 원시 hex — Variables에 추가되면 토큰으로 교체
  bgSelected: { backgroundColor: '#daeaff' },
  bgSelectedDisabled: { backgroundColor: '#c7e0ff' },
  disabled: { opacity: 0.7 },
  disabledSelected: { opacity: 0.5 },
})
