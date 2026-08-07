import { Animated } from 'react-native'
import { LoaderCircle } from 'lucide-react-native'
import { theme } from '@/shared/styles'
import { useSweep } from './useSweep'

const SIZE = { sm: 16, md: 24, lg: 32, xl: 48 } as const

type SpinnerProps = {
  size?: keyof typeof SIZE
  type?: 'primary' | 'secondary'
}

export function Spinner({ size = 'md', type = 'primary' }: SpinnerProps) {
  const spin = useSweep(1000)
  const px = SIZE[size]
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return (
    <Animated.View style={{ width: px, height: px, transform: [{ rotate }] }}>
      <LoaderCircle
        size={px}
        color={
          type === 'primary'
            ? theme.color.icon.interactive.primary
            : theme.color.icon.interactive.secondary
        }
      />
    </Animated.View>
  )
}
