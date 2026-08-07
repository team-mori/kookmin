import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
  },
  rowCenter: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  track: {
    width: theme.unit[40],
    height: theme.unit[24],
    padding: theme.space[4],
    borderRadius: theme.radius.rounded,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackOn: {
    backgroundColor: theme.color.bg.interactive.primary,
    justifyContent: 'flex-end',
  },
  trackOnPressed: { backgroundColor: theme.color.bg.interactive['primary-pressed'] },
  trackOnDisabled: { backgroundColor: theme.color.bg.disabled },
  trackOff: {
    backgroundColor: theme.color.bg.interactive.secondary,
    borderWidth: theme.borderWidth.sm,
    borderColor: theme.color.border.secondary,
  },
  trackOffPressed: {
    backgroundColor: theme.color.bg.interactive['Secondary-pressed'],
    borderColor: theme.color.border.primary,
  },
  trackOffDisabled: {
    backgroundColor: theme.color.bg.disabled,
    borderWidth: 0,
  },
  indicator: {
    width: theme.unit[16],
    height: theme.unit[16],
    borderRadius: theme.radius.rounded,
    backgroundColor: theme.color.bg.primary,
    ...theme.elevation.shadow2,
  },
  indicatorDisabled: {
    backgroundColor: theme.color.bg.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
})
