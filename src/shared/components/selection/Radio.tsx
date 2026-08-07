import { Pressable, View } from 'react-native'
import { Label } from '../label'
import { styles } from './Radio.styles'

type RadioProps = {
  checked: boolean
  onPress?: () => void
  disabled?: boolean
  size?: 24 | 20
  label?: string
}

export function Radio({ checked, onPress, disabled = false, size = 24, label }: RadioProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={(44 - size) / 2}
      onPress={onPress}
      style={styles.row}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.circle,
              size === 24 ? styles.circle24 : styles.circle20,
              checked ? styles.circleOn : styles.circleOff,
              pressed && !disabled && (checked ? styles.circleOnPressed : styles.circleOffPressed),
              disabled && (checked ? styles.circleOnDisabled : styles.circleOffDisabled),
            ]}
          >
            {checked && <View style={[styles.dot, size === 24 ? styles.dot24 : styles.dot20]} />}
          </View>
          {label != null && <Label>{label}</Label>}
        </>
      )}
    </Pressable>
  )
}
