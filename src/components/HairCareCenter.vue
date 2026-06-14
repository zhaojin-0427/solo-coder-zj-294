<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import {
  Bell,
  CalendarClock,
  Check,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pause,
  Play,
  Heart,
  History,
  Pencil,
  Filter,
} from 'lucide-vue-next'
import type { HairCarePlan, CareTask, CareTaskStatus, CareGoal } from '@/types'
import { useHairCare, careGoalOptions, careTaskTypeMeta } from '@/composables/useHairCare'
import CarePlanModal from '@/components/CarePlanModal.vue'
import { useHairStyle } from '@/composables/useHairStyle'

const {
  carePlans,
  careTasks,
  activeCarePlans,
  pendingTasks,
  upcoming7DaysTasks,
  overdueTasks,
  completedTasks,
  careTaskTypeMeta: taskMeta,
  highlightedPlanId,
  plansByOutfit,
  tasksByPlan,
  markTaskComplete,
  delayTask,
  deleteTask,
  deleteCarePlan,
  togglePlanActive,
  getPlanSummary,
} = useHairCare()

const selectedGoalFilter = ref<CareGoal | 'all'>('all')
const selectedStatusFilter = ref<CareTaskStatus | 'all'>('all')
const taskListViewMode = ref<'7days' | 'overdue' | 'completed'>('7days')
const filterCurrentOutfit = ref(false)

const { portfolio, currentAppliedOutfit } = useHairStyle()

const viewMode = ref<'upcoming' | 'all' | 'history'>('upcoming')
const expandedPlanId = ref<string | null>(null)
const showCreateModal = ref(false)
const selectedOutfitForPlan = ref<any>(null)
const showEditModal = ref(false)
const editingPlan = ref<HairCarePlan | null>(null)

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(dayAfter.getDate() + 2)

  if (ts >= today.getTime() && ts < tomorrow.getTime()) return '今天'
  if (ts >= tomorrow.getTime() && ts < dayAfter.getTime()) return '明天'

  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const getTaskDueDisplay = (task: CareTask) => {
  const due = task.delayedTo || task.dueDate
  return formatDate(due)
}

const statusBadge = (status: CareTaskStatus) => {
  switch (status) {
    case 'overdue':
      return { label: '已过期', color: '#E57373', bg: '#FFEBEE' }
    case 'delayed':
      return { label: '已延期', color: '#FFB74D', bg: '#FFF8E1' }
    case 'completed':
      return { label: '已完成', color: '#81C784', bg: '#E8F5E9' }
    default:
      return { label: '待办', color: '#64B5F6', bg: '#E3F2FD' }
  }
}

const toggleExpand = (planId: string) => {
  expandedPlanId.value = expandedPlanId.value === planId ? null : planId
}

const openCreateForOutfit = (outfit: any) => {
  selectedOutfitForPlan.value = outfit
  showCreateModal.value = true
}

