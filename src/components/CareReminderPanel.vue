<script setup lang="ts">
import { computed } from 'vue'
import {
  Bell,
  Check,
  Clock,
  ChevronRight,
  AlertTriangle,
  Calendar,
} from 'lucide-vue-next'
import { useHairCare, careTaskTypeMeta } from '@/composables/useHairCare'

const emit = defineEmits<{
  (e: 'openCenter'): void
}>()

const {
  upcoming7DaysTasks,
  overdueTasks,
  carePlans,
  markTaskComplete,
  delayTask,
} = useHairCare()

const DAY_MS = 24 * 60 * 60 * 1000

const today = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
})

const tasksByDay = computed(() => {
  const result: Record<number, { label: string; tasks: typeof upcoming7DaysTasks.value }> = {}
  for (let i = 0; i < 7; i++) {
    const dayTs = today.value + i * DAY_MS
    const d = new Date(dayTs)
    let label = ''
    if (i === 0) label = '今天'
    else if (i === 1) label = '明天'
    else label = `${d.getMonth() + 1}/${d.getDate()}`

    const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdayNames[d.getDay()]
    result[dayTs] = {
      label: `${label} · 周${weekday}`,
      tasks: upcoming7DaysTasks.value.filter((t) => {
        const due = t.delayedTo || t.dueDate
        const dayEnd = dayTs + DAY_MS
        return due >= dayTs && due < dayEnd
      }),
    }
  }
  return result
})

const totalCount = computed(() => upcoming7DaysTasks.value.length + overdueTasks.value.length)

const formatShortTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class="reminder-panel">
    <div class="rp-header" @click="$emit('openCenter')">
      <div class="rp-title-row">
        <div class="rp-title-ico-wrap">
          <Bell :size="16" class="rp-title-ico" />
          <span v-if="totalCount > 0" class="rp-badge">{{ totalCount > 99 ? '99+' : totalCount }}</span>
        </div>
        <span class="rp-title">未来7天护理提醒</span>
      </div>
      <div class="rp-more">
        详情
        <ChevronRight :size="14" />
      </div>
    </div>

    <div v-if="totalCount === 0" class="rp-empty">
      <div class="rp-empty-ico">🌷</div>
      <div class="rp-empty-text">近期暂无护理待办</div>
      <div class="rp-empty-tip">创建护理计划后自动生成提醒</div>
    </div>

    <div v-else class="rp-content">
      <div v-if="overdueTasks.length > 0" class="rp-overdue-section">
        <div class="rp-day-header overdue">
          <AlertTriangle :size="14" class="rp-day-icon overdue-icon" />
          <span class="rp-day-label">已过期（{{ overdueTasks.length }}项）</span>
        </div>
        <div class="rp-task-list">
          <div
            v-for="task in overdueTasks.slice(0, 3)"
            :key="task.id"
            class="rp-task-item overdue"
          >
            <button
              class="rp-check"
              @click.stop="markTaskComplete(task.id)"
            ></button>
            <span
              class="rp-ico"
              :style="{
                background: careTaskTypeMeta[task.type]?.color + '22',
                color: careTaskTypeMeta[task.type]?.color,
              }"
            >
              {{ careTaskTypeMeta[task.type]?.icon }}
            </span>
            <div class="rp-task-main">
              <div class="rp-task-title">{{ task.title }}</div>
              <div class="rp-task-sub">
                {{ carePlans.find(p => p.id === task.planId)?.outfitName || '' }}
              </div>
            </div>
            <button class="rp-delay-btn" @click.stop="delayTask(task.id, 1)">
              <Clock :size="12" />
              +1
            </button>
          </div>
          <div v-if="overdueTasks.length > 3" class="rp-more-link" @click="$emit('openCenter')">
            还有 {{ overdueTasks.length - 3 }} 项过期...
          </div>
        </div>
      </div>

      <div
        v-for="(dayInfo, dayTs) in tasksByDay"
        :key="dayTs"
        v-show="dayInfo.tasks.length > 0"
        class="rp-day-section"
      >
        <div class="rp-day-header">
          <Calendar :size="14" class="rp-day-icon" />
          <span class="rp-day-label">{{ dayInfo.label }}</span>
          <span class="rp-day-count">{{ dayInfo.tasks.length }}项</span>
        </div>
        <div class="rp-task-list">
          <div
            v-for="task in dayInfo.tasks.slice(0, 4)"
            :key="task.id"
            :class="['rp-task-item', task.status]"
          >
            <button
              class="rp-check"
              @click.stop="markTaskComplete(task.id)"
              v-if="task.status !== 'completed'"
            ></button>
            <Check v-else :size="14" class="rp-check-done" />
            <span
              class="rp-ico"
              :style="{
                background: careTaskTypeMeta[task.type]?.color + '22',
                color: careTaskTypeMeta[task.type]?.color,
              }"
            >
              {{ careTaskTypeMeta[task.type]?.icon }}
            </span>
            <div class="rp-task-main">
              <div class="rp-task-title">{{ task.title }}</div>
              <div class="rp-task-sub">
                {{ carePlans.find(p => p.id === task.planId)?.outfitName || '' }}
              </div>
            </div>
            <div class="rp-task-right">
              <button
                v-if="task.status !== 'completed'"
                class="rp-delay-btn"
                @click.stop="delayTask(task.id, 1)"
              >
                <Clock :size="12" />
                +1
              </button>
            </div>
          </div>
          <div
            v-if="dayInfo.tasks.length > 4"
            class="rp-more-link"
            @click="$emit('openCenter')"
          >
            还有 {{ dayInfo.tasks.length - 4 }} 项...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reminder-panel {
  background: linear-gradient(135deg, #ffffff 0%, #fff8fa 100%);
  border: 1px solid #FFE4EA;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(196, 69, 105, 0.08);
  transition: all 0.2s;
}

.reminder-panel:hover {
  box-shadow: 0 12px 32px rgba(196, 69, 105, 0.12);
}

.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #FFE4EA;
  cursor: pointer;
}

