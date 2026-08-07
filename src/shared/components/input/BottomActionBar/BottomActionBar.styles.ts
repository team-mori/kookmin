import { StyleSheet } from 'react-native'
import { theme } from '@/shared/styles/theme'

const castY = theme.shadow[16]['cast-y']
const castBlur = theme.shadow[16]['cast-blur']
const coreY = theme.shadow[16]['core-y']
const coreBlur = theme.shadow[16]['core-blur']

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.color.bg.primary,
    paddingTop: theme.space[12],
    paddingBottom: theme.space[32],
    paddingHorizontal: theme.space[20],
    width: '100%',
  },
  // Figma elevation/shadow-16: cast + core.
  shadow: {
    boxShadow: [
      {
        offsetX: 0,
        offsetY: castY,
        blurRadius: castBlur,
        spreadDistance: 0,
        color: theme.color.effect.shadow.cast,
      },
      {
        offsetX: 0,
        offsetY: coreY,
        blurRadius: coreBlur,
        spreadDistance: 0,
        color: theme.color.effect.shadow.core,
      },
    ],
  },
})
