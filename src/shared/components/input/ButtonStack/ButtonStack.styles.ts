import { StyleSheet } from 'react-native'
import type { ViewStyle } from 'react-native'
import { theme } from '@/shared/styles/theme'
import type { ButtonStackType } from './types'

export function getContainerStyle(type: ButtonStackType): ViewStyle {
  if (type === 'stack' || type === '3-stack') {
    return {
      flexDirection: 'column' as const,
      gap: theme.space[4],
    }
  }

  const rowBase = {
    flexDirection: 'row' as const,
    gap: theme.space[12],
  }

  if (type === 'justify') return rowBase
  if (type === 'start') return { ...rowBase, justifyContent: 'flex-start' as const }
  if (type === 'end') return { ...rowBase, justifyContent: 'flex-end' as const }
  return { ...rowBase, justifyContent: 'center' as const }
}

export const styles = StyleSheet.create({
  justifyChild: {
    flex: 1,
  },
  threeStackGroup: {
    flexDirection: 'column',
    gap: theme.space[8],
  },
})
