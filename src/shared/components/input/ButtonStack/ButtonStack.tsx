import React from 'react'
import { View } from 'react-native'
import type { ButtonStackType } from './types'
import { getContainerStyle, styles } from './ButtonStack.styles'

type ButtonStackProps = {
  type?: ButtonStackType
  children: React.ReactNode
}

export function ButtonStack({ type = 'stack', children }: ButtonStackProps) {
  if (type === '3-stack') {
    const childArray = React.Children.toArray(children)
    const top = childArray.slice(0, 2)
    const rest = childArray.slice(2)
    return (
      <View style={getContainerStyle(type)}>
        <View style={styles.threeStackGroup}>{top}</View>
        {rest}
      </View>
    )
  }

  return (
    <View style={getContainerStyle(type)}>
      {type === 'justify'
        ? React.Children.map(children, (child) => <View style={styles.justifyChild}>{child}</View>)
        : children}
    </View>
  )
}
