import { View } from 'react-native'
import { theme } from '@/shared/styles'
import { Skeleton } from './Skeleton'
import { styles } from './SkeletonVideo.styles'

const CIRCLE = 33
const VIDEO_RATIO = 133 / 193
const SECOND_LINE_RATIO = 101 / 144

type SkeletonVideoProps = {
  width?: number
}

export function SkeletonVideo({ width = 193 }: SkeletonVideoProps) {
  const textWidth = width - CIRCLE - theme.space[16]
  return (
    <View style={styles.root}>
      <Skeleton width={width} height={Math.round(width * VIDEO_RATIO)} />
      <View style={styles.row}>
        <Skeleton variant="circle" />
        <View style={styles.textCol}>
          <Skeleton variant="text" width={textWidth} height={14} />
          <Skeleton variant="text" width={Math.round(textWidth * SECOND_LINE_RATIO)} height={14} />
        </View>
      </View>
    </View>
  )
}
