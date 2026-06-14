<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus, Calendar, Filter, Trash2, Edit, Check, X, CalendarDays,
  Tag, Clock, Star, Eye, Palette, Shirt, Sun, CheckCircle,
  AlertCircle, RotateCcw, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-vue-next'
import { useOutfitPlan } from '@/composables/useOutfitPlan'
import {
  sceneOptions, lightOptions, makeupStyles, clothingColors,
  autoTagInfo, defaultLenses, styleLabels, periodLabels
} from '@/data/lenses'
import type { OutfitPlan, Rating, SceneType, LightEnvironment, PlanStatus, AutoTag } from '@/types'

const {
  filteredPlans,
  pendingPlans,
  upcomingPlans,
  overduePlans,
  currentPlanFilter,
  selectedDate,
  createPlan,
  deletePlan,
  editPlan,
  executePlan,
  cancelPlan,
  setFilter,
  setSelectedDate,
  toggleTagFilter,
} = useOutfitPlan()

const showForm = ref(false)
const showExecuteForm = ref(false)
const showLensPicker = ref(false)
const editingPlan = ref<OutfitPlan | null>(null)
const executingPlan = ref<OutfitPlan | null>(null)
const activeTab = ref<'all' | 'pending' | 'executed'>('all')
const showFilters = ref(false)
const pickingAlternative = ref(false)

const formData = ref({
  sceneName: '',
  sceneType: 'daily' as SceneType,
  makeupStyle: '裸妆',
  clothingColor: '黑白灰',
  lightEnvironment: 'natural' as LightEnvironment,
  recommendedLensId: '',
  alternativeLensId: '',
  expectedWearDate: new Date().setHours(9, 0, 0, 0),
  expectedDurationMinutes: 480,
  matchingScore: 4 as Rating,
  note: '',
})

const executeFormData = ref({
  wearDate: Date.now(),
  wearStartTime: Date.now(),
  wearEndTime: Date.now() + 8 * 60 * 60 * 1000,
  durationMinutes: 480,
  comfortLevel: 4 as Rating,
  eyeCondition: 'normal',
  note: '',
})

const displayPlans = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return pendingPlans.value
    case 'executed':
      return filteredPlans.value.filter(p => p.status === 'executed')
    default:
      return filteredPlans.value
  }
})

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }
  return `${mins}分钟`
}

