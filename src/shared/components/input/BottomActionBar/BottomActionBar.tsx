import React from 'react'
import { View } from 'react-native'
import { ButtonStack } from '@/shared/components/input/ButtonStack'
import type { ButtonStackType } from '@/shared/components/input/ButtonStack'
import type { BottomActionBarType } from './types'
import { styles } from './BottomActionBar.styles'

const STACK_TYPE_MAP: Record<BottomActionBarType, ButtonStackType> = {
  '2-stack': 'stack',
  '3-stack': '3-stack',
  justify: 'justify',
}

type BottomActionBarProps = {
  type?: BottomActionBarType
  shadow?: boolean
  children: React.ReactNode
}

export function BottomActionBar({
  type = '2-stack',
  shadow = false,
  children,
}: BottomActionBarProps) {
  return (
    <View style={[styles.container, shadow && styles.shadow]}>
      <ButtonStack type={STACK_TYPE_MAP[type]}>{children}</ButtonStack>
    </View>
  )
}
