import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.rounded,
  },
  circle24: { width: theme.unit[24], height: theme.unit[24] },
  circle20: { width: theme.unit[20], height: theme.unit[20] },
  circleOn: { backgroundColor: theme.color.bg.interactive.primary },
  circleOnPressed: { backgroundColor: theme.color.bg.interactive['primary-pressed'] },
  circleOnDisabled: { backgroundColor: theme.color.bg.disabled },
  circleOff: {
    backgroundColor: theme.color.bg.primary,
    borderWidth: theme.borderWidth.sm,
    borderColor: theme.color.border.interactive.secondary,
  },
  circleOffPressed: {
    backgroundColor: theme.color.bg.interactive['Secondary-pressed'],
    borderColor: theme.color.border.interactive['tertiary-pressed'],
  },
  circleOffDisabled: {
    backgroundColor: theme.color.bg.disabled,
    borderColor: theme.color.border.disabled,
  },
  // dot은 모든 state에서 흰색 (disabled 포함)
  dot: {
    borderRadius: theme.radius.rounded,
    backgroundColor: theme.color.icon.interactive.inverse,
  },
  dot24: { width: theme.unit[12], height: theme.unit[12] },
  dot20: { width: 10, height: 10 },
})
