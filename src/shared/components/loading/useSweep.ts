import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'

export function useSweep(duration: number) {
  const [value] = useState(() => new Animated.Value(0))
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [value, duration])
  return value
}
