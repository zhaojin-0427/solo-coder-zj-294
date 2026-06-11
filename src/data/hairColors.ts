import type { HairColor } from '@/types'

export const hairColors: HairColor[] = [
  {
    id: 'cool-brown',
    name: '冷棕',
    primaryColor: '#5D4E37',
    secondaryColor: '#8B7355',
  },
  {
    id: 'linen',
    name: '亚麻',
    primaryColor: '#C4A77D',
    secondaryColor: '#E8D4B0',
  },
  {
    id: 'rose-red',
    name: '玫红',
    primaryColor: '#C2185B',
    secondaryColor: '#F06292',
  },
  {
    id: 'blue-black',
    name: '蓝黑',
    primaryColor: '#1A237E',
    secondaryColor: '#283593',
  },
]

export const defaultHairColor = hairColors[0]
