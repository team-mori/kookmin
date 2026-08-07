import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'
import { pretendardForWeight } from '@/shared/styles/fonts'

export const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title28: {
    fontFamily: pretendardForWeight(theme.typography.Heading.md['font weight']),
    fontSize: theme.typography.Heading.md['font size'],
    lineHeight: theme.typography.Heading.md['line height'],
    letterSpacing: theme.typography.Heading['letter spacing'],
    color: theme.color.text.primary,
  },
  title24: {
    fontFamily: pretendardForWeight(theme.typography.Body['font weight'].medium),
    fontSize: theme.typography.Body.lg['font size'],
    lineHeight: theme.typography.Body.lg['line height'],
    letterSpacing: theme.typography.Body.lg['letter spacing'],
    color: theme.color.text.primary,
  },
  more: {
    fontFamily: pretendardForWeight(theme.typography.Body['font weight'].regular),
    fontSize: theme.typography.Body.md['font size'],
    lineHeight: theme.typography.Body.md['line height'],
    letterSpacing: theme.typography.Body.md['letter spacing'],
    color: theme.color.text.quaternary,
    textDecorationLine: 'underline',
  },
})
