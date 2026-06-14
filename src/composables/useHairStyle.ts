import { ref, computed } from 'vue'
import type { Hairstyle, HairColor, FaceShapeType, BangsType, Outfit, OccasionTag, Rating, SortType } from '@/types'
import { hairstyles, getRecommendedHairstyles } from '@/data/hairstyles'
import { hairColors, defaultHairColor } from '@/data/hairColors'
import { faceShapes } from '@/data/faceShapes'
import { loadPortfolio, addOutfit, removeOutfit, generateId, getCarePlansByOutfitId } from '@/utils/storage'
import { useHairCare } from '@/composables/useHairCare'

const portraitImage = ref<string | null>(null)
const selectedFaceShape = ref<FaceShapeType>('oval')
const selectedHairstyle = ref<Hairstyle | null>(hairstyles[0])
const selectedHairColor = ref<HairColor>(defaultHairColor)
const selectedBangs = ref<BangsType>('straight')
const portfolio = ref<Outfit[]>(loadPortfolio())
const currentFilter = ref<OccasionTag | 'all'>('all')
const currentRatingFilter = ref<Rating | 'all'>('all')
const currentSort = ref<SortType>('time-desc')
const selectedForCompare = ref<string[]>([])
const showCompareView = ref(false)
const currentAppliedOutfit = ref<Outfit | null>(null)

export function useHairStyle() {
  const recommendedHairstyles = computed(() => {
    return getRecommendedHairstyles(selectedFaceShape.value)
  })

  const setPortrait = (image: string | null) => {
    portraitImage.value = image
    currentAppliedOutfit.value = null
  }

  const setFaceShape = (shape: FaceShapeType) => {
    selectedFaceShape.value = shape
    currentAppliedOutfit.value = null
  }

  const setHairstyle = (hairstyle: Hairstyle | null) => {
    selectedHairstyle.value = hairstyle
    if (hairstyle) {
      selectedBangs.value = hairstyle.bangs
    }
    currentAppliedOutfit.value = null
  }

  const setHairColor = (color: HairColor) => {
    selectedHairColor.value = color
    currentAppliedOutfit.value = null
  }

  const setBangs = (bangs: BangsType) => {
    selectedBangs.value = bangs
    currentAppliedOutfit.value = null
  }

  const saveToPortfolio = (name: string, tags: OccasionTag[], previewImage?: string, note?: string, rating?: Rating) => {
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
      note: note || '',
      rating,
      createdAt: Date.now(),
    }

    portfolio.value = addOutfit(outfit)
    currentAppliedOutfit.value = outfit
    return outfit
  }

  const deleteFromPortfolio = (id: string) => {
    const { deleteCarePlan } = useHairCare()
    const plans = getCarePlansByOutfitId(id)
    plans.forEach((plan) => deleteCarePlan(plan.id))
    portfolio.value = removeOutfit(id)
    toggleCompareSelect(id, false)
  }

  const filteredPortfolio = computed(() => {
    let result = [...portfolio.value]
    if (currentFilter.value !== 'all') {
      const tag = currentFilter.value as OccasionTag
      result = result.filter((o) => o.occasionTags.includes(tag))
    }
    if (currentRatingFilter.value !== 'all') {
      const rating = currentRatingFilter.value as Rating
      result = result.filter((o) => o.rating === rating)
    }
    switch (currentSort.value) {
      case 'time-desc':
        result.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'time-asc':
        result.sort((a, b) => a.createdAt - b.createdAt)
        break
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'rating-asc':
        result.sort((a, b) => (a.rating || 0) - (b.rating || 0))
        break
    }
    return result
  })

  const setFilter = (filter: OccasionTag | 'all') => {
    currentFilter.value = filter
  }

  const setRatingFilter = (filter: Rating | 'all') => {
    currentRatingFilter.value = filter
  }

  const setSort = (sort: SortType) => {
    currentSort.value = sort
  }

  const loadOutfit = (outfit: Outfit) => {
    const hairstyle = hairstyles.find((h) => h.id === outfit.hairstyleId)
    const color = hairColors.find((c) => c.id === outfit.hairColorId)
    
    if (hairstyle) selectedHairstyle.value = hairstyle
    if (color) selectedHairColor.value = color
    selectedFaceShape.value = outfit.faceShapeType
    selectedBangs.value = outfit.bangsType
    portraitImage.value = outfit.portraitImage || null
    currentAppliedOutfit.value = outfit
  }

  const toggleCompareSelect = (id: string, force?: boolean) => {
    const index = selectedForCompare.value.indexOf(id)
    const shouldAdd = force !== undefined ? force : index === -1
    if (shouldAdd) {
      if (selectedForCompare.value.length < 3 && index === -1) {
        selectedForCompare.value.push(id)
      }
    } else {
      if (index > -1) {
        selectedForCompare.value.splice(index, 1)
      }
    }
  }

  const clearCompareSelection = () => {
    selectedForCompare.value = []
  }

  const selectedForCompareOutfits = computed(() => {
    return selectedForCompare.value
      .map((id) => portfolio.value.find((o) => o.id === id))
      .filter((o): o is Outfit => !!o)
  })

  const setShowCompareView = (show: boolean) => {
    showCompareView.value = show
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
    currentRatingFilter,
    currentSort,
    selectedForCompare,
    selectedForCompareOutfits,
    showCompareView,
    currentAppliedOutfit,
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
    setRatingFilter,
    setSort,
    loadOutfit,
    toggleCompareSelect,
    clearCompareSelection,
    setShowCompareView,
  }
}
