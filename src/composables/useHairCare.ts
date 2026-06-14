import { ref, computed } from 'vue'
import type {
  HairCarePlan,
  CareTask,
  CareGoal,
  CareSuggestion,
  CareTaskType,
  CareTaskStatus,
  Outfit,
  Hairstyle,
  HairColor,
  BangsType,
  HairLength,
} from '@/types'
import {
  loadCarePlans,
  addCarePlan,
  removeCarePlan,
  updateCarePlan,
  getCarePlansByOutfitId,
  loadCareTasks,
  addCareTask,
  removeCareTask,
  updateCareTask,
  getCareTasksByPlanId,
  generateId,
} from '@/utils/storage'
import { hairstyles, bangsOptions } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'

const carePlans = ref<HairCarePlan[]>(loadCarePlans())
const careTasks = ref<CareTask[]>(loadCareTasks())
const highlightedPlanId = ref<string | null>(null)

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

const DYED_COLOR_IDS = ['rose-red', 'blue-black']
const COLOR_FIX_GOAL_COLORS = ['rose-red', 'blue-black', 'linen']

export const careGoalOptions: { key: CareGoal; name: string; icon: string; desc: string }[] = [
  { key: 'oil-control', name: '控油蓬松', icon: '💨', desc: '头皮控油、维持发根蓬松' },
  { key: 'color-fix', name: '染后固色', icon: '🎨', desc: '延缓掉色、护色锁色' },
  { key: 'repair-frizz', name: '修复毛躁', icon: '✨', desc: '抚平毛鳞片、滋润修护' },
  { key: 'bangs-care', name: '刘海打理', icon: '✂️', desc: '修剪维护、造型定型' },
]

export const careTaskTypeMeta: Record<
  CareTaskType,
  { name: string; icon: string; color: string }
> = {
  wash: { name: '洗护', icon: '🧴', color: '#81D4FA' },
  'deep-condition': { name: '深层护理', icon: '🫧', color: '#64B5F6' },
  'color-retouch': { name: '染发补色', icon: '🎨', color: '#BA68C8' },
  'trim-bangs': { name: '修剪刘海', icon: '✂️', color: '#FFB74D' },
  'trim-ends': { name: '修剪发尾', icon: '🪚', color: '#A1887F' },
  'scalp-care': { name: '头皮护理', icon: '💆', color: '#81C784' },
  'hair-mask': { name: '发膜护理', icon: '🧖', color: '#F06292' },
}

