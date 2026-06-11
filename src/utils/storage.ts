import type { Outfit } from '@/types'

const STORAGE_KEY = 'hair-portfolio'

export const savePortfolio = (outfits: Outfit[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(outfits))
  } catch (e) {
    console.error('Failed to save portfolio:', e)
  }
}

export const loadPortfolio = (): Outfit[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load portfolio:', e)
  }
  return []
}

export const addOutfit = (outfit: Outfit): Outfit[] => {
  const outfits = loadPortfolio()
  outfits.unshift(outfit)
  savePortfolio(outfits)
  return outfits
}

export const removeOutfit = (id: string): Outfit[] => {
  const outfits = loadPortfolio()
  const filtered = outfits.filter((o) => o.id !== id)
  savePortfolio(filtered)
  return filtered
}

export const updateOutfit = (outfit: Outfit): Outfit[] => {
  const outfits = loadPortfolio()
  const index = outfits.findIndex((o) => o.id === outfit.id)
  if (index !== -1) {
    outfits[index] = outfit
    savePortfolio(outfits)
  }
  return outfits
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
