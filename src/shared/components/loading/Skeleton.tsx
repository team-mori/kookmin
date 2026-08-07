import { useId } from 'react'
import { Animated, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { theme } from '@/shared/styles'
import { useSweep } from './useSweep'

const DEFAULT_SIZE = {
  rest: { width: 144, height: 98 },
  circle: { width: 33, height: 33 },
  text: { width: 144, height: 21 },
} as const

const FILL = theme.color.bg.disabled

const DIR = Math.SQRT1_2

type SkeletonProps = {
  variant?: keyof typeof DEFAULT_SIZE
  width?: number
  height?: number
  band?: number
  duration?: number
}

export function Skeleton({
  variant = 'rest',
  width,
  height,
  band = 0.3,
  duration = 1300,
}: SkeletonProps) {
  const w = width ?? DEFAULT_SIZE[variant].width
  const h = height ?? (variant === 'circle' ? w : DEFAULT_SIZE[variant].height)
  const radius = variant === 'circle' ? w / 2 : theme.radius.sm
  const diagonal = Math.hypot(w, h)
  const spacing = (w + h) * DIR + 2 * band * diagonal
  const margin = (spacing * DIR) / 2
  const sweep = useSweep(duration)
  const shift = sweep.interpolate({ inputRange: [0, 1], outputRange: [-margin, margin] })
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        overflow: 'hidden',
        backgroundColor: FILL,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: -margin,
          top: -margin,
          width: w + 2 * margin,
          height: h + 2 * margin,
          transform: [{ translateX: shift }, { translateY: shift }],
        }}
      >
        <HighlightBand
          width={w + 2 * margin}
          height={h + 2 * margin}
          half={band * diagonal}
          spacing={spacing}
        />
      </Animated.View>
    </View>
  )
}

function HighlightBand({
  width,
  height,
  half,
  spacing,
}: {
  width: number
  height: number
  half: number
  spacing: number
}) {
  const id = useId()
  const axis = (width + height) * DIR
  const centers = [axis / 2 - spacing / 2, axis / 2 + spacing / 2]
  const clamp = (v: number) => Math.max(0, Math.min(1, v / axis)).toFixed(4)
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={axis * DIR}
          y2={axis * DIR}
        >
          {centers.flatMap((center) => [
            <Stop
              key={`${center}-in`}
              offset={clamp(center - half)}
              stopColor={theme.color.bg.primary}
              stopOpacity="0"
            />,
            <Stop
              key={`${center}-peak`}
              offset={clamp(center)}
              stopColor={theme.color.bg.primary}
              stopOpacity="0.29"
            />,
            <Stop
              key={`${center}-out`}
              offset={clamp(center + half)}
              stopColor={theme.color.bg.primary}
              stopOpacity="0"
            />,
          ])}
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  )
}
