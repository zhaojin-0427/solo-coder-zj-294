<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Check, AlertCircle, Lightbulb, Info, Sparkles, User, BookOpen } from 'lucide-vue-next'
import type { Outfit, CareGoal, CareSuggestion, HairCarePlan } from '@/types'
import { hairstyles, bangsOptions } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'
import { useHairCare, generateCareSuggestions, careGoalOptions } from '@/composables/useHairCare'
import { useHairStyle } from '@/composables/useHairStyle'

const props = defineProps<{
  visible: boolean
  outfit: Outfit | null
  editPlan?: HairCarePlan | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', planId: string): void
  (e: 'updated', planId: string): void
}>()

const { createCarePlan, editCarePlanAndRegenTasks } = useHairCare()
const { portfolio, currentAppliedOutfit } = useHairStyle()

const isEditMode = computed(() => !!props.editPlan)

type PlanSource = 'current' | 'portfolio'
const selectedSource = ref<PlanSource>('portfolio')
const selectedPortfolioOutfitId = ref<string>('')

const selectedGoals = ref<CareGoal[]>([])
const washFrequencyDays = ref(3)
const colorRetouchWeeks = ref<number | undefined>(undefined)
const lastColorDateStr = ref('')
const trimBangsDateStr = ref('')
const trimEndsDateStr = ref('')
const note = ref('')
const submitting = ref(false)

const editOutfit = computed<Outfit | null>(() => {
  if (!props.editPlan) return null
  return portfolio.value.find((o) => o.id === props.editPlan!.outfitId) || null
})

const activeOutfit = computed<Outfit | null>(() => {
  if (isEditMode.value) return editOutfit.value
  if (selectedSource.value === 'current') {
    return currentAppliedOutfit.value
  }
  if (selectedSource.value === 'portfolio' && selectedPortfolioOutfitId.value) {
    return portfolio.value.find((o) => o.id === selectedPortfolioOutfitId.value) || null
  }
  return props.outfit
})

const hairstyle = computed(() =>
  activeOutfit.value ? hairstyles.find((h) => h.id === activeOutfit.value!.hairstyleId) : undefined
)
const hairColor = computed(() =>
  activeOutfit.value ? hairColors.find((c) => c.id === activeOutfit.value!.hairColorId) : undefined
)
const bangsName = computed(() =>
  activeOutfit.value ? bangsOptions.find((b) => b.type === activeOutfit.value!.bangsType)?.name : undefined
)

const suggestions = computed<CareSuggestion[]>(() => {
  if (!activeOutfit.value) return []
  return generateCareSuggestions(
    activeOutfit.value.hairColorId,
    hairstyle.value?.length || 'medium',
    activeOutfit.value.bangsType,
    hairstyle.value?.name
  )
})

const isDyedColor = computed(() =>
  activeOutfit.value ? ['rose-red', 'blue-black', 'linen'].includes(activeOutfit.value.hairColorId) : false
)

const hasBangs = computed(() =>
  activeOutfit.value ? activeOutfit.value.bangsType !== 'none' : false
)

const resetDefaultsForOutfit = () => {
  selectedGoals.value = []
  washFrequencyDays.value = 3
  colorRetouchWeeks.value = undefined
  lastColorDateStr.value = ''
  trimBangsDateStr.value = ''
  trimEndsDateStr.value = ''

  if (isDyedColor.value) {
    selectedGoals.value.push('color-fix')
    colorRetouchWeeks.value = 6
  }
  if (hasBangs.value) {
    selectedGoals.value.push('bangs-care')
  }
  if (hairstyle.value?.length === 'long') {
    selectedGoals.value.push('repair-frizz')
  }
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      note.value = ''

      if (isEditMode.value && props.editPlan) {
        const plan = props.editPlan
        selectedSource.value = 'portfolio'
        selectedPortfolioOutfitId.value = plan.outfitId
        selectedGoals.value = [...plan.goals]
        washFrequencyDays.value = plan.washFrequencyDays
        colorRetouchWeeks.value = plan.colorRetouchWeeks
        note.value = plan.note || ''
        lastColorDateStr.value = plan.lastColorDate
          ? new Date(plan.lastColorDate).toISOString().slice(0, 10)
          : ''
        trimBangsDateStr.value = plan.trimBangsDate
          ? new Date(plan.trimBangsDate).toISOString().slice(0, 10)
          : ''
        trimEndsDateStr.value = plan.trimEndsDate
          ? new Date(plan.trimEndsDate).toISOString().slice(0, 10)
          : ''
        return
      }

      if (props.outfit) {
        selectedSource.value = 'portfolio'
        selectedPortfolioOutfitId.value = props.outfit.id
      } else if (currentAppliedOutfit.value) {
        selectedSource.value = 'current'
      } else if (portfolio.value.length > 0) {
        selectedSource.value = 'portfolio'
        selectedPortfolioOutfitId.value = portfolio.value[0].id
      }

      resetDefaultsForOutfit()
    }
  }
)

