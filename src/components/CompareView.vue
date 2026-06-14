<script setup lang="ts">
import { ref } from 'vue'
import { X, Eye, Star, Tag, Clock, FileText, User, Scissors, Palette, ArrowLeft } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import { hairstyles, bangsOptions } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'
import { faceShapes } from '@/data/faceShapes'
import type { Outfit, OccasionTag } from '@/types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', outfit: Outfit): void
}>()

const {
  selectedForCompareOutfits,
  setShowCompareView,
  loadOutfit,
} = useHairStyle()

const occasionOptions: { key: OccasionTag | 'all'; name: string }[] = [
  { key: 'all', name: '全部' },
  { key: 'work', name: '职场' },
  { key: 'date', name: '约会' },
  { key: 'vacation', name: '度假' },
]

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getHairstyleName = (id: string) => {
  return hairstyles.find((h) => h.id === id)?.name || '未知发型'
}

const getHairColorName = (id: string) => {
  return hairColors.find((c) => c.id === id)?.name || '未知颜色'
}

const getBangsName = (type: string) => {
  return bangsOptions.find((b) => b.type === type)?.name || '未知刘海'
}

const getFaceShapeName = (type: string) => {
  return faceShapes.find((f) => f.type === type)?.name || '未知脸型'
}

const getOccasionName = (tag: OccasionTag) => {
  return occasionOptions.find((o) => o.key === tag)?.name || tag
}

const handleApply = (outfit: Outfit) => {
  loadOutfit(outfit)
  emit('apply', outfit)
  handleClose()
}

const handleClose = () => {
  setShowCompareView(false)
  emit('close')
}

defineExpose({
  outfits: selectedForCompareOutfits,
})
</script>

<template>
  <div class="compare-overlay" @click.self="handleClose">
    <div class="compare-container">
      <div class="compare-header">
        <button class="back-btn" @click="handleClose">
          <ArrowLeft :size="18" />
          返回
        </button>
        <h2 class="compare-title">试戴方案对比与复盘中心</h2>
        <button class="close-btn" @click="handleClose">
          <X :size="22" />
        </button>
      </div>

      <div class="compare-body">
        <div class="compare-grid" :class="{ 'two-col': selectedForCompareOutfits.length === 2, 'three-col': selectedForCompareOutfits.length === 3 }">
          <div
            v-for="(outfit, index) in selectedForCompareOutfits"
            :key="outfit.id"
            class="compare-card"
          >
            <div class="card-badge">方案 {{ index + 1 }}</div>

            <div class="card-preview">
              <img v-if="outfit.previewImage" :src="outfit.previewImage" class="preview-img" alt="搭配预览" />
              <svg v-else viewBox="0 0 260 320" class="preview-svg">
                <defs>
                  <linearGradient :id="'compare-grad-' + outfit.id" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="hairColors.find(c => c.id === outfit.hairColorId)?.secondaryColor || '#8B7355'" />
                    <stop offset="100%" :stop-color="hairColors.find(c => c.id === outfit.hairColorId)?.primaryColor || '#5D4E37'" />
                  </linearGradient>
                </defs>
                <rect width="260" height="320" fill="#FEF3F7" />
                <ellipse cx="130" cy="170" rx="70" ry="95" fill="#FFE0C2" />
                <path
                  :d="hairstyles.find(h => h.id === outfit.hairstyleId)?.svgPath || ''"
                  :fill="'url(#compare-grad-' + outfit.id + ')'"
                  transform="scale(1.15) translate(8, 15)"
                />
              </svg>
            </div>

            <div class="card-content">
              <div class="card-title-row">
                <h3 class="card-name">{{ outfit.name }}</h3>
                <div v-if="outfit.rating" class="card-rating">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :size="14"
                    :fill="i <= outfit.rating ? '#FFD54F' : 'none'"
                    :class="['rating-icon', { filled: i <= outfit.rating }]"
                  />
                </div>
              </div>

              <div class="info-list">
                <div class="info-item">
                  <div class="info-icon">
                    <User :size="14" />
                  </div>
                  <span class="info-label">脸型</span>
                  <span class="info-value">{{ getFaceShapeName(outfit.faceShapeType) }}</span>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <Scissors :size="14" />
                  </div>
                  <span class="info-label">发型</span>
                  <span class="info-value">{{ getHairstyleName(outfit.hairstyleId) }}</span>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <Scissors :size="14" />
                  </div>
                  <span class="info-label">刘海</span>
                  <span class="info-value">{{ getBangsName(outfit.bangsType) }}</span>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <Palette :size="14" />
                  </div>
                  <span class="info-label">发色</span>
                  <span class="info-value">{{ getHairColorName(outfit.hairColorId) }}</span>
                </div>
              </div>

              <div class="tags-section">
                <div class="tags-label">
                  <Tag :size="12" />
                  场合标签
                </div>
                <div class="tags-list">
                  <span v-for="tag in outfit.occasionTags" :key="tag" class="tag-chip">
                    {{ getOccasionName(tag) }}
                  </span>
                  <span v-if="outfit.occasionTags.length === 0" class="no-tags">无</span>
                </div>
              </div>

              <div class="meta-row">
                <div class="meta-item">
                  <Clock :size="12" />
                  {{ formatDate(outfit.createdAt) }}
                </div>
              </div>

              <div v-if="outfit.note" class="note-section">
                <div class="note-label">
                  <FileText :size="12" />
                  备注 / 适合理由
                </div>
                <p class="note-text">{{ outfit.note }}</p>
              </div>
            </div>

            <div class="card-footer">
              <button class="apply-btn" @click="handleApply(outfit)">
                <Eye :size="16" />
                一键应用此方案
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

