<script setup lang="ts">
import { ref, computed } from 'vue'
import { BookOpen, Trash2, Eye, Tag, Briefcase, Heart, Plane, Star, SortAsc, SortDesc, Check, X, GitCompare } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import { hairstyles, bangsOptions } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'
import { faceShapes } from '@/data/faceShapes'
import type { OccasionTag, Outfit, Rating, SortType } from '@/types'

const {
  filteredPortfolio,
  currentFilter,
  currentRatingFilter,
  currentSort,
  setFilter,
  setRatingFilter,
  setSort,
  deleteFromPortfolio,
  loadOutfit,
  selectedForCompare,
  toggleCompareSelect,
  clearCompareSelection,
  setShowCompareView,
  selectedForCompareOutfits,
} = useHairStyle()

const occasionOptions: { key: OccasionTag | 'all'; name: string; icon: any }[] = [
  { key: 'all', name: '全部', icon: BookOpen },
  { key: 'work', name: '职场', icon: Briefcase },
  { key: 'date', name: '约会', icon: Heart },
  { key: 'vacation', name: '度假', icon: Plane },
]

const ratingOptions: (Rating | 'all')[] = ['all', 5, 4, 3, 2, 1]

const sortOptions: { key: SortType; name: string; icon: any }[] = [
  { key: 'time-desc', name: '最新', icon: SortDesc },
  { key: 'time-asc', name: '最早', icon: SortAsc },
  { key: 'rating-desc', name: '评分高→低', icon: SortDesc },
  { key: 'rating-asc', name: '评分低→高', icon: SortAsc },
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

const handleDelete = (id: string) => {
  if (confirm('确定要删除这个搭配吗？')) {
    deleteFromPortfolio(id)
  }
}

const handleLoad = (outfit: Outfit) => {
  loadOutfit(outfit)
}

const handleToggleCompare = (id: string) => {
  toggleCompareSelect(id)
}

const openCompareView = () => {
  if (selectedForCompareOutfits.value.length >= 2) {
    setShowCompareView(true)
  }
}

const isSelectedForCompare = (id: string) => {
  return selectedForCompare.value.includes(id)
}

const renderStars = (rating?: Rating) => {
  if (!rating) return ''
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

const canStartCompare = computed(() => selectedForCompareOutfits.value.length >= 2)

const handleRatingChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  if (value === 'all') {
    setRatingFilter('all')
  } else {
    setRatingFilter(Number(value) as Rating)
  }
}
</script>

<template>
  <div class="portfolio">
    <div class="portfolio-header">
      <h3 class="portfolio-title">
        <BookOpen :size="20" />
        我的作品集
      </h3>
      <span class="count-badge">{{ filteredPortfolio.length }}</span>
    </div>

    <div v-if="selectedForCompare.length > 0" class="compare-bar">
      <span class="compare-count">
        <GitCompare :size="14" />
        已选 {{ selectedForCompare.length }}/3
      </span>
      <button
        class="compare-btn"
        :class="{ active: canStartCompare }"
        :disabled="!canStartCompare"
        @click="openCompareView"
      >
        开始对比
      </button>
      <button class="clear-compare-btn" @click="clearCompareSelection">
        <X :size="14" />
        清空
      </button>
    </div>

    <div class="filter-section">
      <div class="occasion-tabs">
        <button
          v-for="option in occasionOptions"
          :key="option.key"
          :class="['occasion-btn', { active: currentFilter === option.key }]"
          @click="setFilter(option.key)"
        >
          <component :is="option.icon" :size="14" />
          {{ option.name }}
        </button>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">评分：</span>
          <select
            :value="String(currentRatingFilter)"
            class="filter-select"
            @change="handleRatingChange"
          >
            <option v-for="r in ratingOptions" :key="r" :value="String(r)">
              {{ r === 'all' ? '全部' : renderStars(r as Rating) }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">排序：</span>
          <select
            :value="currentSort"
            class="filter-select"
            @change="(e) => setSort((e.target as HTMLSelectElement).value as SortType)"
          >
            <option v-for="s in sortOptions" :key="s.key" :value="s.key">
              {{ s.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="portfolio-list">
      <div v-if="filteredPortfolio.length === 0" class="empty-state">
        <div class="empty-icon">💇</div>
        <p class="empty-text">还没有保存的搭配</p>
        <p class="empty-tip">试试不同发型，保存喜欢的搭配吧</p>
      </div>

      <div
        v-for="outfit in filteredPortfolio"
        :key="outfit.id"
        :class="['outfit-card', { selected: isSelectedForCompare(outfit.id) }]"
      >
        <button
          class="compare-checkbox"
          :class="{ checked: isSelectedForCompare(outfit.id) }"
          @click="handleToggleCompare(outfit.id)"
          :title="isSelectedForCompare(outfit.id) ? '取消对比' : '加入对比'"
        >
          <Check v-if="isSelectedForCompare(outfit.id)" :size="14" />
        </button>

        <div class="outfit-thumb">
          <img v-if="outfit.previewImage" :src="outfit.previewImage" class="thumb-img" alt="搭配预览" />
          <svg v-else viewBox="0 0 260 320" class="thumb-svg">
            <defs>
              <linearGradient :id="'thumb-grad-' + outfit.id" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="hairColors.find(c => c.id === outfit.hairColorId)?.secondaryColor || '#8B7355'" />
                <stop offset="100%" :stop-color="hairColors.find(c => c.id === outfit.hairColorId)?.primaryColor || '#5D4E37'" />
              </linearGradient>
            </defs>
            <ellipse cx="130" cy="150" rx="70" ry="90" fill="#FFE0C2" />
            <path
              :d="hairstyles.find(h => h.id === outfit.hairstyleId)?.svgPath || ''"
              :fill="'url(#thumb-grad-' + outfit.id + ')'"
              transform="scale(1.1) translate(10, 5)"
            />
          </svg>
        </div>

        <div class="outfit-info">
          <div class="outfit-header">
            <h4 class="outfit-name">{{ outfit.name }}</h4>
            <div v-if="outfit.rating" class="outfit-rating">
              <Star v-for="i in 5" :key="i" :size="12" :fill="i <= outfit.rating! ? '#FFD54F' : 'none'" :class="['rating-star-icon', { filled: i <= outfit.rating! }]" />
            </div>
          </div>
          <div class="outfit-detail">
            <span class="detail-item">{{ getFaceShapeName(outfit.faceShapeType) }}</span>
            <span class="detail-dot">·</span>
            <span class="detail-item">{{ getHairstyleName(outfit.hairstyleId) }}</span>
            <span class="detail-dot">·</span>
            <span class="detail-item">{{ getBangsName(outfit.bangsType) }}</span>
          </div>
          <div class="outfit-detail">
            <span class="detail-item">{{ getHairColorName(outfit.hairColorId) }}</span>
          </div>
          <div class="outfit-tags">
            <span
              v-for="tag in outfit.occasionTags"
              :key="tag"
              class="tag-chip"
            >
              <Tag :size="10" />
              {{ occasionOptions.find(o => o.key === tag)?.name }}
            </span>
          </div>
          <p v-if="outfit.note" class="outfit-note">{{ outfit.note }}</p>
          <div class="outfit-date">{{ formatDate(outfit.createdAt) }}</div>
        </div>

        <div class="outfit-actions">
          <button class="action-btn view-btn" @click="handleLoad(outfit)" title="应用此搭配">
            <Eye :size="16" />
          </button>
          <button class="action-btn delete-btn" @click="handleDelete(outfit.id)" title="删除">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portfolio {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(196, 69, 105, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.portfolio-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #C44569;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.count-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.compare-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #FFF5F8, #FCE4EC);
  border-radius: 14px;
  margin-bottom: 14px;
  border: 1px solid #FFB6C1;
}

.compare-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #C44569;
  font-weight: 500;
}

.compare-btn {
  padding: 6px 16px;
  border: 1px solid #C44569;
  border-radius: 12px;
  background: #fff;
  color: #C44569;
  font-size: 12px;
  cursor: not-allowed;
  transition: all 0.3s;
  opacity: 0.5;
}

.compare-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
  cursor: pointer;
  opacity: 1;
}

.compare-btn.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.3);
}

.clear-compare-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #fff;
  color: #8B5A6B;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: auto;
}

