import { ref, computed } from 'vue'
import type { Hairstyle, HairColor, FaceShapeType, BangsType, Outfit, OccasionTag } from '@/types'
import { hairstyles, getRecommendedHairstyles } from '@/data/hairstyles'
import { hairColors, defaultHairColor } from '@/data/hairColors'
import { faceShapes } from '@/data/faceShapes'
import { loadPortfolio, addOutfit, removeOutfit, generateId } from '@/utils/storage'

const portraitImage = ref<string | null>(null)
const selectedFaceShape = ref<FaceShapeType>('oval')
const selectedHairstyle = ref<Hairstyle | null>(hairstyles[0])
const selectedHairColor = ref<HairColor>(defaultHairColor)
const selectedBangs = ref<BangsType>('straight')
const portfolio = ref<Outfit[]>(loadPortfolio())
const currentFilter = ref<OccasionTag | 'all'>('all')

export function useHairStyle() {
  const recommendedHairstyles = computed(() => {
    return getRecommendedHairstyles(selectedFaceShape.value)
  })

  const setPortrait = (image: string | null) => {
    portraitImage.value = image
  }

  const setFaceShape = (shape: FaceShapeType) => {
    selectedFaceShape.value = shape
  }

  const setHairstyle = (hairstyle: Hairstyle | null) => {
    selectedHairstyle.value = hairstyle
    if (hairstyle) {
      selectedBangs.value = hairstyle.bangs
    }
  }

  const setHairColor = (color: HairColor) => {
    selectedHairColor.value = color
  }

  const setBangs = (bangs: BangsType) => {
    selectedBangs.value = bangs
  }

  const saveToPortfolio = (name: string, tags: OccasionTag[], previewImage?: string) => {
    if (!selectedHairstyle.value) return

    const outfit: Outfit = {
      id: generateId(),
      name,
      hairstyleId: selectedHairstyle.value.id,
      hairColorId: selectedHairColor.value.id,
      faceShapeType: selectedFaceShape.value,
      bangsType: selectedBangs.value,
      occasionTags: tags,
      portraitImage: portraitImage.value || undefined,
      previewImage,
      createdAt: Date.now(),
    }

    portfolio.value = addOutfit(outfit)
    return outfit
  }

  const deleteFromPortfolio = (id: string) => {
    portfolio.value = removeOutfit(id)
  }

  const filteredPortfolio = computed(() => {
    if (currentFilter.value === 'all') {
      return portfolio.value
    }
    const tag = currentFilter.value as OccasionTag
    return portfolio.value.filter((o) => o.occasionTags.includes(tag))
  })

  const setFilter = (filter: OccasionTag | 'all') => {
    currentFilter.value = filter
  }

  const loadOutfit = (outfit: Outfit) => {
    const hairstyle = hairstyles.find((h) => h.id === outfit.hairstyleId)
    const color = hairColors.find((c) => c.id === outfit.hairColorId)
    
    if (hairstyle) selectedHairstyle.value = hairstyle
    if (color) selectedHairColor.value = color
    selectedFaceShape.value = outfit.faceShapeType
    selectedBangs.value = outfit.bangsType
    if (outfit.portraitImage) portraitImage.value = outfit.portraitImage
  }

  return {
    portraitImage,
    selectedFaceShape,
    selectedHairstyle,
    selectedHairColor,
    selectedBangs,
    portfolio,
    filteredPortfolio,
    currentFilter,
    recommendedHairstyles,
    faceShapes,
    hairColors,
    hairstyles,
    setPortrait,
    setFaceShape,
    setHairstyle,
    setHairColor,
    setBangs,
    saveToPortfolio,
    deleteFromPortfolio,
    setFilter,
    loadOutfit,
  }
}