.rp-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rp-title-ico-wrap {
  position: relative;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rp-title-ico {
  color: #fff;
}

.rp-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #FF5252;
  color: #fff;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(255, 82, 82, 0.3);
}

.rp-title {
  font-size: 15px;
  font-weight: 600;
  color: #5D4037;
}

.rp-more {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #C44569;
  font-weight: 500;
}

.rp-empty {
  text-align: center;
  padding: 20px 10px;
}

.rp-empty-ico {
  font-size: 32px;
  margin-bottom: 8px;
}

.rp-empty-text {
  font-size: 13px;
  color: #5D4037;
  font-weight: 500;
  margin-bottom: 4px;
}

.rp-empty-tip {
  font-size: 11px;
  color: #B88899;
}

.rp-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rp-day-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rp-day-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B5A6B;
  font-weight: 500;
}

.rp-day-header.overdue {
  color: #C62828;
}

.rp-day-icon {
  color: #C44569;
}

.overdue-icon {
  color: #E57373;
}

.rp-day-label {
  font-size: 12px;
}

.rp-day-count {
  margin-left: auto;
  padding: 1px 8px;
  background: #FFF0F3;
  color: #C44569;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.rp-task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rp-task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #FFF8FA;
  border: 1px solid #FFE4EA;
  border-radius: 12px;
  transition: all 0.2s;
}

.rp-task-item:hover {
  border-color: #FFB6C1;
  background: #FFF0F3;
}

.rp-task-item.overdue {
  background: #FFF5F5;
  border-color: #EF9A9A;
}

.rp-task-item.delayed {
  background: #FFFBEB;
  border-color: #FFCC80;
}

.rp-task-item.completed {
  opacity: 0.7;
  background: #F5FFF7;
  border-color: #C8E6C9;
}

.rp-check {
  width: 18px;
  height: 18px;
  border: 2px solid #FFB6C1;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  padding: 0;
}

.rp-check:hover {
  border-color: #C44569;
  background: #C44569;
}

.rp-check-done {
  color: #81C784;
  flex-shrink: 0;
}

.rp-ico {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.rp-task-main {
  flex: 1;
  min-width: 0;
}

.rp-task-title {
  font-size: 12px;
  color: #5D4037;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rp-task-sub {
  font-size: 10px;
  color: #B88899;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rp-task-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.rp-delay-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 7px;
  border: 1px solid #FFE4EA;
  border-radius: 8px;
  background: #fff;
  color: #8B5A6B;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.rp-delay-btn:hover {
  color: #FFA726;
  border-color: #FFCC80;
  background: #FFF8E1;
}

.rp-more-link {
  padding: 6px 10px;
  font-size: 11px;
  color: #C44569;
  text-align: center;
  cursor: pointer;
  background: #FFF5F8;
  border-radius: 8px;
  transition: all 0.2s;
}

.rp-more-link:hover {
  background: #FFE4EA;
}

.rp-overdue-section {
  padding-bottom: 8px;
  border-bottom: 1px dashed #FFE4EA;
}
</style>
