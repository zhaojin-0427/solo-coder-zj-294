import type { Hairstyle, HairLength, BangsType } from '@/types'

const shortHairstyles: Hairstyle[] = [
  {
    id: 'short-pixie',
    name: '精灵短发',
    length: 'short',
    bangs: 'side',
    suitableFaces: ['oval', 'round', 'diamond'],
    description: '灵动俏皮，凸显精致五官',
    svgPath: 'M120,100 Q80,90 70,130 Q60,180 90,200 Q110,210 130,205 Q150,200 160,180 Q170,140 160,110 Q150,90 120,100 Z',
  },
  {
    id: 'short-bob',
    name: '齐耳波波',
    length: 'short',
    bangs: 'straight',
    suitableFaces: ['oval', 'square', 'long'],
    description: '经典干练，适合职场',
    svgPath: 'M110,105 Q70,100 60,150 Q55,200 80,240 Q100,260 130,255 Q170,250 190,220 Q200,170 185,120 Q170,95 110,105 Z',
  },
  {
    id: 'short-layered',
    name: '层次短发',
    length: 'short',
    bangs: 'none',
    suitableFaces: ['round', 'square', 'diamond'],
    description: '蓬松有层次，增加立体感',
    svgPath: 'M115,100 Q75,95 65,145 Q60,190 85,225 Q110,250 140,245 Q175,235 190,200 Q195,155 180,115 Q165,90 115,100 Z',
  },
  {
    id: 'short-curly',
    name: '卷发短发',
    length: 'short',
    bangs: 'side',
    suitableFaces: ['oval', 'long', 'diamond'],
    description: '俏皮卷发，增加甜美感',
    svgPath: 'M110,95 Q65,90 55,140 Q50,195 75,235 Q95,260 125,255 Q165,245 185,210 Q195,160 185,115 Q165,85 110,95 Z',
  },
]

const mediumHairstyles: Hairstyle[] = [
  {
    id: 'medium-straight',
    name: '锁骨直发',
    length: 'medium',
    bangs: 'middle',
    suitableFaces: ['oval', 'round', 'square'],
    description: '温柔知性，百搭不出错',
    svgPath: 'M105,100 Q60,95 50,180 Q45,280 70,360 Q90,400 130,395 Q180,385 200,320 Q210,220 200,140 Q180,90 105,100 Z',
  },
  {
    id: 'medium-wavy',
    name: '慵懒卷发',
    length: 'medium',
    bangs: 'side',
    suitableFaces: ['oval', 'long', 'round'],
    description: '浪漫慵懒，氛围感满满',
    svgPath: 'M100,100 Q50,95 45,190 Q40,300 75,370 Q100,410 140,400 Q190,385 205,310 Q215,200 200,130 Q175,85 100,100 Z',
  },
  {
    id: 'medium-layered',
    name: '层次中发',
    length: 'medium',
    bangs: 'none',
    suitableFaces: ['square', 'diamond', 'long'],
    description: '灵动层次，修饰脸型',
    svgPath: 'M108,98 Q60,92 52,185 Q48,290 78,365 Q105,405 145,395 Q192,380 208,305 Q218,205 202,128 Q178,88 108,98 Z',
  },
  {
    id: 'medium-ponytail',
    name: '半扎发',
    length: 'medium',
    bangs: 'straight',
    suitableFaces: ['oval', 'round', 'diamond'],
    description: '甜美减龄，日常百搭',
    svgPath: 'M110,100 Q65,95 58,175 Q55,260 80,330 Q105,380 140,370 Q175,355 190,290 Q198,210 185,135 Q165,95 110,100 Z',
  },
]

const longHairstyles: Hairstyle[] = [
  {
    id: 'long-straight',
    name: '黑长直',
    length: 'long',
    bangs: 'none',
    suitableFaces: ['oval', 'round', 'square'],
    description: '经典女神范，气质满分',
    svgPath: 'M105,95 Q55,90 45,200 Q35,350 60,480 Q85,550 135,540 Q190,520 205,420 Q215,280 205,160 Q185,85 105,95 Z',
  },
  {
    id: 'long-wavy',
    name: '大波浪',
    length: 'long',
    bangs: 'side',
    suitableFaces: ['oval', 'long', 'diamond'],
    description: '优雅妩媚，女人味十足',
    svgPath: 'M100,98 Q48,90 40,210 Q30,370 65,500 Q95,580 150,565 Q210,540 225,430 Q240,280 220,155 Q195,85 100,98 Z',
  },
  {
    id: 'long-braided',
    name: '鱼骨辫',
    length: 'long',
    bangs: 'straight',
    suitableFaces: ['oval', 'round', 'long'],
    description: '清新甜美，度假风',
    svgPath: 'M108,98 Q60,92 52,200 Q45,350 70,480 Q95,560 140,550 Q195,530 208,420 Q220,270 205,150 Q180,88 108,98 Z',
  },
  {
    id: 'long-layered',
    name: '层次长发',
    length: 'long',
    bangs: 'middle',
    suitableFaces: ['square', 'diamond', 'round'],
    description: '灵动飘逸，显脸小',
    svgPath: 'M103,97 Q52,90 42,205 Q32,360 62,490 Q90,570 142,555 Q200,530 215,425 Q230,275 212,150 Q188,82 103,97 Z',
  },
]

export const hairstyles: Hairstyle[] = [
  ...shortHairstyles,
  ...mediumHairstyles,
  ...longHairstyles,
]

export const getHairstylesByLength = (length: HairLength): Hairstyle[] => {
  return hairstyles.filter((h) => h.length === length)
}

export const getHairstyleById = (id: string): Hairstyle | undefined => {
  return hairstyles.find((h) => h.id === id)
}

export const getRecommendedHairstyles = (faceShape: string): Hairstyle[] => {
  return hairstyles.filter((h) => h.suitableFaces.includes(faceShape as any))
}

export const bangsOptions: { type: BangsType; name: string }[] = [
  { type: 'none', name: '无刘海' },
  { type: 'straight', name: '齐刘海' },
  { type: 'side', name: '斜刘海' },
  { type: 'middle', name: '中分' },
]