.clear-compare-btn:hover {
  background: #FFF0F3;
  color: #C44569;
}

.filter-section {
  margin-bottom: 16px;
}

.occasion-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.occasion-tabs::-webkit-scrollbar {
  height: 3px;
}

.occasion-tabs::-webkit-scrollbar-thumb {
  background: #FFB6C1;
  border-radius: 2px;
}

.occasion-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #FFB6C1;
  border-radius: 14px;
  background: #fff;
  color: #C44569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.occasion-btn:hover {
  background: #FFF0F3;
}

.occasion-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  color: #8B5A6B;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #FFB6C1;
  border-radius: 10px;
  background: #fff;
  color: #5D4037;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s;
}

.filter-select:focus {
  border-color: #C44569;
  box-shadow: 0 0 0 2px rgba(196, 69, 105, 0.15);
}

.portfolio-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.portfolio-list::-webkit-scrollbar {
  width: 4px;
}

.portfolio-list::-webkit-scrollbar-track {
  background: #FFF0F3;
  border-radius: 2px;
}

.portfolio-list::-webkit-scrollbar-thumb {
  background: #FFB6C1;
  border-radius: 2px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #5D4037;
  font-weight: 500;
}

.empty-tip {
  margin: 0;
  font-size: 12px;
  color: #9E7A85;
}

