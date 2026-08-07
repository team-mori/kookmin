import { Pressable, Text, View } from 'react-native'
import { SearchX } from 'lucide-react-native'
import { theme } from '@/shared/styles'
import { styles } from './EmptyState.styles'

// 대국민지도 도메인 문구 (quickmeat 원본에서 교체)
const DEFAULT_MESSAGE = {
  search: '등록되지 않은 장소예요',
  place: '이 층에 등록된 장소가 없습니다',
  route: '확인된 경로가 없습니다',
} as const

type EmptyStateProps = {
  type: keyof typeof DEFAULT_MESSAGE
  message?: string
  actionLabel?: string
  onActionPress?: () => void
}

export function EmptyState({ type, message, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View style={[styles.root, styles.rootDefault]}>
      <SearchX size={44} color={theme.color.icon.primary} strokeWidth={1.5} />
      <View style={styles.texts}>
        <Text style={styles.message}>{message ?? DEFAULT_MESSAGE[type]}</Text>
        {actionLabel != null && (
          <Pressable accessibilityRole="button" hitSlop={12} onPress={onActionPress}>
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
