import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles'
import { pretendardForWeight } from '@/shared/styles/fonts'

const medium = pretendardForWeight(theme.typography.Body['font weight'].medium)

export const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    gap: theme.space[8],
  },
  field: {
    gap: theme.space[4],
  },
  label: {
    fontFamily: medium,
    fontSize: theme.typography.Body.md['font size'],
    lineHeight: theme.typography.Body.md['line height'],
    letterSpacing: theme.typography.Body.md['letter spacing'],
    color: theme.color.text.primary,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: theme.borderWidth.sm,
  },
  box56: {
    height: 56,
    paddingHorizontal: theme.space[16],
    borderRadius: theme.radius.md,
  },
  box48: {
    height: theme.unit[48],
    paddingHorizontal: theme.space[16],
    borderRadius: theme.radius.sm,
  },
  box32: {
    height: theme.unit[32],
    paddingHorizontal: theme.space[12],
    borderRadius: theme.radius.sm,
  },
  boxDefault: {
    backgroundColor: theme.color.bg.primary,
    borderColor: theme.color.border.secondary,
  },
  boxFocused: {
    backgroundColor: theme.color.bg.primary,
    borderColor: theme.color.border.interactive['tertiary-pressed'],
  },
  boxError: {
    backgroundColor: theme.color.bg.primary,
    borderColor: theme.color.border.interactive.danger,
  },
  boxDisabled: {
    backgroundColor: theme.color.bg.disabled,
    borderColor: theme.color.border.disabled,
  },
  boxLocked: {
    backgroundColor: theme.color.bg.secondary,
    borderColor: theme.color.border.secondary,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: medium,
  },
  input56: {
    fontSize: theme.typography.Body.lg['font size'],
    lineHeight: theme.typography.Body.lg['line height'],
    letterSpacing: theme.typography.Body.lg['letter spacing'],
  },
  input32: {
    fontSize: theme.typography.Body.md['font size'],
    lineHeight: theme.typography.Body.md['line height'],
    letterSpacing: theme.typography.Body.md['letter spacing'],
  },
  inputTyping: {
    color: theme.color.text.secondary,
  },
  inputFilled: {
    color: theme.color.text.primary,
    opacity: 0.7,
  },
  inputDisabled: {
    color: theme.color.text.disabled,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    minHeight: theme.unit[24],
  },
  help: {
    fontFamily: medium,
    fontSize: theme.typography.Body.md['font size'],
    lineHeight: theme.typography.Body.md['line height'],
    letterSpacing: theme.typography.Body.md['letter spacing'],
  },
  helpDefault: {
    color: theme.color.text.tertiary,
  },
  helpError: {
    color: theme.color.text.danger,
  },
  helpSuccess: {
    color: theme.color.text.success,
  },
})
