import { ActivityIndicator, Pressable, Text } from 'react-native'
import { Icon } from '@/shared/components/Icon'
import type { IconName } from '@/shared/components/Icon/types/types'
import { theme } from '@/shared/styles/theme'
import type { ButtonSize, ButtonType, ButtonVariant } from './types'
import { getContainerStyle, getIconColor, getTextColor } from './Button.colors'
import { styles } from './Button.styles'

type ButtonProps = {
  label: string
  type?: ButtonType
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  selected?: boolean
  leadingIcon?: IconName
  trailingIcon?: IconName
  onPress?: () => void
}

export function Button({
  label,
  type = 'primary',
  variant = 'filled',
  size = 48,
  disabled = false,
  loading = false,
  selected = false,
  leadingIcon,
  trailingIcon,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, selected, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { height: size },
        getContainerStyle(type, variant, pressed && !isDisabled, disabled, loading, selected),
      ]}
    >
      {({ pressed }) => {
        const iconColor = getIconColor(type, variant, pressed && !isDisabled, disabled, selected)
        const textColor = getTextColor(type, variant, pressed && !isDisabled, disabled, selected)

        return (
          <>
            {loading ? (
              <ActivityIndicator size={theme.unit[24]} color={iconColor} />
            ) : (
              leadingIcon && <Icon name={leadingIcon} size={theme.unit[24]} color={iconColor} />
            )}
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {!loading && trailingIcon && (
              <Icon name={trailingIcon} size={theme.unit[24]} color={iconColor} />
            )}
          </>
        )
      }}
    </Pressable>
  )
}
