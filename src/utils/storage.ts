import type { Outfit, Rating, OutfitPlan, WearRecord, PlanFilter, AutoTag, HairCarePlan, CareTask } from '@/types'

const STORAGE_KEY = 'hair-portfolio'
const PLANS_STORAGE_KEY = 'lens-outfit-plans'
const RECORDS_STORAGE_KEY = 'lens-wear-records'
const CARE_PLANS_STORAGE_KEY = 'hair-care-plans'
const CARE_TASKS_STORAGE_KEY = 'hair-care-tasks'

const migrateOutfit = (outfit: any): Outfit => {
  return {
    ...outfit,
    note: outfit.note || '',
    rating: outfit.rating || undefined,
  }
}

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
      const parsed = JSON.parse(data)
      return parsed.map((o: any) => migrateOutfit(o))
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

const migratePlan = (plan: any): OutfitPlan => {
  return {
    ...plan,
    autoTags: plan.autoTags || [],
    note: plan.note || '',
    status: plan.status || 'pending',
  }
}

const migrateRecord = (record: any): WearRecord => {
  return {
    ...record,
    note: record.note || '',
    eyeCondition: record.eyeCondition || 'normal',
  }
}

export const savePlans = (plans: OutfitPlan[]): void => {
  try {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans))
  } catch (e) {
    console.error('Failed to save plans:', e)
  }
}

export const loadPlans = (): OutfitPlan[] => {
  try {
    const data = localStorage.getItem(PLANS_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.map((p: any) => migratePlan(p))
    }
  } catch (e) {
    console.error('Failed to load plans:', e)
  }
  return []
}

export const addPlan = (plan: OutfitPlan): OutfitPlan[] => {
  const plans = loadPlans()
  plans.unshift(plan)
  savePlans(plans)
  return plans
}

export const removePlan = (id: string): OutfitPlan[] => {
  const plans = loadPlans()
  const filtered = plans.filter((p) => p.id !== id)
  savePlans(filtered)
  return filtered
}

export const updatePlan = (plan: OutfitPlan): OutfitPlan[] => {
  const plans = loadPlans()
  const index = plans.findIndex((p) => p.id === plan.id)
  if (index !== -1) {
    plans[index] = { ...plan, updatedAt: Date.now() }
    savePlans(plans)
  }
  return plans
}

export const filterPlans = (plans: OutfitPlan[], filter: PlanFilter): OutfitPlan[] => {
  let result = [...plans]
  
  if (filter.sceneType !== 'all') {
    result = result.filter(p => p.sceneType === filter.sceneType)
  }
  
  if (filter.status !== 'all') {
    result = result.filter(p => p.status === filter.status)
  }
  
  if (filter.hasTags.length > 0) {
    result = result.filter(p => 
      filter.hasTags.some(tag => p.autoTags.includes(tag))
    )
  }
  
  if (filter.dateFrom) {
    result = result.filter(p => p.expectedWearDate >= filter.dateFrom!)
  }
  
  if (filter.dateTo) {
    result = result.filter(p => p.expectedWearDate <= filter.dateTo!)
  }
  
  return result
}

export const saveRecords = (records: WearRecord[]): void => {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
  } catch (e) {
    console.error('Failed to save records:', e)
  }
}

export const loadRecords = (): WearRecord[] => {
  try {
    const data = localStorage.getItem(RECORDS_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.map((r: any) => migrateRecord(r))
    }
  } catch (e) {
    console.error('Failed to load records:', e)
  }
  return []
}

export const addRecord = (record: WearRecord): WearRecord[] => {
  const records = loadRecords()
  records.unshift(record)
  saveRecords(records)
  return records
}

export const getRecordById = (id: string): WearRecord | undefined => {
  return loadRecords().find(r => r.id === id)
}

