import type { Lens, SceneType, LightEnvironment } from '@/types'
import { generateId } from '@/utils/storage'

export const sceneOptions: { key: SceneType; name: string; icon: string }[] = [
  { key: 'work', name: '职场通勤', icon: '💼' },
  { key: 'date', name: '约会', icon: '💕' },
  { key: 'party', name: '派对聚会', icon: '🎉' },
  { key: 'travel', name: '旅行出游', icon: '✈️' },
  { key: 'daily', name: '日常休闲', icon: '☀️' },
  { key: 'photo', name: '拍照上镜', icon: '📸' },
  { key: 'sports', name: '运动健身', icon: '🏃' },
]

export const lightOptions: { key: LightEnvironment; name: string; icon: string }[] = [
  { key: 'natural', name: '自然光', icon: '🌤️' },
  { key: 'indoor-warm', name: '室内暖光', icon: '🏠' },
  { key: 'indoor-cool', name: '室内冷光', icon: '💡' },
  { key: 'outdoor-sunny', name: '户外晴天', icon: '☀️' },
  { key: 'outdoor-cloudy', name: '户外阴天', icon: '☁️' },
  { key: 'night', name: '夜晚灯光', icon: '🌙' },
]

export const makeupStyles: string[] = [
  '裸妆', '通勤妆', '约会妆', '烟熏妆', '日系妆',
  '韩系妆', '欧美妆', '复古妆', '清新妆', '浓妆',
  '伪素颜', '绿茶妆', '纯欲妆', '清冷妆', '甜酷妆',
]

export const clothingColors: string[] = [
  '黑白灰', '大地色系', '莫兰迪色系', '马卡龙色系',
  '冷色系', '暖色系', '鲜艳色系', '中性色系',
  '粉色系', '蓝色系', '绿色系', '紫色系',
]

export const autoTagInfo: Record<string, { name: string; color: string; description: string }> = {
  'high-value-low-comfort': { name: '高颜值但低舒适', color: '#FF6B6B', description: '搭配评分高但舒适度低' },
  'comfortable-low-scene-fit': { name: '舒适但不适配场景', color: '#4ECDC4', description: '佩戴舒适但与场景匹配度低' },
  'reusable': { name: '适合重复使用', color: '#45B7D1', description: '综合表现好，值得重复使用' },
  'perfect-match': { name: '完美适配', color: '#96CEB4', description: '各方面都很完美' },
  'overwear-risk': { name: '超时佩戴风险', color: '#FFEAA7', description: '实际佩戴时长远超预期' },
  'scene-star': { name: '场景焦点', color: '#DDA0DD', description: '在该场景下表现突出' },
}

export const defaultLenses: Lens[] = [
  {
    id: generateId(),
    name: '自然棕',
    brand: '日本实瞳',
    color: '棕色',
    colorCode: '#8B6914',
    diameter: 14.0,
    baseCurve: 8.6,
    waterContent: 38,
    period: 'daily',
    style: 'natural',
    description: '自然放大双眼，适合日常佩戴',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: generateId(),
    name: '蜂蜜棕',
    brand: 'OLENS',
    color: '浅棕色',
    colorCode: '#D4A017',
    diameter: 14.2,
    baseCurve: 8.6,
    waterContent: 40,
    period: 'monthly',
    style: 'cute',
    description: '温柔甜美，约会必备',
    createdAt: Date.now() - 86400000 * 25,
  },
  {
    id: generateId(),
    name: '星空灰',
    brand: 'GIVRE',
    color: '灰色',
    colorCode: '#808080',
    diameter: 14.2,
    baseCurve: 8.7,
    waterContent: 42,
    period: 'daily',
    style: 'cool',
    description: '高冷气质，适合派对和拍照',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: generateId(),
    name: '抹茶绿',
    brand: 'LILMOON',
    color: '绿色',
    colorCode: '#7CB342',
    diameter: 14.4,
    baseCurve: 8.6,
    waterContent: 38,
    period: 'monthly',
    style: 'elegant',
    description: '清新自然，带点混血感',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: generateId(),
    name: '玫瑰粉',
    brand: 'NEO',
    color: '粉色',
    colorCode: '#E91E63',
    diameter: 14.5,
    baseCurve: 8.6,
    waterContent: 45,
    period: 'daily',
    style: 'sexy',
    description: '性感妩媚，适合约会和派对',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: generateId(),
    name: '海洋蓝',
    brand: 'DOONA',
    color: '蓝色',
    colorCode: '#1E88E5',
    diameter: 14.2,
    baseCurve: 8.6,
    waterContent: 40,
    period: 'quarterly',
    style: 'hip-hop',
    description: '欧美混血感，适合拍照和旅行',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: generateId(),
    name: '焦糖棕',
    brand: 'SEED',
    color: '深棕色',
    colorCode: '#5D4037',
    diameter: 13.8,
    baseCurve: 8.7,
    waterContent: 55,
    period: 'daily',
    style: 'natural',
    description: '小直径自然款，适合长时间佩戴',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: generateId(),
    name: '烟熏黑',
    brand: 'FEMII',
    color: '黑色',
    colorCode: '#212121',
    diameter: 14.0,
    baseCurve: 8.6,
    waterContent: 42,
    period: 'weekly',
    style: 'elegant',
    description: '优雅有神，职场通勤首选',
    createdAt: Date.now() - 86400000,
  },
]

export const getLensById = (id: string): Lens | undefined => {
  return defaultLenses.find(l => l.id === id)
}

export const getRecommendedLenses = (sceneType: SceneType, style?: string): Lens[] => {
  let filtered = [...defaultLenses]
  
  if (style) {
    filtered = filtered.filter(l => l.style === style)
  }
  
  const scenePriority: Record<SceneType, string[]> = {
    work: ['natural', 'elegant'],
    date: ['cute', 'sexy', 'elegant'],
    party: ['cool', 'sexy', 'hip-hop'],
    travel: ['natural', 'cool', 'elegant'],
    daily: ['natural', 'cute'],
    photo: ['cool', 'hip-hop', 'sexy'],
    sports: ['natural'],
  }
  
  const priority = scenePriority[sceneType] || []
  filtered.sort((a, b) => {
    const aScore = priority.indexOf(a.style)
    const bScore = priority.indexOf(b.style)
    if (aScore === -1 && bScore === -1) return 0
    if (aScore === -1) return 1
    if (bScore === -1) return -1
    return aScore - bScore
  })
  
  return filtered
}

export const periodLabels: Record<Lens['period'], string> = {
  daily: '日抛',
  weekly: '周抛',
  monthly: '月抛',
  quarterly: '季抛',
  yearly: '年抛',
}

export const styleLabels: Record<Lens['style'], string> = {
  natural: '自然',
  cute: '可爱',
  sexy: '性感',
  cool: '冷酷',
  elegant: '优雅',
  'hip-hop': '潮酷',
}
