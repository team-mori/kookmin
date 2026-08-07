import { useState } from 'react'
import type { ReactNode } from 'react'
import { Text, TextInput, View } from 'react-native'
import { Icon } from '@/shared/components/Icon'
import { theme } from '@/shared/styles'
import { styles } from './TextField.styles'

type FieldState = 'default' | 'focused' | 'filled' | 'error' | 'disabled' | 'locked'
type TextFieldStatus = 'default' | 'error' | 'success'

type TextFieldProps = {
  value: string
  onChangeText?: (text: string) => void
  placeholder?: string
  label?: string
  helpMessage?: string
  status?: TextFieldStatus
  size?: 56 | 48 | 32
  width?: number
  disabled?: boolean
  locked?: boolean
  trailingIcon?: ReactNode
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  label,
  helpMessage,
  status = 'default',
  size = 56,
  width,
  disabled = false,
  locked = false,
  trailingIcon,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false)
  const state = getFieldState({
    disabled,
    locked,
    error: status === 'error',
    focused,
    filled: value.length > 0,
  })

  return (
    <View style={[styles.root, width != null && { width, alignSelf: 'flex-start' }]}>
      <View style={styles.field}>
        {label != null && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.box, SIZE_BOX[size], BOX[state]]}>
          <TextInput
            style={[styles.input, size === 32 ? styles.input32 : styles.input56, INPUT[state]]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.color.text.quaternary}
            editable={!disabled && !locked}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {trailingIcon}
        </View>
      </View>
      {helpMessage != null && (
        <View style={styles.helpRow}>
          {status === 'error' && <Icon name="x-circle" color={theme.color.icon.danger} />}
          {status === 'success' && <Icon name="check" color={theme.color.icon.success} />}
          <Text style={[styles.help, HELP[status]]}>{helpMessage}</Text>
        </View>
      )}
    </View>
  )
}

function getFieldState(flags: {
  disabled: boolean
  locked: boolean
  error: boolean
  focused: boolean
  filled: boolean
}): FieldState {
  if (flags.disabled) return 'disabled'
  if (flags.locked) return 'locked'
  if (flags.error) return 'error'
  if (flags.focused) return 'focused'
  if (flags.filled) return 'filled'
  return 'default'
}

const SIZE_BOX = {
  56: styles.box56,
  48: styles.box48,
  32: styles.box32,
} as const

const BOX: Record<FieldState, object> = {
  default: styles.boxDefault,
  focused: styles.boxFocused,
  filled: styles.boxDefault,
  error: styles.boxError,
  disabled: styles.boxDisabled,
  locked: styles.boxLocked,
}

const INPUT: Record<FieldState, object | undefined> = {
  default: undefined,
  focused: styles.inputTyping,
  filled: styles.inputFilled,
  error: styles.inputTyping,
  disabled: styles.inputDisabled,
  locked: styles.inputFilled,
}

const HELP = {
  default: styles.helpDefault,
  error: styles.helpError,
  success: styles.helpSuccess,
} as const
