import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'
import { pretendardForWeight } from '@/shared/styles/fonts'

const medium = pretendardForWeight(theme.typography.Body['font weight'].medium)

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
  },
  text16: {
    fontFamily: medium,
    fontSize: theme.typography.Body.lg['font size'],
    lineHeight: theme.typography.Body.lg['line height'],
    letterSpacing: theme.typography.Body.lg['letter spacing'],
    color: theme.color.text.secondary,
  },
  text14: {
    fontFamily: medium,
    fontSize: theme.typography.Body.md['font size'],
    lineHeight: theme.typography.Body.md['line height'],
    letterSpacing: theme.typography.Body.md['letter spacing'],
    color: theme.color.text.secondary,
  },
  textOptional16: {
    color: theme.color.text.primary,
  },
  star: {
    color: theme.color.text.danger,
  },
  suffix16: {
    fontFamily: medium,
    fontSize: theme.typography.Body.md['font size'],
    lineHeight: theme.typography.Body.md['line height'],
    letterSpacing: theme.typography.Body.md['letter spacing'],
    color: theme.color.text.quaternary,
  },
  suffix14: {
    fontFamily: medium,
    fontSize: theme.typography.Body.sm['font size'],
    lineHeight: theme.typography.Body.sm['line height'],
    letterSpacing: theme.typography.Body.sm['letter spacing'],
    color: theme.color.text.quaternary,
  },
})
