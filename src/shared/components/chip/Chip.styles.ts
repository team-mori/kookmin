import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  root: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.color.bg.primary,
    borderWidth: 1,
    borderColor: theme.color.primitive.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.color.text.primary,
  },
  labelSelected: {
    color: theme.color.text.interactive.inverse,
    fontWeight: '600',
  },
})
