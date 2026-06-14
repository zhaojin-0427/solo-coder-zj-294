<script setup lang="ts">
import { ref, computed } from 'vue'
import { Save, Download, Printer, X, Tag, Star, FileText, ChevronDown } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import type { OccasionTag, Rating } from '@/types'

const emit = defineEmits<{
  (e: 'save', data: { name: string; tags: OccasionTag[]; note?: string; rating?: Rating }): void
  (e: 'export', mode: 'current' | 'compare'): void
  (e: 'print'): void
}>()

const { selectedHairstyle, selectedForCompareOutfits } = useHairStyle()

const showSaveModal = ref(false)
const showExportMenu = ref(false)
const outfitName = ref('')
const selectedTags = ref<OccasionTag[]>([])
const outfitNote = ref('')
const outfitRating = ref<Rating | null>(null)

const occasionOptions: { key: OccasionTag; name: string; color: string }[] = [
  { key: 'work', name: '职场', color: '#4A90D9' },
  { key: 'date', name: '约会', color: '#FF6B9D' },
  { key: 'vacation', name: '度假', color: '#66BB6A' },
]

const canExportCompare = computed(() => selectedForCompareOutfits.value.length >= 2)

const openSaveModal = () => {
  outfitName.value = selectedHairstyle.value?.name || '我的搭配'
  selectedTags.value = []
  outfitNote.value = ''
  outfitRating.value = null
  showSaveModal.value = true
}

const toggleTag = (tag: OccasionTag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const setRating = (rating: Rating) => {
  outfitRating.value = outfitRating.value === rating ? null : rating
}

const confirmSave = () => {
  if (!outfitName.value.trim()) {
    alert('请输入搭配名称')
    return
  }
  emit('save', {
    name: outfitName.value,
    tags: selectedTags.value,
    note: outfitNote.value || undefined,
    rating: outfitRating.value || undefined,
  })
  showSaveModal.value = false
}

const handleExport = (mode: 'current' | 'compare') => {
  showExportMenu.value = false
  emit('export', mode)
}

const handlePrint = () => {
  emit('print')
}
</script>

<template>
  <div class="toolbar">
    <button class="tool-btn primary" @click="openSaveModal">
      <Save :size="18" />
      保存搭配
    </button>
    <div class="export-wrapper">
      <button class="tool-btn secondary" @click="showExportMenu = !showExportMenu">
        <Download :size="18" />
        导出图片
        <ChevronDown :size="14" />
      </button>
      <div v-if="showExportMenu" class="export-menu">
        <button class="export-item" @click="handleExport('current')">
          <FileText :size="14" />
          导出当前方案
        </button>
        <button
          class="export-item"
          :class="{ disabled: !canExportCompare }"
          :disabled="!canExportCompare"
          @click="canExportCompare && handleExport('compare')"
        >
          <FileText :size="14" />
          导出对比卡
          <span v-if="!canExportCompare" class="export-hint">(需选2-3个方案)</span>
        </button>
      </div>
    </div>
    <button class="tool-btn secondary" @click="handlePrint">
      <Printer :size="18" />
      打印参考卡
    </button>

    <div v-if="showSaveModal" class="modal-overlay" @click.self="showSaveModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">保存到作品集</h3>
          <button class="close-btn" @click="showSaveModal = false">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">搭配名称</label>
            <input
              v-model="outfitName"
              type="text"
              class="form-input"
              placeholder="给这个搭配起个名字"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <Tag :size="14" />
              场合标签
            </label>
            <div class="tag-options">
              <button
                v-for="option in occasionOptions"
                :key="option.key"
                :class="['tag-btn', { selected: selectedTags.includes(option.key) }]"
                :style="{ '--tag-color': option.color }"
                @click="toggleTag(option.key)"
              >
                {{ option.name }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <Star :size="14" />
              评分
            </label>
            <div class="rating-options">
              <button
                v-for="i in 5"
                :key="i"
                :class="['rating-star', { active: outfitRating && outfitRating >= i }]"
                @click="setRating(i as Rating)"
              >
                <Star :size="24" :fill="outfitRating && outfitRating >= i ? 'currentColor' : 'none'" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <FileText :size="14" />
              备注 / 适合理由
            </label>
            <textarea
              v-model="outfitNote"
              class="form-textarea"
              placeholder="记录这个搭配的灵感来源、适合的理由等..."
              rows="3"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showSaveModal = false">取消</button>
          <button class="confirm-btn" @click="confirmSave">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.tool-btn.primary {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  box-shadow: 0 6px 20px rgba(196, 69, 105, 0.35);
}

.tool-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(196, 69, 105, 0.45);
}

.tool-btn.secondary {
  background: #fff;
  color: #C44569;
  border: 1px solid #FFB6C1;
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.1);
}

.tool-btn.secondary:hover {
  background: #FFF0F3;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #FFE4EA;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #C44569;
  font-family: 'Playfair Display', serif;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #FFF0F3;
  color: #C44569;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #FFB6C1;
  color: #fff;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #5D4037;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #FFB6C1;
  border-radius: 12px;
  font-size: 14px;
  color: #5D4037;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.15);
}

.form-input::placeholder {
  color: #B88899;
}

.tag-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 2px solid #FFE4EA;
  border-radius: 20px;
  background: #fff;
  color: #8B5A6B;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-btn:hover {
  border-color: var(--tag-color, #FFB6C1);
}

.tag-btn.selected {
  background: var(--tag-color, #FF6B9D);
  color: #fff;
  border-color: var(--tag-color, #FF6B9D);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #FFE4EA;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #FFB6C1;
  border-radius: 14px;
  background: #fff;
  color: #C44569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #FFF0F3;
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(196, 69, 105, 0.35);
}

.export-wrapper {
  position: relative;
}

.export-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(196, 69, 105, 0.2);
  padding: 8px;
  z-index: 100;
  border: 1px solid #FFE4EA;
}

.export-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #5D4037;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.export-item:hover:not(.disabled) {
  background: #FFF0F3;
  color: #C44569;
}

.export-item.disabled {
  color: #B88899;
  cursor: not-allowed;
  opacity: 0.6;
}

.export-hint {
  margin-left: auto;
  font-size: 11px;
  color: #B88899;
}

.rating-options {
  display: flex;
  gap: 8px;
}

.rating-star {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background: transparent;
  color: #FFB6C1;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.rating-star:hover {
  color: #FFD54F;
  transform: scale(1.1);
}

.rating-star.active {
  color: #FFD54F;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #FFB6C1;
  border-radius: 12px;
  font-size: 14px;
  color: #5D4037;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  min-height: 80px;
}

.form-textarea:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.15);
}

.form-textarea::placeholder {
  color: #B88899;
}
</style>