watch(
  activeOutfit,
  (newOutfit, oldOutfit) => {
    if (!props.visible) return
    if (!newOutfit) return
    if (newOutfit === oldOutfit) return
    if (props.editPlan) return
    resetDefaultsForOutfit()
  }
)

const toTimestamp = (s: string): number | undefined => {
  if (!s) return undefined
  const d = new Date(s)
  if (isNaN(d.getTime())) return undefined
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const toggleGoal = (g: CareGoal) => {
  const idx = selectedGoals.value.indexOf(g)
  if (idx > -1) selectedGoals.value.splice(idx, 1)
  else selectedGoals.value.push(g)
}

const handleSubmit = () => {
  if (!activeOutfit.value) return
  submitting.value = true
  try {
    if (isEditMode.value && props.editPlan) {
      editCarePlanAndRegenTasks(props.editPlan.id, {
        goals: selectedGoals.value,
        washFrequencyDays: washFrequencyDays.value,
        colorRetouchWeeks: selectedGoals.value.includes('color-fix') ? colorRetouchWeeks.value : undefined,
        trimBangsDate: toTimestamp(trimBangsDateStr.value),
        trimEndsDate: toTimestamp(trimEndsDateStr.value),
        note: note.value,
      }, activeOutfit.value)
      emit('updated', props.editPlan.id)
      emit('close')
      return
    }
    const plan = createCarePlan({
      outfit: activeOutfit.value,
      goals: selectedGoals.value,
      washFrequencyDays: washFrequencyDays.value,
      colorRetouchWeeks: selectedGoals.value.includes('color-fix') ? colorRetouchWeeks.value : undefined,
      lastColorDate: toTimestamp(lastColorDateStr.value),
      trimBangsDate: toTimestamp(trimBangsDateStr.value),
      trimEndsDate: toTimestamp(trimEndsDateStr.value),
      note: note.value,
    })
    emit('created', plan.id)
    emit('close')
  } finally {
    submitting.value = false
  }
}

const suggestionIcon = (t: string) => {
  if (t === 'warning') return AlertCircle
  if (t === 'tip') return Lightbulb
  return Info
}
const suggestionColor = (t: string) => {
  if (t === 'warning') return '#E57373'
  if (t === 'tip') return '#FFB74D'
  return '#64B5F6'
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-mask" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title-row">
            <Sparkles :size="20" class="title-icon" />
            <h3 class="modal-title">{{ isEditMode ? '编辑护理计划' : '创建护理计划' }}</h3>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="!isEditMode" class="source-select-section">
            <div class="section-title">
              <Sparkles :size="16" />
              选择方案来源
            </div>
            <div class="source-tabs">
              <button
                :class="['source-tab', { active: selectedSource === 'current', disabled: !currentAppliedOutfit }]"
                :disabled="!currentAppliedOutfit"
                @click="selectedSource = 'current'"
              >
                <User :size="16" />
                <span>当前应用方案</span>
                <span v-if="!currentAppliedOutfit" class="tab-disabled-tip">(未应用)</span>
              </button>
              <button
                :class="['source-tab', { active: selectedSource === 'portfolio', disabled: portfolio.length === 0 }]"
                :disabled="portfolio.length === 0"
                @click="selectedSource = 'portfolio'"
              >
                <BookOpen :size="16" />
                <span>作品集方案</span>
              </button>
            </div>

            <div v-if="selectedSource === 'portfolio' && portfolio.length > 0" class="portfolio-picker">
              <select
                v-model="selectedPortfolioOutfitId"
                class="portfolio-select"
              >
                <option
                  v-for="outfit in portfolio"
                  :key="outfit.id"
                  :value="outfit.id"
                >
                  {{ outfit.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="activeOutfit" class="outfit-ref-card">
            <div class="ref-title">关联方案</div>
            <div class="ref-name">{{ activeOutfit.name }}</div>
            <div class="ref-meta">
              <span>{{ hairstyle?.name || '未知发型' }}</span>
              <span>·</span>
              <span>{{ hairColor?.name || '未知发色' }}</span>
              <span>·</span>
              <span>{{ bangsName || '无刘海' }}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              <Lightbulb :size="16" />
              智能护理建议
            </div>
            <div class="suggestion-list">
              <div
                v-for="(s, i) in suggestions"
                :key="i"
                class="suggestion-item"
                :style="{ borderLeftColor: suggestionColor(s.type) }"
              >
                <component
                  :is="suggestionIcon(s.type)"
                  :size="16"
                  :style="{ color: suggestionColor(s.type) }"
                  class="s-icon"
                />
                <div class="s-content">
                  <div class="s-title">{{ s.title }}</div>
                  <div class="s-desc">{{ s.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              <Check :size="16" />
              选择护理目标（可多选）
            </div>
            <div class="goal-grid">
              <div
                v-for="g in careGoalOptions"
                :key="g.key"
                :class="['goal-card', { selected: selectedGoals.includes(g.key) }]"
                @click="toggleGoal(g.key)"
              >
                <div class="goal-icon">{{ g.icon }}</div>
                <div class="goal-name">{{ g.name }}</div>
                <div class="goal-desc">{{ g.desc }}</div>
                <div v-if="selectedGoals.includes(g.key)" class="goal-check">
                  <Check :size="14" />
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">洗护频率</div>
            <div class="frequency-row">
              <label class="freq-label">每</label>
              <input
                type="number"
                v-model.number="washFrequencyDays"
                min="1"
                max="14"
                class="freq-input"
              />
              <label class="freq-label">天洗一次头</label>
            </div>
            <div class="freq-presets">
              <button
                v-for="n in [2, 3, 4, 5, 7]"
                :key="n"
                :class="['freq-chip', { active: washFrequencyDays === n }]"
                @click="washFrequencyDays = n"
              >
                每{{ n }}天
              </button>
            </div>
          </div>

          <div
            v-if="selectedGoals.includes('color-fix')"
            class="section"
          >
            <div class="section-title">染发补色周期</div>
            <div class="frequency-row">
              <label class="freq-label">每</label>
              <select
                v-model.number="colorRetouchWeeks"
                class="freq-select"
              >
                <option :value="4">4</option>
                <option :value="5">5</option>
                <option :value="6">6</option>
                <option :value="7">7</option>
                <option :value="8">8</option>
                <option :value="10">10</option>
                <option :value="12">12</option>
              </select>
              <label class="freq-label">周补色一次</label>
            </div>
            <div class="date-row">
              <label class="date-label">上次染发日期（可选）</label>
              <input
                type="date"
                v-model="lastColorDateStr"
                class="date-input"
              />
            </div>
          </div>

          <div v-if="activeOutfit && hasBangs" class="section">
            <div class="section-title">修剪提醒日期</div>
            <div class="date-row">
              <label class="date-label">下次修剪刘海</label>
              <input
                type="date"
                v-model="trimBangsDateStr"
                class="date-input"
              />
            </div>
          </div>

          <div v-if="!activeOutfit" class="empty-selection">
            <div class="empty-icon">💇</div>
            <div class="empty-title">请先选择一个方案</div>
            <div class="empty-desc">从上方选择「当前应用方案」或「作品集方案」来创建护理计划</div>
          </div>

          <div class="section">
            <div class="section-title">发尾修剪提醒</div>
            <div class="date-row">
              <label class="date-label">下次修剪发尾</label>
              <input
                type="date"
                v-model="trimEndsDateStr"
                class="date-input"
              />
            </div>
          </div>

          <div class="section">
            <div class="section-title">备注（可选）</div>
            <textarea
              v-model="note"
              rows="3"
              class="note-textarea"
              placeholder="记录产品偏好、理发店、造型师信息等"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button
            class="btn-primary"
            :disabled="submitting || !activeOutfit"
            @click="handleSubmit"
          >
            <Check :size="16" />
            {{ submitting ? (isEditMode ? '保存中...' : '创建中...') : (isEditMode ? '保存修改' : '创建护理计划') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(93, 64, 55, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(196, 69, 105, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #FFF5F8, #FCE4EC);
  border-bottom: 1px solid #FFE4EA;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #C44569;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #C44569;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fff;
  border-radius: 50%;
  color: #8B5A6B;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #FFB6C1;
  color: #fff;
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.outfit-ref-card {
  padding: 14px 16px;
  background: linear-gradient(135deg, #FEF3F7, #FFF0F3);
  border: 1px solid #FFE4EA;
  border-radius: 14px;
  margin-bottom: 20px;
}

.ref-title {
  font-size: 11px;
  color: #B88899;
  margin-bottom: 4px;
}

.ref-name {
  font-size: 16px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 4px;
}

.ref-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B5A6B;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 12px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: #FFF8FA;
  border: 1px solid #FFE4EA;
  border-left-width: 4px;
  border-radius: 10px;
}

.s-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.s-content {
  flex: 1;
  min-width: 0;
}

.s-title {
  font-size: 13px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 2px;
}

.s-desc {
  font-size: 12px;
  color: #8B5A6B;
  line-height: 1.5;
}

.goal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.goal-card {
  position: relative;
  padding: 14px 12px;
  background: #fff;
  border: 2px solid #FFE4EA;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.goal-card:hover {
  border-color: #FFB6C1;
  background: #FFF8FA;
}

.goal-card.selected {
  border-color: #C44569;
  background: linear-gradient(135deg, #FFF0F3, #FFE4EA);
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.15);
}

.goal-icon {
  font-size: 22px;
  margin-bottom: 6px;
}

.goal-name {
  font-size: 14px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 4px;
}

.goal-desc {
  font-size: 11px;
  color: #8B5A6B;
  line-height: 1.4;
}

.goal-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  background: #C44569;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frequency-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.freq-label {
  font-size: 14px;
  color: #5D4037;
}

.freq-input {
  width: 70px;
  padding: 8px 10px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #FFF8FA;
  color: #5D4037;
  font-size: 14px;
  text-align: center;
  outline: none;
}

.freq-input:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.1);
}

.freq-select {
  padding: 8px 12px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #FFF8FA;
  color: #5D4037;
  font-size: 14px;
  outline: none;
}

.freq-select:focus {
  border-color: #C44569;
}

.freq-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.freq-chip {
  padding: 6px 14px;
  border: 1px solid #FFB6C1;
  border-radius: 20px;
  background: #fff;
  color: #8B5A6B;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.freq-chip:hover {
  background: #FFF0F3;
}

.freq-chip.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.date-label {
  font-size: 13px;
  color: #5D4037;
  flex-shrink: 0;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #FFF8FA;
  color: #5D4037;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}

.date-input:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.1);
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #FFB6C1;
  border-radius: 12px;
  background: #FFF8FA;
  color: #5D4037;
  font-size: 13px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.note-textarea:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #FFE4EA;
  background: #FFF8FA;
}

.btn-cancel {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #FFB6C1;
  border-radius: 12px;
  background: #fff;
  color: #8B5A6B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #FFF0F3;
}

.btn-primary {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(196, 69, 105, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.source-select-section {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #FFF5F8, #FFF8FA);
  border: 1px solid #FFE4EA;
  border-radius: 14px;
}

.source-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.source-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border: 2px solid #FFE4EA;
  border-radius: 12px;
  background: #fff;
  color: #8B5A6B;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.source-tab:hover:not(.disabled) {
  border-color: #FFB6C1;
  background: #FFF0F3;
}

.source-tab.active {
  border-color: #C44569;
  background: linear-gradient(135deg, #FFF0F3, #FFE4EA);
  color: #C44569;
  box-shadow: 0 2px 8px rgba(196, 69, 105, 0.15);
}

.source-tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-disabled-tip {
  font-size: 11px;
  color: #B88899;
}

.portfolio-picker {
  margin-top: 8px;
}

.portfolio-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #fff;
  color: #5D4037;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.portfolio-select:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.1);
}

.empty-selection {
  text-align: center;
  padding: 40px 20px;
  background: #FFF8FA;
  border: 1px dashed #FFB6C1;
  border-radius: 14px;
  margin-top: 20px;
}

.empty-selection .empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.empty-selection .empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 6px;
}

.empty-selection .empty-desc {
  font-size: 12px;
  color: #8B5A6B;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .goal-grid {
    grid-template-columns: 1fr;
  }

  .source-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