const handleCreatedPlan = () => {
  viewMode.value = 'all'
  nextTick(() => {
    if (highlightedPlanId.value) {
      expandedPlanId.value = highlightedPlanId.value
      const planEl = document.getElementById(`care-plan-${highlightedPlanId.value}`)
      if (planEl) {
        planEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

const openCreateWithActive = () => {
  if (portfolio.value.length > 0) {
    selectedOutfitForPlan.value = portfolio.value[0]
    showCreateModal.value = true
  }
}

const filteredCarePlans = computed(() => {
  let result = [...carePlans.value]
  if (filterCurrentOutfit.value && currentAppliedOutfit.value) {
    result = result.filter((p) => p.outfitId === currentAppliedOutfit.value!.id)
  }
  if (selectedGoalFilter.value !== 'all') {
    result = result.filter((p) => p.goals.includes(selectedGoalFilter.value as CareGoal))
  }
  return result.sort((a, b) => b.createdAt - a.createdAt)
})

const taskListSource = computed(() => {
  switch (taskListViewMode.value) {
    case '7days':
      return upcoming7DaysTasks.value
    case 'overdue':
      return overdueTasks.value
    case 'completed':
      return completedTasks.value
    default:
      return upcoming7DaysTasks.value
  }
})

const displayedTasks = computed(() => {
  let result = taskListSource.value

  if (filterCurrentOutfit.value && currentAppliedOutfit.value) {
    const outfitPlanIds = new Set(
      carePlans.value
        .filter((p) => p.outfitId === currentAppliedOutfit.value!.id)
        .map((p) => p.id)
    )
    result = result.filter((t) => outfitPlanIds.has(t.planId))
  }

  if (selectedStatusFilter.value !== 'all') {
    result = result.filter((t) => t.status === selectedStatusFilter.value)
  }

  if (selectedGoalFilter.value !== 'all') {
    const planIds = new Set(
      carePlans.value
        .filter((p) => p.goals.includes(selectedGoalFilter.value as CareGoal))
        .map((p) => p.id)
    )
    result = result.filter((t) => planIds.has(t.planId))
  }

  return result
})

const planGoalsDisplay = (plan: HairCarePlan) => {
  return plan.goals
    .map((g) => careGoalOptions.find((o) => o.key === g))
    .filter(Boolean)
    .map((o: any) => `${o.icon}${o.name}`)
    .join('  ')
}

const planTaskStats = (planId: string) => {
  const tasks = tasksByPlan(planId)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'completed').length
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
}

const handleDeletePlan = (plan: HairCarePlan) => {
  if (confirm(`确定要删除"${plan.outfitName}"的护理计划吗？所有关联的护理事项也将被删除。`)) {
    deleteCarePlan(plan.id)
    if (expandedPlanId.value === plan.id) {
      expandedPlanId.value = null
    }
  }
}

const handleDeleteTask = (taskId: string) => {
  if (confirm('确定要删除这个护理事项吗？')) {
    deleteTask(taskId)
  }
}

const openEditPlan = (plan: HairCarePlan) => {
  editingPlan.value = plan
  showEditModal.value = true
}

const handleUpdatedPlan = () => {
  if (editingPlan.value) {
    expandedPlanId.value = editingPlan.value.id
  }
}
</script>

<template>
  <div class="care-center">
    <div class="cc-header">
      <div class="cc-title-row">
        <Bell :size="20" class="cc-title-icon" />
        <h3 class="cc-title">护理计划与提醒中心</h3>
      </div>
      <button
        v-if="portfolio.length > 0"
        class="cc-create-btn"
        @click="openCreateWithActive"
      >
        <Heart :size="14" />
        新建护理计划
      </button>
    </div>

    <div class="cc-stats">
      <div class="stat-card stat-upcoming">
        <div class="stat-icon">📅</div>
        <div class="stat-num">{{ pendingTasks.length }}</div>
        <div class="stat-label">待办护理</div>
      </div>
      <div class="stat-card stat-overdue">
        <div class="stat-icon">⚠️</div>
        <div class="stat-num">{{ overdueTasks.length }}</div>
        <div class="stat-label">已过期</div>
      </div>
      <div class="stat-card stat-plan">
        <div class="stat-icon">💇</div>
        <div class="stat-num">{{ activeCarePlans.length }}</div>
        <div class="stat-label">活跃方案</div>
      </div>
      <div class="stat-card stat-done">
        <div class="stat-icon">✅</div>
        <div class="stat-num">{{ completedTasks.length }}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>

    <div class="cc-tabs">
      <button
        :class="['cc-tab', { active: viewMode === 'upcoming' }]"
        @click="viewMode = 'upcoming'"
      >
        <CalendarClock :size="14" />
        待办事项
      </button>
      <button
        :class="['cc-tab', { active: viewMode === 'all' }]"
        @click="viewMode = 'all'"
      >
        <Heart :size="14" />
        全部方案
      </button>
      <button
        :class="['cc-tab', { active: viewMode === 'history' }]"
        @click="viewMode = 'history'"
      >
        <History :size="14" />
        完成历史
      </button>
    </div>

    <div v-if="viewMode === 'all'" class="cc-plans">
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">护理目标：</span>
          <div class="filter-chips">
            <button
              :class="['filter-chip', { active: selectedGoalFilter === 'all' }]"
              @click="selectedGoalFilter = 'all'"
            >
              全部
            </button>
            <button
              v-for="goal in careGoalOptions"
              :key="goal.key"
              :class="['filter-chip', { active: selectedGoalFilter === goal.key }]"
              @click="selectedGoalFilter = goal.key"
            >
              {{ goal.icon }} {{ goal.name }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-switch-label">
            <Filter :size="14" />
            <span>仅看当前应用方案</span>
            <button
              :class="['filter-switch', { active: filterCurrentOutfit }]"
              @click="filterCurrentOutfit = !filterCurrentOutfit"
              :disabled="!currentAppliedOutfit"
            >
              <span class="switch-thumb"></span>
            </button>
          </label>
        </div>
      </div>

      <div v-if="filteredCarePlans.length === 0" class="empty-block">
        <div class="empty-emoji">💆</div>
        <p class="empty-title">还没有护理计划</p>
        <p class="empty-desc">从作品集选择一个方案，为它创建专属护理计划吧</p>
        <div v-if="portfolio.length > 0" class="plan-outfit-picker">
          <p class="picker-label">快速为以下方案创建：</p>
          <div class="picker-grid">
            <button
              v-for="outfit in portfolio.slice(0, 4)"
              :key="outfit.id"
              class="picker-item"
              @click="openCreateForOutfit(outfit)"
            >
              {{ outfit.name }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-for="plan in filteredCarePlans"
        :key="plan.id"
        :id="`care-plan-${plan.id}`"
        :class="['plan-card', { inactive: !plan.active, highlighted: highlightedPlanId === plan.id }]"
      >
        <div v-if="highlightedPlanId === plan.id" class="plan-highlight-tag">
          ✨ 新建计划
        </div>
        <div class="plan-header" @click="toggleExpand(plan.id)">
          <div class="plan-main">
            <div class="plan-name-row">
              <span class="plan-name">{{ plan.outfitName }}</span>
              <span
                :class="['plan-status', plan.active ? 'active' : 'paused']"
              >
                {{ plan.active ? '进行中' : '已暂停' }}
              </span>
            </div>
            <div class="plan-goals">{{ planGoalsDisplay(plan) || '未设目标' }}</div>
            <div class="plan-progress">
              <div class="prog-bar">
                <div
                  class="prog-fill"
                  :style="{ width: planTaskStats(plan.id).percent + '%' }"
                ></div>
              </div>
              <span class="prog-text">
                {{ planTaskStats(plan.id).done }}/{{ planTaskStats(plan.id).total }}
              </span>
            </div>
          </div>
          <div class="plan-expand">
            <ChevronDown v-if="expandedPlanId !== plan.id" :size="18" />
            <ChevronUp v-else :size="18" />
          </div>
        </div>

        <div v-if="expandedPlanId === plan.id" class="plan-detail">
          <div class="summary-block">
            <div class="summary-title">护理摘要</div>
            <ul class="summary-list">
              <li v-for="(line, i) in getPlanSummary(plan.id)" :key="i">· {{ line }}</li>
              <li v-if="getPlanSummary(plan.id).length === 0" class="empty-summary">暂无自定义配置</li>
            </ul>
          </div>

          <div v-if="plan.autoSuggestions.length > 0" class="summary-block">
            <div class="summary-title">系统建议</div>
            <ul class="suggestion-ul">
              <li v-for="(s, i) in plan.autoSuggestions.slice(0, 5)" :key="i">
                <span class="s-text">{{ s }}</span>
              </li>
            </ul>
          </div>

          <div class="summary-block">
            <div class="summary-title">护理事项（{{ tasksByPlan(plan.id).length }}项）</div>
            <div class="mini-task-list">
              <div
                v-for="task in tasksByPlan(plan.id).slice(0, 10)"
                :key="task.id"
                class="mini-task"
              >
                <button
                  v-if="task.status !== 'completed'"
                  class="mini-check"
                  @click.stop="markTaskComplete(task.id)"
                ></button>
                <Check v-else :size="14" class="mini-check-done" />
                <div class="mini-task-meta">
                  <span
                    class="mini-ico"
                    :style="{ background: taskMeta[task.type]?.color + '22', color: taskMeta[task.type]?.color }"
                  >
                    {{ taskMeta[task.type]?.icon }}
                  </span>
                  <span class="mini-title">{{ task.title }}</span>
                </div>
                <span
                  :class="['mini-date', task.status]"
                >
                  {{ getTaskDueDisplay(task) }}
                </span>
              </div>
              <div v-if="tasksByPlan(plan.id).length === 0" class="empty-summary">
                暂无护理事项
              </div>
            </div>
          </div>

          <div class="plan-actions">
            <button class="p-action" @click.stop="openEditPlan(plan)">
              <Pencil :size="14" />
              编辑
            </button>
            <button class="p-action" @click.stop="togglePlanActive(plan.id)">
              <component :is="plan.active ? Pause : Play" :size="14" />
              {{ plan.active ? '暂停' : '恢复' }}
            </button>
            <button
              class="p-action danger"
              @click.stop="handleDeletePlan(plan)"
            >
              <Trash2 :size="14" />
              删除计划
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="cc-tasks">
      <div class="task-list-tabs">
        <button
          :class="['task-list-tab', { active: taskListViewMode === '7days' }]"
          @click="taskListViewMode = '7days'"
        >
          <CalendarClock :size="14" />
          未来7天 ({{ upcoming7DaysTasks.length }})
        </button>
        <button
          :class="['task-list-tab', { active: taskListViewMode === 'overdue' }]"
          @click="taskListViewMode = 'overdue'"
        >
          <AlertTriangle :size="14" />
          已过期 ({{ overdueTasks.length }})
        </button>
        <button
          :class="['task-list-tab', { active: taskListViewMode === 'completed' }]"
          @click="taskListViewMode = 'completed'"
        >
          <Check :size="14" />
          已完成 ({{ completedTasks.length }})
        </button>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">护理目标：</span>
          <div class="filter-chips">
            <button
              :class="['filter-chip', { active: selectedGoalFilter === 'all' }]"
              @click="selectedGoalFilter = 'all'"
            >
              全部
            </button>
            <button
              v-for="goal in careGoalOptions"
              :key="goal.key"
              :class="['filter-chip', { active: selectedGoalFilter === goal.key }]"
              @click="selectedGoalFilter = goal.key"
            >
              {{ goal.icon }} {{ goal.name }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-switch-label">
            <Filter :size="14" />
            <span>仅看当前应用方案</span>
            <button
              :class="['filter-switch', { active: filterCurrentOutfit }]"
              @click="filterCurrentOutfit = !filterCurrentOutfit"
              :disabled="!currentAppliedOutfit"
            >
              <span class="switch-thumb"></span>
            </button>
          </label>
        </div>
        <div v-if="taskListViewMode !== 'completed'" class="filter-group">
          <span class="filter-label">任务状态：</span>
          <select
            :value="selectedStatusFilter"
            class="filter-select"
            @change="(e) => selectedStatusFilter = (e.target as HTMLSelectElement).value as (CareTaskStatus | 'all')"
          >
            <option value="all">全部</option>
            <option value="pending">待办</option>
            <option value="delayed">已延期</option>
            <option value="overdue">已过期</option>
          </select>
        </div>
      </div>

      <div v-if="displayedTasks.length === 0" class="empty-block">
        <div class="empty-emoji">🌿</div>
        <p class="empty-title">{{
          taskListViewMode === 'completed' ? '还没有完成记录' :
          taskListViewMode === 'overdue' ? '没有已过期的护理' :
          '近期没有待办护理'
        }}</p>
        <p class="empty-desc">{{
          taskListViewMode === 'completed'
            ? '完成护理事项后会出现在这里'
            : '创建护理计划后，事项将自动安排'
        }}</p>
      </div>

      <div
        v-for="task in displayedTasks"
        :key="task.id"
        :class="['task-row', task.status]"
      >
        <button
          v-if="task.status !== 'completed'"
          class="task-check"
          @click="markTaskComplete(task.id)"
          title="标记完成"
        ></button>
        <Check v-else :size="18" class="task-check-done" />
        <div class="task-type-col">
          <span
            class="task-ico"
            :style="{ background: taskMeta[task.type]?.color + '22', color: taskMeta[task.type]?.color }"
          >
            {{ taskMeta[task.type]?.icon }}
          </span>
        </div>
        <div class="task-content">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-sub">
            <span class="task-plan-name">{{
              carePlans.find(p => p.id === task.planId)?.outfitName || '未关联方案'
            }}</span>
            <span
              :class="['task-due', { overdue: task.status === 'overdue', delayed: task.status === 'delayed' }]"
            >
              {{ task.status === 'completed'
                ? `完成于 ${task.completedAt ? formatDate(task.completedAt) : ''}`
                : getTaskDueDisplay(task) }}
            </span>
          </div>
          <span
            v-if="task.status !== 'completed'"
            class="task-status-tag"
            :style="{ color: statusBadge(task.status).color, background: statusBadge(task.status).bg }"
          >
            {{ statusBadge(task.status).label }}
          </span>
        </div>
        <div class="task-actions-col">
          <button
            v-if="taskListViewMode !== 'completed' && task.status !== 'completed'"
            class="t-action delay"
            @click="delayTask(task.id, 1)"
            title="延期1天"
          >
            <Clock :size="14" />
            +1天
          </button>
          <button
            v-if="taskListViewMode !== 'completed' && task.status !== 'completed'"
            class="t-action delay"
            @click="delayTask(task.id, 3)"
            title="延期3天"
          >
            +3天
          </button>
          <button
            class="t-action delete"
            @click="handleDeleteTask(task.id)"
            title="删除"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <CarePlanModal
      :visible="showCreateModal"
      :outfit="selectedOutfitForPlan"
      @close="showCreateModal = false"
      @created="handleCreatedPlan"
    />

    <CarePlanModal
      :visible="showEditModal"
      :outfit="null"
      :editPlan="editingPlan"
      @close="showEditModal = false"
      @updated="handleUpdatedPlan"
    />
  </div>
</template>

<style scoped>
.care-center {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(196, 69, 105, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  overflow: hidden;
}

.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cc-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-title-icon {
  color: #C44569;
}

.cc-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #C44569;
  font-family: 'Playfair Display', serif;
}

.cc-create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cc-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.3);
}

.cc-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 12px 10px;
  border-radius: 14px;
  text-align: center;
  background: linear-gradient(135deg, #FFF5F8, #FCE4EC);
  border: 1px solid #FFE4EA;
}

.stat-upcoming { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-color: #90CAF9; }
.stat-overdue { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); border-color: #EF9A9A; }
.stat-plan { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-color: #FFCC80; }
.stat-done { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-color: #A5D6A7; }

.stat-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #5D4037;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 10px;
  color: #8B5A6B;
}

.cc-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  border-bottom: 1px solid #FFE4EA;
  padding-bottom: 10px;
}

.cc-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #8B5A6B;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.cc-tab:hover {
  background: #FFF0F3;
}

.cc-tab.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}

.cc-plans,
.cc-tasks {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.cc-plans::-webkit-scrollbar,
.cc-tasks::-webkit-scrollbar {
  width: 4px;
}
.cc-plans::-webkit-scrollbar-track,
.cc-tasks::-webkit-scrollbar-track {
  background: #FFF0F3;
  border-radius: 2px;
}
.cc-plans::-webkit-scrollbar-thumb,
.cc-tasks::-webkit-scrollbar-thumb {
  background: #FFB6C1;
  border-radius: 2px;
}

.empty-block {
  text-align: center;
  padding: 40px 20px;
}

.empty-emoji {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-title {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #5D4037;
  font-weight: 500;
}

.empty-desc {
  margin: 0;
  font-size: 12px;
  color: #9E7A85;
}

.plan-outfit-picker {
  margin-top: 18px;
}

.picker-label {
  font-size: 12px;
  color: #8B5A6B;
  margin: 0 0 10px 0;
}

.picker-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.picker-item {
  padding: 6px 14px;
  border: 1px solid #FFB6C1;
  border-radius: 20px;
  background: #fff;
  color: #C44569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.picker-item:hover {
  background: #FFF0F3;
}

.plan-card {
  background: #FFF8FA;
  border: 1px solid #FFE4EA;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.plan-card:hover {
  border-color: #FFB6C1;
}

.plan-card.inactive {
  opacity: 0.65;
  background: #FAFAFA;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
}

.plan-main {
  flex: 1;
  min-width: 0;
}

.plan-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.plan-name {
  font-size: 14px;
  font-weight: 600;
  color: #5D4037;
}

.plan-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.plan-status.active {
  background: #E8F5E9;
  color: #66BB6A;
}

.plan-status.paused {
  background: #FFF3E0;
  color: #FFA726;
}

.plan-goals {
  font-size: 12px;
  color: #8B5A6B;
  margin-bottom: 6px;
}

.plan-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prog-bar {
  flex: 1;
  height: 6px;
  background: #FFE4EA;
  border-radius: 4px;
  overflow: hidden;
}

.prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #C44569);
  border-radius: 4px;
  transition: width 0.3s;
}

.prog-text {
  font-size: 11px;
  color: #8B5A6B;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.plan-expand {
  color: #B88899;
  flex-shrink: 0;
}

.plan-detail {
  padding: 0 16px 16px;
  border-top: 1px solid #FFE4EA;
}

.summary-block {
  margin-top: 14px;
}

.summary-title {
  font-size: 12px;
  font-weight: 600;
  color: #8B5A6B;
  margin-bottom: 8px;
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-list li {
  font-size: 12px;
  color: #5D4037;
  padding: 4px 0;
  line-height: 1.5;
}

.empty-summary {
  font-size: 12px;
  color: #B88899;
  padding: 4px 0;
}

.suggestion-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-ul li {
  padding: 6px 10px;
  background: #FFF8FA;
  border: 1px solid #FFE4EA;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  line-height: 1.5;
}

.s-text {
  color: #6B4452;
}

.mini-task-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #fff;
  border-radius: 8px;
}

.mini-check {
  width: 16px;
  height: 16px;
  border: 2px solid #FFB6C1;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s;
}

.mini-check:hover {
  border-color: #C44569;
  background: #C44569;
}

.mini-check-done {
  color: #81C784;
  flex-shrink: 0;
}

.mini-task-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.mini-ico {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.mini-title {
  font-size: 12px;
  color: #5D4037;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-date {
  font-size: 11px;
  color: #8B5A6B;
  flex-shrink: 0;
}

.mini-date.overdue {
  color: #E57373;
  font-weight: 500;
}

.mini-date.delayed {
  color: #FFA726;
}

.plan-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #FFE4EA;
}

.p-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #fff;
  color: #8B5A6B;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.p-action:hover {
  background: #FFF0F3;
  color: #C44569;
}

.p-action.danger {
  border-color: #EF9A9A;
  color: #E57373;
}

.p-action.danger:hover {
  background: #FFEBEE;
  color: #E53935;
}

.overdue-block {
  background: linear-gradient(135deg, #FFEBEE, #FFF5F7);
  border: 1px solid #EF9A9A;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.ob-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.ob-icon {
  color: #E57373;
}

.ob-title {
  font-size: 13px;
  font-weight: 600;
  color: #C62828;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #FFF8FA;
  border: 1px solid #FFE4EA;
  border-radius: 14px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.task-row:hover {
  border-color: #FFB6C1;
}

.task-row.overdue {
  background: #FFF5F5;
  border-color: #EF9A9A;
}

.task-row.completed {
  background: #F5FFF7;
  border-color: #C8E6C9;
  opacity: 0.85;
}

.task-check {
  width: 22px;
  height: 22px;
  border: 2px solid #FFB6C1;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  padding: 0;
}

.task-check:hover {
  border-color: #C44569;
  background: #C44569;
}

.task-check.overdue-check {
  border-color: #EF9A9A;
}
.task-check.overdue-check:hover {
  background: #E57373;
  border-color: #E57373;
}

.task-check-done {
  color: #81C784;
  flex-shrink: 0;
}

.task-type-col {
  flex-shrink: 0;
}

.task-ico {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 13px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 4px;
}

.task-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #8B5A6B;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.task-plan-name {
  background: #FFF0F3;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #C44569;
}

.task-due.overdue {
  color: #E57373;
  font-weight: 600;
}

.task-due.delayed {
  color: #FFA726;
}

.task-status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
}

.task-actions-col {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.t-action {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border: 1px solid #FFE4EA;
  border-radius: 8px;
  background: #fff;
  color: #8B5A6B;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.t-action:hover {
  background: #FFF0F3;
}

.t-action.delay:hover {
  color: #FFA726;
  border-color: #FFCC80;
}

.t-action.delete:hover {
  color: #E57373;
  border-color: #EF9A9A;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px;
  background: linear-gradient(135deg, #FFF5F8, #FFF8FA);
  border: 1px solid #FFE4EA;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 12px;
  color: #8B5A6B;
  font-weight: 500;
  flex-shrink: 0;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 4px 10px;
  border: 1px solid #FFE4EA;
  border-radius: 12px;
  background: #fff;
  color: #8B5A6B;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: #FFF0F3;
  border-color: #FFB6C1;
}

.filter-chip.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}

.filter-select {
  padding: 4px 10px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #fff;
  color: #5D4037;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: #C44569;
}

.task-list-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  padding: 4px;
  background: #FFF5F8;
  border-radius: 12px;
  overflow-x: auto;
}

.task-list-tab {
  flex: 1;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #8B5A6B;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.task-list-tab:hover {
  background: #FFF0F3;
}

.task-list-tab.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  box-shadow: 0 2px 8px rgba(196, 69, 105, 0.25);
}

.plan-card {
  position: relative;
}

.plan-card.highlighted {
  border-color: #FFD54F;
  box-shadow: 0 0 0 3px rgba(255, 213, 79, 0.3), 0 8px 24px rgba(255, 213, 79, 0.2);
  animation: pulse-highlight 2s ease-in-out infinite;
}

@keyframes pulse-highlight {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(255, 213, 79, 0.3), 0 8px 24px rgba(255, 213, 79, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(255, 213, 79, 0.2), 0 8px 24px rgba(255, 213, 79, 0.3);
  }
}

.plan-highlight-tag {
  position: absolute;
  top: -10px;
  right: 16px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #FFD54F, #FFA726);
  color: #5D4037;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.4);
  z-index: 1;
}

@media (max-width: 480px) {
  .cc-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    justify-content: flex-start;
  }

  .task-list-tabs {
    flex-wrap: nowrap;
  }

  .task-list-tab {
    font-size: 11px;
    padding: 8px 10px;
  }
}

.filter-switch-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B5A6B;
  cursor: pointer;
  user-select: none;
}

.filter-switch {
  position: relative;
  width: 36px;
  height: 20px;
  border: none;
  border-radius: 10px;
  background: #FFE4EA;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.filter-switch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.filter-switch.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.filter-switch.active .switch-thumb {
  left: 18px;
}
</style>
