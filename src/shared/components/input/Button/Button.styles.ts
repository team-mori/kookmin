import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles/theme'
import { pretendardForWeight } from '@/shared/styles/fonts'

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[8],
    paddingHorizontal: theme.space[24],
    borderRadius: theme.radius.md,
  },
  label: {
    fontFamily: pretendardForWeight(theme.typography.Body['font weight'].semibold),
    fontSize: theme.typography.Body.lg['font size'],
    fontWeight: theme.typography.Body['font weight'].semibold,
    lineHeight: theme.typography.Body.lg['line height'],
    letterSpacing: theme.typography.Body.lg['letter spacing'],
  },
})
