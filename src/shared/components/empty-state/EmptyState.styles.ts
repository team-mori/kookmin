import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'
import { pretendardForWeight } from '@/shared/styles/fonts'

export const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: theme.space[4],
    paddingHorizontal: 38,
    backgroundColor: theme.color.bg.primary,
  },
  rootDefault: {
    paddingTop: theme.space[32],
    paddingBottom: theme.space[40],
  },
  rootCompact: {
    paddingTop: theme.space[20],
    paddingBottom: theme.space[24],
  },
  texts: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: theme.space[8],
  },
  message: {
    fontFamily: pretendardForWeight(theme.typography.Body['font weight'].semibold),
    fontSize: theme.typography.Body.lg['font size'],
    lineHeight: theme.typography.Body.lg['line height'],
    letterSpacing: theme.typography.Body.lg['letter spacing'],
    color: theme.color.text.tertiary,
    textAlign: 'center',
  },
  action: {
    fontFamily: pretendardForWeight(theme.typography.Body['font weight'].regular),
    fontSize: theme.typography.Body.sm['font size'],
    lineHeight: theme.typography.Body.sm['line height'],
    letterSpacing: theme.typography.Body.sm['letter spacing'],
    color: theme.color.text.quaternary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
})
