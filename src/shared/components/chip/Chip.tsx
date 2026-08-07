import { Pressable, Text } from 'react-native'
import { theme } from '@/shared/styles'
import { styles } from './Chip.styles'

// 대국민지도 자체 컴포넌트 — 카테고리 필터 칩 (시안: 흰 필, 선택 시 그린/검정 채움)
type ChipProps = {
  label: string
  selected?: boolean
  tone?: 'brand' | 'dark'
  onPress?: () => void
}

export function Chip({ label, selected = false, tone = 'brand', onPress }: ChipProps) {
  const selectedBg =
    tone === 'brand' ? theme.color.bg.interactive.primary : theme.color.primitive.neutral[800]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.root, selected && { backgroundColor: selectedBg, borderColor: selectedBg }]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  )
}
