import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  box24: { width: theme.unit[24], height: theme.unit[24] },
  box20: { width: theme.unit[20], height: theme.unit[20] },
  boxOn: { backgroundColor: theme.color.bg.interactive.primary },
  boxOnPressed: { backgroundColor: theme.color.bg.interactive['primary-pressed'] },
  boxOnDisabled: { backgroundColor: theme.color.bg.disabled },
  boxOff: {
    backgroundColor: theme.color.bg.primary,
    borderWidth: theme.borderWidth.sm,
    borderColor: theme.color.border.interactive.secondary,
  },
  boxOffPressed: { borderColor: theme.color.border.interactive['tertiary-pressed'] },
  boxOffDisabled: {
    backgroundColor: theme.color.bg.disabled,
    borderColor: theme.color.border.disabled,
  },
})
