import { Pressable } from 'react-native'
import { Icon } from '@/shared/components/Icon'
import { theme } from '@/shared/styles'
import { styles } from './Check.styles'

type CheckProps = {
  selected: boolean
  onPress?: () => void
  background?: boolean
  disabled?: boolean
}

export function Check({ selected, onPress, background = false, disabled = false }: CheckProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={[
        styles.root,
        background && (selected ? styles.bgSelected : styles.bgDefault),
        background && selected && disabled && styles.bgSelectedDisabled,
        disabled && (background && selected ? styles.disabledSelected : styles.disabled),
      ]}
    >
      <Icon name="check" color={selected ? theme.color.icon.info : theme.color.icon.quaternary} />
    </Pressable>
  )
}