const addDays = (base: number, days: number): number => {
  const d = new Date(base)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

export function generateCareSuggestions(
  hairColorId: string,
  hairLength: HairLength,
  bangsType: BangsType,
  hairstyleName?: string
): CareSuggestion[] {
  const suggestions: CareSuggestion[] = []
  const color = hairColors.find((c) => c.id === hairColorId)

  if (COLOR_FIX_GOAL_COLORS.includes(hairColorId)) {
    const isVivid = DYED_COLOR_IDS.includes(hairColorId)
    suggestions.push({
      type: 'warning',
      title: `${color?.name || '染发'}色系固色提醒`,
      description: isVivid
        ? `${color?.name}属于高饱和度色彩，掉色较快，建议每4-6周补色，使用无硫酸盐护色洗发水，避免高温吹发。`
        : `${color?.name}色系需注意保持光泽，建议使用护色洗护产品，每6-8周补色维护。`,
      relatedGoal: 'color-fix',
    })
  }

  if (hairLength === 'long') {
    suggestions.push({
      type: 'info',
      title: '长发发尾修剪建议',
      description: `长发（如${hairstyleName || '当前发型'}）发尾易干燥分叉，建议每8-12周修剪一次发尾，保持健康形态。`,
    })
  } else if (hairLength === 'medium') {
    suggestions.push({
      type: 'tip',
      title: '中发造型维护',
      description: `中发（如${hairstyleName || '当前发型'}）需每6-10周修剪轮廓，维持蓬松层次。`,
    })
  } else {
    suggestions.push({
      type: 'tip',
      title: '短发轮廓维护',
      description: `短发（如${hairstyleName || '当前发型'}）需每4-6周修剪一次，保持清爽利落的轮廓。`,
    })
  }

  if (bangsType === 'straight') {
    suggestions.push({
      type: 'warning',
      title: '齐刘海修剪提醒',
      description: '齐刘海生长速度较快，建议每2-3周修剪一次长度，避免遮眼；出油时需单独清洗刘海。',
      relatedGoal: 'bangs-care',
    })
  } else if (bangsType === 'middle') {
    suggestions.push({
      type: 'info',
      title: '中分刘海维护',
      description: '中分刘海注意分界线不要固定过久，避免发缝变宽；可用蓬松喷雾营造空气感。',
      relatedGoal: 'bangs-care',
    })
  } else if (bangsType === 'side') {
    suggestions.push({
      type: 'tip',
      title: '斜刘海打理提示',
      description: '斜刘海每3-4周需调整分缝修剪，造型时可配合定型产品保持弧度。',
      relatedGoal: 'bangs-care',
    })
  }

  return suggestions
}

export function useHairCare() {
  const refreshStatuses = () => {
    const now = Date.now()
    let changed = false
    careTasks.value = careTasks.value.map((t) => {
      const effectiveDue = t.delayedTo || t.dueDate
      if (t.status === 'pending' && effectiveDue < now) {
        changed = true
        return { ...t, status: 'overdue' as CareTaskStatus }
      }
      if (t.status === 'delayed' && effectiveDue < now) {
        changed = true
        return { ...t, status: 'overdue' as CareTaskStatus }
      }
      return t
    })
    if (changed) {
      careTasks.value.forEach((t) => updateCareTask(t))
    }
  }
  refreshStatuses()

  const activeCarePlans = computed(() => carePlans.value.filter((p) => p.active))

  const plansByOutfit = (outfitId: string) =>
    carePlans.value.filter((p) => p.outfitId === outfitId)

  const tasksByPlan = (planId: string) =>
    careTasks.value.filter((t) => t.planId === planId).sort((a, b) => a.dueDate - b.dueDate)

  const tasksByOutfit = (outfitId: string) => {
    const planIds = new Set(plansByOutfit(outfitId).map((p) => p.id))
    return careTasks.value.filter((t) => planIds.has(t.planId))
  }

  const pendingTasks = computed(() =>
    careTasks.value
      .filter((t) => t.status === 'pending' || t.status === 'delayed' || t.status === 'overdue')
      .sort((a, b) => (a.delayedTo || a.dueDate) - (b.delayedTo || b.dueDate))
  )

  const upcoming7DaysTasks = computed(() => {
    const now = Date.now()
    const weekLater = now + 7 * DAY_MS
    return careTasks.value
      .filter((t) => {
        if (t.status === 'completed') return false
        const due = t.delayedTo || t.dueDate
        return due >= now && due <= weekLater
      })
      .sort((a, b) => (a.delayedTo || a.dueDate) - (b.delayedTo || b.dueDate))
  })

  const overdueTasks = computed(() => {
    const now = Date.now()
    return careTasks.value
      .filter((t) => {
        if (t.status === 'completed') return false
        const due = t.delayedTo || t.dueDate
        return due < now
      })
      .sort((a, b) => (a.delayedTo || a.dueDate) - (b.delayedTo || b.dueDate))
  })

  const completedTasks = computed(() =>
    careTasks.value
      .filter((t) => t.status === 'completed')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
  )

  const createTask = (
    planId: string,
    type: CareTaskType,
    title: string,
    dueDate: number,
    note?: string
  ): CareTask => {
    const task: CareTask = {
      id: generateId(),
      planId,
      type,
      title,
      dueDate,
      status: 'pending',
      note,
      createdAt: Date.now(),
    }
    careTasks.value = addCareTask(task)
    return task
  }

  const generateTasksForPlan = (plan: HairCarePlan, planHairColorName?: string) => {
    const now = Date.now()

    if (plan.washFrequencyDays > 0) {
      let washCount = 0
      const maxWashes = 12
      for (let d = plan.washFrequencyDays; washCount < maxWashes; d += plan.washFrequencyDays) {
        createTask(
          plan.id,
          'wash',
          `日常洗护${washCount % 2 === 0 ? '（含护发素）' : ''}`,
          addDays(now, d),
          `按${plan.washFrequencyDays}天频率洗护`
        )
        washCount++
      }
    }

    if (plan.goals.includes('oil-control')) {
      for (let i = 1; i <= 6; i++) {
        createTask(
          plan.id,
          'scalp-care',
          '头皮清洁护理',
          addDays(now, i * 14),
          '配合控油蓬松目标，深度清洁头皮'
        )
      }
    }

    if (plan.goals.includes('repair-frizz')) {
      for (let i = 1; i <= 8; i++) {
        createTask(
          plan.id,
          'hair-mask',
          '修复毛躁发膜护理',
          addDays(now, i * 7),
          '配合修复毛躁目标，每周1次深层滋养'
        )
      }
      for (let i = 1; i <= 4; i++) {
        createTask(
          plan.id,
          'deep-condition',
          '沙龙级深层修护',
          addDays(now, i * 21),
          '配合修复毛躁目标，每3周1次'
        )
      }
    }

    if (plan.goals.includes('color-fix') && plan.colorRetouchWeeks) {
      for (let i = 1; i <= 4; i++) {
        createTask(
          plan.id,
          'color-retouch',
          `第${i}次补色（${planHairColorName || '固色护理'}）`,
          addDays(now, i * plan.colorRetouchWeeks * 7),
          `补色周期${plan.colorRetouchWeeks}周，使用护色产品`
        )
      }
    }

    if (plan.trimBangsDate) {
      createTask(
        plan.id,
        'trim-bangs',
        '修剪刘海维护',
        plan.trimBangsDate,
        '根据生长速度调整下次修剪时间'
      )
      for (let i = 1; i <= 5; i++) {
        createTask(
          plan.id,
          'trim-bangs',
          `第${i + 1}次修剪刘海`,
          addDays(plan.trimBangsDate, i * 21),
          '约每3周修剪一次刘海'
        )
      }
    }

    if (plan.trimEndsDate) {
      createTask(plan.id, 'trim-ends', '修剪发尾（避免分叉）', plan.trimEndsDate, '定期修剪保持发尾健康')
      for (let i = 1; i <= 3; i++) {
        createTask(
          plan.id,
          'trim-ends',
          `第${i + 1}次修剪发尾`,
          addDays(plan.trimEndsDate, i * 70),
          '约每10周修剪一次发尾'
        )
      }
    }

    if (plan.goals.includes('bangs-care') && !plan.trimBangsDate) {
      for (let i = 1; i <= 6; i++) {
        createTask(
          plan.id,
          'trim-bangs',
          `刘海修剪 #${i}`,
          addDays(now, i * 21),
          '刘海打理目标，建议每3周修剪'
        )
      }
    }
  }

  const createCarePlan = (data: {
    outfit: Outfit
    goals: CareGoal[]
    washFrequencyDays: number
    colorRetouchWeeks?: number
    lastColorDate?: number
    trimBangsDate?: number
    trimEndsDate?: number
    note?: string
  }): HairCarePlan => {
    const hs = hairstyles.find((h) => h.id === data.outfit.hairstyleId)
    const clr = hairColors.find((c) => c.id === data.outfit.hairColorId)
    const suggestions = generateCareSuggestions(
      data.outfit.hairColorId,
      hs?.length || 'medium',
      data.outfit.bangsType,
      hs?.name
    )

    const plan: HairCarePlan = {
      id: generateId(),
      outfitId: data.outfit.id,
      outfitName: data.outfit.name,
      goals: data.goals,
      washFrequencyDays: data.washFrequencyDays,
      colorRetouchWeeks: data.colorRetouchWeeks,
      lastColorDate: data.lastColorDate,
      trimBangsDate: data.trimBangsDate,
      trimEndsDate: data.trimEndsDate,
      autoSuggestions: suggestions.map((s) => `${s.title}｜${s.description}`),
      note: data.note || '',
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    carePlans.value = addCarePlan(plan)
    generateTasksForPlan(plan, clr?.name)
    highlightedPlanId.value = plan.id
    setTimeout(() => {
      highlightedPlanId.value = null
    }, 5000)
    return plan
  }

  const deleteCarePlan = (id: string) => {
    carePlans.value = removeCarePlan(id)
    careTasks.value = careTasks.value.filter((t) => t.planId !== id)
  }

  const editCarePlan = (id: string, updates: Partial<HairCarePlan>) => {
    const plan = carePlans.value.find((p) => p.id === id)
    if (plan) {
      const updated = { ...plan, ...updates, updatedAt: Date.now() }
      carePlans.value = updateCarePlan(updated)
    }
  }

  const editCarePlanAndRegenTasks = (
    planId: string,
    updates: Partial<Pick<HairCarePlan, 'goals' | 'washFrequencyDays' | 'colorRetouchWeeks' | 'trimBangsDate' | 'trimEndsDate' | 'note'>>,
    outfit: Outfit
  ) => {
    const plan = carePlans.value.find((p) => p.id === planId)
    if (!plan) return

    const hs = hairstyles.find((h) => h.id === outfit.hairstyleId)
    const clr = hairColors.find((c) => c.id === outfit.hairColorId)
    const suggestions = generateCareSuggestions(
      outfit.hairColorId,
      hs?.length || 'medium',
      outfit.bangsType,
      hs?.name
    )

    const updatedPlan: HairCarePlan = {
      ...plan,
      ...updates,
      autoSuggestions: suggestions.map((s) => `${s.title}｜${s.description}`),
      updatedAt: Date.now(),
    }
    carePlans.value = updateCarePlan(updatedPlan)

    const completedTaskIds = new Set(
      careTasks.value
        .filter((t) => t.planId === planId && t.status === 'completed')
        .map((t) => t.id)
    )
    careTasks.value = careTasks.value.filter(
      (t) => t.planId !== planId || completedTaskIds.has(t.id)
    )

    generateTasksForPlan(updatedPlan, clr?.name)
  }

  const togglePlanActive = (id: string) => {
    const plan = carePlans.value.find((p) => p.id === id)
    if (plan) {
      const updated = { ...plan, active: !plan.active, updatedAt: Date.now() }
      carePlans.value = updateCarePlan(updated)
    }
  }

  const markTaskComplete = (taskId: string) => {
    const task = careTasks.value.find((t) => t.id === taskId)
    if (task) {
      const updated = { ...task, status: 'completed' as CareTaskStatus, completedAt: Date.now() }
      careTasks.value = updateCareTask(updated)
    }
  }

  const delayTask = (taskId: string, days: number = 1) => {
    const task = careTasks.value.find((t) => t.id === taskId)
    if (task) {
      const current = task.delayedTo || task.dueDate
      const updated = {
        ...task,
        delayedTo: addDays(current, days),
        status: 'delayed' as CareTaskStatus,
      }
      careTasks.value = updateCareTask(updated)
    }
  }

  const deleteTask = (taskId: string) => {
    careTasks.value = removeCareTask(taskId)
  }

  const hasActivePlanForOutfit = (outfitId: string) => {
    return carePlans.value.some((p) => p.outfitId === outfitId && p.active)
  }

  const getPlanSummary = (planId: string): string[] => {
    const plan = carePlans.value.find((p) => p.id === planId)
    if (!plan) return []
    const lines: string[] = []
    if (plan.goals.length > 0) {
      const names = plan.goals
        .map((g) => careGoalOptions.find((o) => o.key === g)?.name || g)
        .join('、')
      lines.push(`护理目标：${names}`)
    }
    if (plan.washFrequencyDays > 0) {
      lines.push(`洗护频率：每${plan.washFrequencyDays}天一次`)
    }
    if (plan.colorRetouchWeeks) {
      lines.push(`补色周期：每${plan.colorRetouchWeeks}周`)
    }
    if (plan.trimBangsDate) {
      const d = new Date(plan.trimBangsDate)
      lines.push(`下次刘海修剪：${d.getMonth() + 1}/${d.getDate()}`)
    }
    if (plan.trimEndsDate) {
      const d = new Date(plan.trimEndsDate)
      lines.push(`下次发尾修剪：${d.getMonth() + 1}/${d.getDate()}`)
    }
    return lines
  }

  const clearHighlight = () => {
    highlightedPlanId.value = null
  }

  return {
    carePlans,
    careTasks,
    activeCarePlans,
    pendingTasks,
    upcoming7DaysTasks,
    overdueTasks,
    completedTasks,
    careGoalOptions,
    careTaskTypeMeta,
    highlightedPlanId,
    plansByOutfit,
    tasksByPlan,
    tasksByOutfit,
    hasActivePlanForOutfit,
    createCarePlan,
    deleteCarePlan,
    editCarePlan,
    editCarePlanAndRegenTasks,
    togglePlanActive,
    markTaskComplete,
    delayTask,
    deleteTask,
    createTask,
    generateCareSuggestions,
    getPlanSummary,
    refreshStatuses,
    clearHighlight,
  }
}
