import type { ViewStyle } from 'react-native'
import { theme } from '@/shared/styles/theme'
import type { ButtonType, ButtonVariant } from './types'

export function getContainerStyle(
  type: ButtonType,
  variant: ButtonVariant,
  pressed: boolean,
  disabled: boolean,
  loading = false,
  selected = false,
): ViewStyle {
  if (type === 'tertiary') {
    if (disabled) return { backgroundColor: theme.color.bg.disabled }
    if (pressed) return { backgroundColor: theme.color.bg.interactive['tertiary-pressed'] }
    return { backgroundColor: theme.color.bg.interactive.tertiary }
  }

  if (loading) {
    const radiusOverride = type === 'secondary' ? { borderRadius: theme.radius.xl } : {}
    if (type === 'primary') {
      if (variant === 'filled') return { backgroundColor: theme.color.bg.interactive.primary }
      if (variant === 'outlined')
        return {
          borderWidth: theme.borderWidth.sm,
          borderColor: theme.color.border.interactive.primary,
        }
      if (variant === 'danger') return { backgroundColor: theme.color.bg.interactive.danger }
      return {}
    }
    if (variant === 'filled')
      return { ...radiusOverride, backgroundColor: theme.color.bg.interactive.secondary }
    if (variant === 'outlined')
      return {
        ...radiusOverride,
        borderWidth: theme.borderWidth.sm,
        borderColor: theme.color.border.interactive.secondary,
      }
    return radiusOverride
  }

  if (disabled) {
    if (variant === 'outlined') {
      return {
        backgroundColor: theme.color.bg.disabled,
        borderWidth: theme.borderWidth.sm,
        borderColor: theme.color.border.disabled,
      }
    }
    return { backgroundColor: theme.color.bg.disabled }
  }

  if (selected) {
    if (variant === 'danger') return { backgroundColor: theme.color.bg['danger-subtle'] }
    if (variant === 'outlined') {
      return {
        backgroundColor: theme.color.bg.interactive.selected,
        borderWidth: theme.borderWidth.sm,
        borderColor: theme.color.border.interactive.primary,
      }
    }
    return {
      backgroundColor:
        type === 'secondary'
          ? theme.color.bg.interactive['secondary selected']
          : theme.color.bg.interactive.selected,
    }
  }

  if (type === 'primary') {
    if (variant === 'filled') {
      return {
        backgroundColor: pressed
          ? theme.color.bg.interactive['primary-pressed']
          : theme.color.bg.interactive.primary,
      }
    }
    if (variant === 'outlined') {
      return {
        ...(pressed && { backgroundColor: theme.color.bg.interactive['Secondary-pressed'] }),
        borderWidth: theme.borderWidth.sm,
        borderColor: pressed
          ? theme.color.border.interactive['primary-pressed']
          : theme.color.border.interactive.primary,
      }
    }
    if (variant === 'danger') {
      return {
        backgroundColor: pressed
          ? theme.color.bg.interactive['danger-pressed']
          : theme.color.bg.interactive.danger,
      }
    }
    return pressed ? { backgroundColor: theme.color.bg.interactive['Secondary-pressed'] } : {}
  }

  if (variant === 'filled') {
    return {
      backgroundColor: pressed
        ? theme.color.bg.interactive['Secondary-pressed']
        : theme.color.bg.interactive.secondary,
    }
  }
  if (variant === 'outlined') {
    return {
      ...(pressed && { backgroundColor: theme.color.bg.interactive['Secondary-pressed'] }),
      borderWidth: theme.borderWidth.sm,
      borderColor: pressed
        ? theme.color.border.interactive['tertiary-pressed']
        : theme.color.border.secondary,
    }
  }
  return pressed ? { backgroundColor: theme.color.bg.interactive['Secondary-pressed'] } : {}
}

export function getTextColor(
  type: ButtonType,
  variant: ButtonVariant,
  pressed: boolean,
  disabled: boolean,
  selected = false,
): string {
  if (type === 'tertiary') {
    if (disabled) return theme.color.text.disabled
    if (pressed) return theme.color.text.interactive['primary-pressed']
    return theme.color.text.interactive.primary
  }

  if (disabled) {
    return theme.color.text.disabled
  }

  if (selected) {
    if (variant === 'danger') return theme.color.text.danger
    if (variant === 'filled') return theme.color.text.interactive.primary
    return theme.color.text.interactive['primary-pressed']
  }

  if (type === 'primary' && (variant === 'filled' || variant === 'danger')) {
    return theme.color.text.interactive.inverse
  }

  if (type === 'primary') {
    return pressed
      ? theme.color.text.interactive['primary-pressed']
      : theme.color.text.interactive.primary
  }

  return pressed
    ? theme.color.text.interactive['secondary-pressed']
    : theme.color.text.interactive.secondary
}

export function getIconColor(
  type: ButtonType,
  variant: ButtonVariant,
  pressed: boolean,
  disabled: boolean,
  selected = false,
): string {
  if (type === 'tertiary') {
    if (disabled) return theme.color.icon.disabled
    if (pressed) return theme.color.icon.interactive['primary-pressed']
    return theme.color.icon.interactive.primary
  }

  if (disabled) {
    return theme.color.icon.disabled
  }

  if (selected) {
    if (variant === 'danger') return theme.color.icon.danger
    if (variant === 'filled') return theme.color.icon.interactive.primary
    return theme.color.icon.interactive['primary-pressed']
  }

  if (type === 'primary' && (variant === 'filled' || variant === 'danger')) {
    return theme.color.icon.interactive.inverse
  }

  if (type === 'primary') {
    return pressed
      ? theme.color.icon.interactive['primary-pressed']
      : theme.color.icon.interactive.primary
  }

  return pressed
    ? theme.color.icon.interactive['Secondary-pressed']
    : theme.color.icon.interactive.secondary
}
