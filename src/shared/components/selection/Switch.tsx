import { Pressable, View } from 'react-native'
import { Label } from '../label'
import { styles } from './Switch.styles'

type SwitchProps = {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  /** left: 스위치-라벨 / right: 라벨-스위치 / center: 라벨과 스위치 양끝 정렬 */
  direction?: 'left' | 'right' | 'center'
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  direction = 'left',
}: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={10}
      onPress={() => onChange?.(!checked)}
      style={[styles.row, direction === 'center' && styles.rowCenter]}
    >
      {({ pressed }) => {
        const track = (
          <View
            style={[
              styles.track,
              checked ? styles.trackOn : styles.trackOff,
              pressed && !disabled && (checked ? styles.trackOnPressed : styles.trackOffPressed),
              disabled && (checked ? styles.trackOnDisabled : styles.trackOffDisabled),
            ]}
          >
            <View style={[styles.indicator, disabled && styles.indicatorDisabled]} />
          </View>
        )
        const text = label != null ? <Label>{label}</Label> : null
        return direction === 'left' ? (
          <>
            {track}
            {text}
          </>
        ) : (
          <>
            {text}
            {track}
          </>
        )
      }}
    </Pressable>
  )
}