.outfit-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #FFE4EA;
  border-radius: 16px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.outfit-card:hover {
  border-color: #FFB6C1;
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.1);
}

.outfit-card.selected {
  border-color: #C44569;
  background: #FFF5F8;
  box-shadow: 0 0 0 2px rgba(196, 69, 105, 0.15);
}

.compare-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFB6C1;
  border-radius: 6px;
  background: #fff;
  color: transparent;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
  padding: 0;
}

.compare-checkbox:hover {
  border-color: #C44569;
}

.compare-checkbox.checked {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  border-color: transparent;
  color: #fff;
}

.outfit-thumb {
  width: 80px;
  height: 96px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #FEF3F7 0%, #FCE4EC 100%);
  flex-shrink: 0;
}

.thumb-svg {
  width: 100%;
  height: 100%;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.outfit-info {
  flex: 1;
  min-width: 0;
}

.outfit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.outfit-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #5D4037;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outfit-rating {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.rating-star-icon {
  color: #FFD54F;
}

.rating-star-icon:not(.filled) {
  color: #FFE4EA;
}

.outfit-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 11px;
  color: #8B5A6B;
}

.detail-item {
  white-space: nowrap;
}

.detail-dot {
  color: #FFB6C1;
}

.outfit-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #FFF0F3;
  color: #C44569;
  border-radius: 8px;
  font-size: 10px;
}

.outfit-note {
  margin: 4px 0;
  font-size: 11px;
  color: #6B4452;
  line-height: 1.4;
  padding: 6px 8px;
  background: #FEF3F7;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.outfit-date {
  font-size: 11px;
  color: #B88899;
}

.outfit-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.view-btn {
  background: #FFF0F3;
  color: #C44569;
}

.action-btn.view-btn:hover {
  background: #FFB6C1;
  color: #fff;
}

.action-btn.delete-btn {
  background: #FFF0F3;
  color: #E57373;
}

.action-btn.delete-btn:hover {
  background: #E57373;
  color: #fff;
}
</style>
