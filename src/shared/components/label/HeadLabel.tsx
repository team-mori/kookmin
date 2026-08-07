import { Pressable, Text, View } from 'react-native'
import { styles } from './HeadLabel.styles'

type HeadLabelProps = {
  children: string
  /** 타이틀 line-height 기준 (28 → Heading/md, 24 → Body/lg) */
  size?: 28 | 24
  more?: string
  onMorePress?: () => void
}

export function HeadLabel({ children, size = 28, more, onMorePress }: HeadLabelProps) {
  return (
    <View style={styles.root}>
      <Text style={size === 28 ? styles.title28 : styles.title24}>{children}</Text>
      {more != null && (
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onMorePress}>
          <Text style={styles.more}>{more}</Text>
        </Pressable>
      )}
    </View>
  )
}