export const generateAutoTags = (
  plan: OutfitPlan,
  actualDuration?: number,
  comfortLevel?: Rating
): AutoTag[] => {
  const tags: AutoTag[] = []
  
  if (actualDuration !== undefined && comfortLevel !== undefined) {
    if (plan.matchingScore >= 4 && comfortLevel <= 2) {
      tags.push('high-value-low-comfort')
    }
    
    if (comfortLevel >= 4 && plan.matchingScore <= 2) {
      tags.push('comfortable-low-scene-fit')
    }
    
    if (plan.matchingScore >= 4 && comfortLevel >= 4) {
      tags.push('reusable')
    }
    
    if (plan.matchingScore === 5 && comfortLevel >= 4) {
      tags.push('perfect-match')
    }
    
    if (actualDuration > plan.expectedDurationMinutes * 1.5) {
      tags.push('overwear-risk')
    }
    
    if (plan.matchingScore >= 4 && comfortLevel >= 3 && actualDuration <= plan.expectedDurationMinutes * 1.2) {
      tags.push('scene-star')
    }
  }
  
  return tags
}

const migrateCarePlan = (plan: any): HairCarePlan => {
  return {
    ...plan,
    goals: plan.goals || [],
    autoSuggestions: plan.autoSuggestions || [],
    note: plan.note || '',
    active: plan.active !== undefined ? plan.active : true,
  }
}

const migrateCareTask = (task: any): CareTask => {
  return {
    ...task,
    note: task.note || '',
    status: task.status || 'pending',
  }
}

export const saveCarePlans = (plans: HairCarePlan[]): void => {
  try {
    localStorage.setItem(CARE_PLANS_STORAGE_KEY, JSON.stringify(plans))
  } catch (e) {
    console.error('Failed to save care plans:', e)
  }
}

export const loadCarePlans = (): HairCarePlan[] => {
  try {
    const data = localStorage.getItem(CARE_PLANS_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.map((p: any) => migrateCarePlan(p))
    }
  } catch (e) {
    console.error('Failed to load care plans:', e)
  }
  return []
}

export const addCarePlan = (plan: HairCarePlan): HairCarePlan[] => {
  const plans = loadCarePlans()
  plans.unshift(plan)
  saveCarePlans(plans)
  return plans
}

export const removeCarePlan = (id: string): HairCarePlan[] => {
  const plans = loadCarePlans()
  const filtered = plans.filter((p) => p.id !== id)
  saveCarePlans(filtered)
  const allTasks = loadCareTasks()
  const filteredTasks = allTasks.filter((t) => t.planId !== id)
  saveCareTasks(filteredTasks)
  return filtered
}

export const updateCarePlan = (plan: HairCarePlan): HairCarePlan[] => {
  const plans = loadCarePlans()
  const index = plans.findIndex((p) => p.id === plan.id)
  if (index !== -1) {
    plans[index] = { ...plan, updatedAt: Date.now() }
    saveCarePlans(plans)
  }
  return plans
}

export const getCarePlansByOutfitId = (outfitId: string): HairCarePlan[] => {
  return loadCarePlans().filter((p) => p.outfitId === outfitId)
}

export const saveCareTasks = (tasks: CareTask[]): void => {
  try {
    localStorage.setItem(CARE_TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save care tasks:', e)
  }
}

export const loadCareTasks = (): CareTask[] => {
  try {
    const data = localStorage.getItem(CARE_TASKS_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.map((t: any) => migrateCareTask(t))
    }
  } catch (e) {
    console.error('Failed to load care tasks:', e)
  }
  return []
}

export const addCareTask = (task: CareTask): CareTask[] => {
  const tasks = loadCareTasks()
  tasks.unshift(task)
  saveCareTasks(tasks)
  return tasks
}

export const removeCareTask = (id: string): CareTask[] => {
  const tasks = loadCareTasks()
  const filtered = tasks.filter((t) => t.id !== id)
  saveCareTasks(filtered)
  return filtered
}

export const updateCareTask = (task: CareTask): CareTask[] => {
  const tasks = loadCareTasks()
  const index = tasks.findIndex((t) => t.id === task.id)
  if (index !== -1) {
    tasks[index] = task
    saveCareTasks(tasks)
  }
  return tasks
}

export const getCareTasksByPlanId = (planId: string): CareTask[] => {
  return loadCareTasks().filter((t) => t.planId === planId)
}