.compare-container {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 1400px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid #FFE4EA;
  background: linear-gradient(135deg, #FFF5F8, #FCE4EC);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #FFB6C1;
  border-radius: 14px;
  background: #fff;
  color: #C44569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #FFF0F3;
}

.compare-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #C44569;
  font-family: 'Playfair Display', serif;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #C44569;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #FFB6C1;
  color: #fff;
  transform: rotate(90deg);
}

.compare-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.compare-grid {
  display: grid;
  gap: 24px;
}

.compare-grid.two-col {
  grid-template-columns: repeat(2, 1fr);
}

.compare-grid.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.compare-card {
  position: relative;
  background: #fff;
  border: 2px solid #FFE4EA;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.compare-card:hover {
  border-color: #FFB6C1;
  box-shadow: 0 8px 24px rgba(196, 69, 105, 0.12);
  transform: translateY(-4px);
}

.card-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.3);
}

.card-preview {
  aspect-ratio: 260 / 320;
  background: linear-gradient(180deg, #FEF3F7 0%, #FCE4EC 100%);
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-svg {
  width: 100%;
  height: 100%;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.card-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #5D4037;
}

.card-rating {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.rating-icon {
  color: #FFD54F;
}

.rating-icon:not(.filled) {
  color: #FFE4EA;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #FFF5F8;
  padding: 12px;
  border-radius: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #fff;
  color: #C44569;
  flex-shrink: 0;
}

.info-label {
  color: #8B5A6B;
  min-width: 36px;
}

.info-value {
  color: #5D4037;
  font-weight: 500;
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8B5A6B;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  padding: 4px 10px;
  background: #FFF0F3;
  color: #C44569;
  border-radius: 8px;
  font-size: 12px;
}

.no-tags {
  color: #B88899;
  font-size: 12px;
}

.meta-row {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #B88899;
}

.note-section {
  background: #FEF3F7;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.note-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B5A6B;
  font-weight: 500;
}

.note-text {
  margin: 0;
  font-size: 13px;
  color: #5D4037;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid #FFE4EA;
}

.apply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.25);
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(196, 69, 105, 0.35);
}

.apply-btn:active {
  transform: translateY(0);
}

@media (max-width: 900px) {
  .compare-overlay {
    padding: 0;
  }

  .compare-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .compare-header {
    padding: 16px;
  }

  .compare-title {
    font-size: 16px;
  }

  .compare-body {
    padding: 16px;
  }

  .compare-grid.two-col,
  .compare-grid.three-col {
    grid-template-columns: 1fr;
  }

  .card-content {
    padding: 16px;
  }

  .card-name {
    font-size: 16px;
  }
}
</style>