const renderStars = (rating: Rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

const getSceneInfo = (type: SceneType) => {
  return sceneOptions.find(s => s.key === type) || sceneOptions[0]
}

const getLightInfo = (type: LightEnvironment) => {
  return lightOptions.find(l => l.key === type) || lightOptions[0]
}

const getStatusInfo = (status: PlanStatus) => {
  const map: Record<PlanStatus, { name: string; color: string; icon: any }> = {
    pending: { name: '待执行', color: '#FF9800', icon: Clock },
    executed: { name: '已执行', color: '#4CAF50', icon: CheckCircle },
    cancelled: { name: '已取消', color: '#9E9E9E', icon: X },
  }
  return map[status]
}

const openCreateForm = (lensId?: string) => {
  editingPlan.value = null
  formData.value = {
    sceneName: '',
    sceneType: 'daily',
    makeupStyle: '裸妆',
    clothingColor: '黑白灰',
    lightEnvironment: 'natural',
    recommendedLensId: lensId || defaultLenses[0]?.id || '',
    alternativeLensId: '',
    expectedWearDate: new Date().setHours(9, 0, 0, 0),
    expectedDurationMinutes: 480,
    matchingScore: 4,
    note: '',
  }
  showForm.value = true
}

const openEditForm = (plan: OutfitPlan) => {
  editingPlan.value = plan
  formData.value = {
    sceneName: plan.sceneName,
    sceneType: plan.sceneType,
    makeupStyle: plan.makeupStyle,
    clothingColor: plan.clothingColor,
    lightEnvironment: plan.lightEnvironment,
    recommendedLensId: plan.recommendedLensId,
    alternativeLensId: plan.alternativeLensId || '',
    expectedWearDate: plan.expectedWearDate,
    expectedDurationMinutes: plan.expectedDurationMinutes,
    matchingScore: plan.matchingScore,
    note: plan.note || '',
  }
  showForm.value = true
}

const openExecuteForm = (plan: OutfitPlan) => {
  executingPlan.value = plan
  executeFormData.value = {
    wearDate: new Date().setHours(0, 0, 0, 0),
    wearStartTime: Date.now(),
    wearEndTime: Date.now() + plan.expectedDurationMinutes * 60 * 1000,
    durationMinutes: plan.expectedDurationMinutes,
    comfortLevel: 4,
    eyeCondition: 'normal',
    note: '',
  }
  showExecuteForm.value = true
}

const handleSubmit = () => {
  if (!formData.value.sceneName.trim()) {
    alert('请输入场景名称')
    return
  }
  if (!formData.value.recommendedLensId) {
    alert('请选择推荐镜片')
    return
  }

  if (editingPlan.value) {
    editPlan(editingPlan.value.id, {
      ...formData.value,
      alternativeLensId: formData.value.alternativeLensId || undefined,
    })
  } else {
    createPlan({
      ...formData.value,
      lensId: formData.value.recommendedLensId,
      alternativeLensId: formData.value.alternativeLensId || undefined,
    })
  }
  showForm.value = false
}

const handleExecute = () => {
  if (!executingPlan.value) return

  const duration = Math.round(
    (executeFormData.value.wearEndTime - executeFormData.value.wearStartTime) / 60000
  )
  executeFormData.value.durationMinutes = duration

  executePlan(executingPlan.value.id, executeFormData.value)
  showExecuteForm.value = false
}

const handleDelete = (id: string) => {
  if (confirm('确定要删除这个搭配计划吗？')) {
    deletePlan(id)
  }
}

const handleCancel = (id: string) => {
  if (confirm('确定要取消这个搭配计划吗？')) {
    cancelPlan(id)
  }
}

const selectLens = (lensId: string) => {
  if (pickingAlternative.value) {
    formData.value.alternativeLensId = lensId
  } else {
    formData.value.recommendedLensId = lensId
  }
  showLensPicker.value = false
}

const openLensPicker = (isAlternative: boolean) => {
  pickingAlternative.value = isAlternative
  showLensPicker.value = true
}

const navigateDate = (direction: number) => {
  const current = selectedDate.value || Date.now()
  const newDate = new Date(current)
  newDate.setDate(newDate.getDate() + direction)
  selectedDate.value = newDate.getTime()
}

const clearDateFilter = () => {
  selectedDate.value = null
}

const getRecommendedLens = (id: string) => {
  return defaultLenses.find(l => l.id === id)
}

const updateDurationFromTimes = () => {
  const duration = Math.round(
    (executeFormData.value.wearEndTime - executeFormData.value.wearStartTime) / 60000
  )
  if (duration > 0) {
    executeFormData.value.durationMinutes = duration
  }
}
</script>

<template>
  <div class="outfit-plan-page">
    <header class="page-header">
      <div class="header-content">
        <div class="header-title">
          <Sparkles :size="28" class="header-icon" />
          <h1>彩瞳妆容与场景搭配计划</h1>
        </div>
        <p class="header-subtitle">为每副彩瞳定制专属的出行搭配方案</p>
      </div>
    </header>

    <main class="page-content">
      <div class="toolbar">
        <div class="left-tools">
          <div class="tabs">
            <button
              :class="['tab-btn', { active: activeTab === 'all' }]"
              @click="activeTab = 'all'"
            >
              全部
              <span class="tab-count">{{ filteredPlans.length }}</span>
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'pending' }]"
              @click="activeTab = 'pending'"
            >
              <Clock :size="14" />
              待执行
              <span class="tab-count">{{ pendingPlans.length }}</span>
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'executed' }]"
              @click="activeTab = 'executed'"
            >
              <CheckCircle :size="14" />
              已执行
              <span class="tab-count">{{ filteredPlans.filter(p => p.status === 'executed').length }}</span>
            </button>
          </div>
        </div>

        <div class="right-tools">
          <button class="tool-btn filter-btn" @click="showFilters = !showFilters">
            <Filter :size="16" />
            筛选
          </button>
          <button class="tool-btn date-btn" @click="navigateDate(-1)">
            <ChevronLeft :size="16" />
          </button>
          <button class="tool-btn date-btn" @click="clearDateFilter">
            <CalendarDays :size="16" />
            {{ selectedDate ? formatDate(selectedDate) : '全部日期' }}
          </button>
          <button class="tool-btn date-btn" @click="navigateDate(1)">
            <ChevronRight :size="16" />
          </button>
          <button class="primary-btn" @click="openCreateForm()">
            <Plus :size="16" />
            新建计划
          </button>
        </div>
      </div>

      <div v-if="showFilters" class="filter-panel">
        <div class="filter-group">
          <span class="filter-label">场景类型：</span>
          <div class="filter-options">
            <button
              :class="['filter-chip', { active: currentPlanFilter.sceneType === 'all' }]"
              @click="setFilter({ sceneType: 'all' })"
            >
              全部
            </button>
            <button
              v-for="scene in sceneOptions"
              :key="scene.key"
              :class="['filter-chip', { active: currentPlanFilter.sceneType === scene.key }]"
              @click="setFilter({ sceneType: scene.key })"
            >
              {{ scene.icon }} {{ scene.name }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">执行状态：</span>
          <div class="filter-options">
            <button
              :class="['filter-chip', { active: currentPlanFilter.status === 'all' }]"
              @click="setFilter({ status: 'all' })"
            >
              全部
            </button>
            <button
              :class="['filter-chip', { active: currentPlanFilter.status === 'pending' }]"
              @click="setFilter({ status: 'pending' })"
            >
              待执行
            </button>
            <button
              :class="['filter-chip', { active: currentPlanFilter.status === 'executed' }]"
              @click="setFilter({ status: 'executed' })"
            >
              已执行
            </button>
            <button
              :class="['filter-chip', { active: currentPlanFilter.status === 'cancelled' }]"
              @click="setFilter({ status: 'cancelled' })"
            >
              已取消
            </button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">智能标签：</span>
          <div class="filter-options">
            <button
              v-for="(tagInfo, tagKey) in autoTagInfo"
              :key="tagKey"
              :class="['filter-chip tag-chip', { active: currentPlanFilter.hasTags.includes(tagKey as AutoTag) }]"
              :style="{ borderColor: tagInfo.color, color: currentPlanFilter.hasTags.includes(tagKey as AutoTag) ? '#fff' : tagInfo.color }"
              @click="toggleTagFilter(tagKey as AutoTag)"
            >
              <Tag :size="12" />
              {{ tagInfo.name }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="overduePlans.length > 0" class="alert-section">
        <div class="alert-card">
          <AlertCircle :size="20" class="alert-icon" />
          <div class="alert-content">
            <h4 class="alert-title">有 {{ overduePlans.length }} 个计划已过期</h4>
            <p class="alert-desc">请及时处理这些过期的搭配计划</p>
          </div>
        </div>
      </div>

      <div v-if="upcomingPlans.length > 0 && activeTab !== 'executed'" class="upcoming-section">
        <h3 class="section-title">
          <Calendar :size="18" />
          近期计划（7天内）
        </h3>
        <div class="upcoming-list">
          <div
            v-for="plan in upcomingPlans.slice(0, 3)"
            :key="plan.id"
            class="upcoming-card"
          >
            <div class="upcoming-date">
              <span class="date-day">{{ new Date(plan.expectedWearDate).getDate() }}</span>
              <span class="date-month">{{ new Date(plan.expectedWearDate).getMonth() + 1 }}月</span>
            </div>
            <div class="upcoming-info">
              <h4 class="upcoming-name">{{ plan.sceneName }}</h4>
              <p class="upcoming-detail">
                {{ getSceneInfo(plan.sceneType).icon }} {{ getSceneInfo(plan.sceneType).name }}
                · {{ plan.recommendedLensName }}
              </p>
            </div>
            <button class="upcoming-action" @click="openExecuteForm(plan)">
              <Check :size="14" />
              执行
            </button>
          </div>
        </div>
      </div>

      <div class="plans-list">
        <div v-if="displayPlans.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3 class="empty-title">暂无搭配计划</h3>
          <p class="empty-desc">点击"新建计划"创建你的第一个彩瞳搭配方案</p>
          <button class="primary-btn" @click="openCreateForm()">
            <Plus :size="16" />
            新建计划
          </button>
        </div>

        <div
          v-for="plan in displayPlans"
          :key="plan.id"
          :class="['plan-card', { overdue: plan.status === 'pending' && plan.expectedWearDate < Date.now() }]"
        >
          <div class="plan-header">
            <div class="plan-title-section">
              <h3 class="plan-name">{{ plan.sceneName }}</h3>
              <span
                class="status-badge"
                :style="{ background: getStatusInfo(plan.status).color }"
              >
                <component :is="getStatusInfo(plan.status).icon" :size="12" />
                {{ getStatusInfo(plan.status).name }}
              </span>
            </div>
            <div class="plan-actions">
              <button
                v-if="plan.status === 'pending'"
                class="action-btn execute-btn"
                @click="openExecuteForm(plan)"
                title="执行计划"
              >
                <Check :size="14" />
              </button>
              <button
                v-if="plan.status === 'pending'"
                class="action-btn cancel-btn"
                @click="handleCancel(plan.id)"
                title="取消计划"
              >
                <RotateCcw :size="14" />
              </button>
              <button
                class="action-btn edit-btn"
                @click="openEditForm(plan)"
                title="编辑"
              >
                <Edit :size="14" />
              </button>
              <button
                class="action-btn delete-btn"
                @click="handleDelete(plan.id)"
                title="删除"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <div class="plan-body">
            <div class="plan-grid">
              <div class="plan-item">
                <span class="item-icon">{{ getSceneInfo(plan.sceneType).icon }}</span>
                <div class="item-content">
                  <span class="item-label">场景类型</span>
                  <span class="item-value">{{ getSceneInfo(plan.sceneType).name }}</span>
                </div>
              </div>
              <div class="plan-item">
                <Palette :size="16" class="item-icon-icon" />
                <div class="item-content">
                  <span class="item-label">妆容风格</span>
                  <span class="item-value">{{ plan.makeupStyle }}</span>
                </div>
              </div>
              <div class="plan-item">
                <Shirt :size="16" class="item-icon-icon" />
                <div class="item-content">
                  <span class="item-label">服饰色系</span>
                  <span class="item-value">{{ plan.clothingColor }}</span>
                </div>
              </div>
              <div class="plan-item">
                <span class="item-icon">{{ getLightInfo(plan.lightEnvironment).icon }}</span>
                <div class="item-content">
                  <span class="item-label">光线环境</span>
                  <span class="item-value">{{ getLightInfo(plan.lightEnvironment).name }}</span>
                </div>
              </div>
            </div>

