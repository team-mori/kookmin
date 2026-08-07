import { Text, View } from 'react-native'
import { styles } from './Label.styles'

type LabelProps = {
  children: string
  size?: 16 | 14
  type?: 'none' | 'optional' | 'required'
}

export function Label({ children, size = 16, type = 'none' }: LabelProps) {
  const textStyle = size === 16 ? styles.text16 : styles.text14
  return (
    <View style={styles.root}>
      <Text style={[textStyle, type === 'optional' && size === 16 && styles.textOptional16]}>
        {children}
      </Text>
      {type === 'required' && <Text style={[textStyle, styles.star]}>*</Text>}
      {type === 'optional' && (
        <Text style={size === 16 ? styles.suffix16 : styles.suffix14}>(Optional)</Text>
      )}
    </View>
  )
}
