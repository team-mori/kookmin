import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'

export const styles = StyleSheet.create({
  root: {
    gap: theme.space[8],
  },
  row: {
    flexDirection: 'row',
    gap: theme.space[16],
  },
  textCol: {
    gap: 9,
  },
})
