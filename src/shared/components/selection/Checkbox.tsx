import { Pressable, View } from 'react-native'
import { Icon } from '@/shared/components/Icon'
import { theme } from '@/shared/styles'
import { Label } from '../label'
import { styles } from './Checkbox.styles'

type CheckboxProps = {
  checked: boolean
  onChange?: (checked: boolean) => void
  indeterminate?: boolean
  disabled?: boolean
  size?: 24 | 20
  label?: string
}

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  size = 24,
  label,
}: CheckboxProps) {
  const on = checked || indeterminate
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={(44 - size) / 2}
      onPress={() => onChange?.(!checked)}
      style={styles.row}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.box,
              size === 24 ? styles.box24 : styles.box20,
              on ? styles.boxOn : styles.boxOff,
              pressed && !disabled && (on ? styles.boxOnPressed : styles.boxOffPressed),
              disabled && (on ? styles.boxOnDisabled : styles.boxOffDisabled),
            ]}
          >
            {indeterminate ? (
              <Icon name="minus" size={size} color={theme.color.icon.interactive.inverse} />
            ) : checked ? (
              <Icon
                name="check"
                size={size}
                color={disabled ? theme.color.icon.disabled : theme.color.icon.interactive.inverse}
              />
            ) : null}
          </View>
          {label != null && <Label>{label}</Label>}
        </>
      )}
    </Pressable>
  )
}
