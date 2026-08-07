import { theme } from '@/shared/styles/theme'
import { iconMap } from './iconMap'
import type { IconName } from './types/types'

type IconProps = {
  name: IconName
  size?: number
  color?: string
}

export function Icon({ name, size = 24, color = theme.color.icon.primary }: IconProps) {
  const LucideIcon = iconMap[name]
  return <LucideIcon size={size} color={color} strokeWidth={2} />
}
