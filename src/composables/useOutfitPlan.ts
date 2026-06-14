import { ref, computed } from 'vue'
import type { OutfitPlan, WearRecord, PlanFilter, Rating, SceneType, AutoTag } from '@/types'
import { loadPlans, addPlan, removePlan, updatePlan, filterPlans, loadRecords, addRecord, generateAutoTags, generateId, getRecordById } from '@/utils/storage'
import { defaultLenses } from '@/data/lenses'

const outfitPlans = ref<OutfitPlan[]>(loadPlans())
const wearRecords = ref<WearRecord[]>(loadRecords())
const currentPlanFilter = ref<PlanFilter>({
  sceneType: 'all',
  status: 'all',
  hasTags: [],
})
const selectedDate = ref<number | null>(null)

export function useOutfitPlan() {
  const filteredPlans = computed(() => {
    let result = filterPlans(outfitPlans.value, currentPlanFilter.value)
    
    if (selectedDate.value !== null) {
      const dayStart = new Date(selectedDate.value)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDate.value)
      dayEnd.setHours(23, 59, 59, 999)
      result = result.filter(p => 
        p.expectedWearDate >= dayStart.getTime() && p.expectedWearDate <= dayEnd.getTime()
      )
    }
    
    return result.sort((a, b) => a.expectedWearDate - b.expectedWearDate)
  })

  const pendingPlans = computed(() => 
    outfitPlans.value.filter(p => p.status === 'pending')
      .sort((a, b) => a.expectedWearDate - b.expectedWearDate)
  )

  const executedPlans = computed(() => 
    outfitPlans.value.filter(p => p.status === 'executed')
      .sort((a, b) => (b.executedAt || 0) - (a.executedAt || 0))
  )

  const upcomingPlans = computed(() => {
    const now = Date.now()
    const weekLater = now + 7 * 24 * 60 * 60 * 1000
    return outfitPlans.value
      .filter(p => p.status === 'pending' && p.expectedWearDate >= now && p.expectedWearDate <= weekLater)
      .sort((a, b) => a.expectedWearDate - b.expectedWearDate)
  })

  const overduePlans = computed(() => {
    const now = Date.now()
    return outfitPlans.value
      .filter(p => p.status === 'pending' && p.expectedWearDate < now)
      .sort((a, b) => a.expectedWearDate - b.expectedWearDate)
  })

  const mostUsedMakeupStyles = computed(() => {
    const countMap = new Map<string, number>()
    executedPlans.value.forEach(plan => {
      countMap.set(plan.makeupStyle, (countMap.get(plan.makeupStyle) || 0) + 1)
    })
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  })

  const lensUsageByScene = computed(() => {
    const result: Record<string, { lensId: string; lensName: string; count: number }> = {}
    executedPlans.value.forEach(plan => {
      const key = `${plan.sceneType}-${plan.recommendedLensId}`
      if (!result[key]) {
        result[key] = {
          lensId: plan.recommendedLensId,
          lensName: plan.recommendedLensName,
          count: 0,
        }
      }
      result[key].count++
    })
    return result
  })

  const topRatedPlans = computed(() => 
    [...executedPlans.value]
      .sort((a, b) => b.matchingScore - a.matchingScore)
      .slice(0, 10)
  )

  const createPlan = (data: {
    lensId: string
    sceneName: string
    sceneType: SceneType
    makeupStyle: string
    clothingColor: string
    lightEnvironment: string
    recommendedLensId: string
    alternativeLensId?: string
    expectedWearDate: number
    expectedDurationMinutes: number
    matchingScore: Rating
    note?: string
  }): OutfitPlan => {
    const recommendedLens = defaultLenses.find(l => l.id === data.recommendedLensId)
    const alternativeLens = data.alternativeLensId 
      ? defaultLenses.find(l => l.id === data.alternativeLensId)
      : undefined

    const plan: OutfitPlan = {
      id: generateId(),
      lensId: data.lensId,
      sceneName: data.sceneName,
      sceneType: data.sceneType,
      makeupStyle: data.makeupStyle,
      clothingColor: data.clothingColor,
      lightEnvironment: data.lightEnvironment as any,
      recommendedLensId: data.recommendedLensId,
      recommendedLensName: recommendedLens?.name || '未知镜片',
      alternativeLensId: data.alternativeLensId,
      alternativeLensName: alternativeLens?.name,
      expectedWearDate: data.expectedWearDate,
      expectedDurationMinutes: data.expectedDurationMinutes,
      matchingScore: data.matchingScore,
      note: data.note,
      status: 'pending',
      autoTags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    outfitPlans.value = addPlan(plan)
    return plan
  }

  const deletePlan = (id: string) => {
    outfitPlans.value = removePlan(id)
  }

  const editPlan = (id: string, updates: Partial<OutfitPlan>) => {
    const plan = outfitPlans.value.find(p => p.id === id)
    if (plan) {
      const updated = { ...plan, ...updates, updatedAt: Date.now() }
      outfitPlans.value = updatePlan(updated)
    }
  }

  const executePlan = (
    planId: string,
    wearData: {
      wearDate: number
      wearStartTime: number
      wearEndTime?: number
      durationMinutes?: number
      comfortLevel: Rating
      eyeCondition: string
      note?: string
    }
  ): { plan: OutfitPlan; record: WearRecord } => {
    const plan = outfitPlans.value.find(p => p.id === planId)
    if (!plan) throw new Error('Plan not found')

    const record: WearRecord = {
      id: generateId(),
      lensId: plan.recommendedLensId,
      lensName: plan.recommendedLensName,
      ...wearData,
      createdAt: Date.now(),
    }

    wearRecords.value = addRecord(record)

    const autoTags = generateAutoTags(plan, wearData.durationMinutes, wearData.comfortLevel)

    const updatedPlan: OutfitPlan = {
      ...plan,
      status: 'executed',
      executedAt: Date.now(),
      wearRecordId: record.id,
      autoTags,
      updatedAt: Date.now(),
    }

    outfitPlans.value = updatePlan(updatedPlan)

    return { plan: updatedPlan, record }
  }

  const cancelPlan = (id: string) => {
    const plan = outfitPlans.value.find(p => p.id === id)
    if (plan) {
      const updated: OutfitPlan = { ...plan, status: 'cancelled', updatedAt: Date.now() }
      outfitPlans.value = updatePlan(updated)
    }
  }

  const getWearRecordForPlan = (planId: string): WearRecord | undefined => {
    const plan = outfitPlans.value.find(p => p.id === planId)
    if (plan?.wearRecordId) {
      return getRecordById(plan.wearRecordId)
    }
    return undefined
  }

  const setFilter = (filter: Partial<PlanFilter>) => {
    currentPlanFilter.value = { ...currentPlanFilter.value, ...filter }
  }

  const setSelectedDate = (date: number | null) => {
    selectedDate.value = date
  }

  const toggleTagFilter = (tag: AutoTag) => {
    const currentTags = [...currentPlanFilter.value.hasTags]
    const index = currentTags.indexOf(tag)
    if (index === -1) {
      currentTags.push(tag)
    } else {
      currentTags.splice(index, 1)
    }
    currentPlanFilter.value = { ...currentPlanFilter.value, hasTags: currentTags }
  }

  return {
    outfitPlans,
    filteredPlans,
    pendingPlans,
    executedPlans,
    upcomingPlans,
    overduePlans,
    mostUsedMakeupStyles,
    lensUsageByScene,
    topRatedPlans,
    wearRecords,
    currentPlanFilter,
    selectedDate,
    createPlan,
    deletePlan,
    editPlan,
    executePlan,
    cancelPlan,
    getWearRecordForPlan,
    setFilter,
    setSelectedDate,
    toggleTagFilter,
  }
}
