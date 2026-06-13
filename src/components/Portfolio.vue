<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, Trash2, Eye, Tag, Briefcase, Heart, Plane } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import { hairstyles } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'
import type { OccasionTag, Outfit } from '@/types'

const {
  filteredPortfolio,
  currentFilter,
  setFilter,
  deleteFromPortfolio,
  loadOutfit,
  selectedHairstyle,
  selectedHairColor,
  selectedFaceShape,
} = useHairStyle()

const occasionOptions: { key: OccasionTag | 'all'; name: string; icon: any }[] = [
  { key: 'all', name: '全部', icon: BookOpen },
  { key: 'work', name: '职场', icon: Briefcase },
  { key: 'date', name: '约会', icon: Heart },
  { key: 'vacation', name: '度假', icon: Plane },
]

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getHairstyleName = (id: string) => {
  return hairstyles.find((h) => h.id === id)?.name || '未知发型'
}

const getHairColorName = (id: string) => {
  return hairColors.find((c) => c.id === id)?.name || '未知颜色'
}

const handleDelete = (id: string) => {
  if (confirm('确定要删除这个搭配吗？')) {
    deleteFromPortfolio(id)
  }
}

const handleLoad = (outfit: Outfit) => {
  loadOutfit(outfit)
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

    <div class="portfolio-list">
      <div v-if="filteredPortfolio.length === 0" class="empty-state">
        <div class="empty-icon">💇</div>
        <p class="empty-text">还没有保存的搭配</p>
        <p class="empty-tip">试试不同发型，保存喜欢的搭配吧</p>
      </div>

      <div
        v-for="outfit in filteredPortfolio"
        :key="outfit.id"
        class="outfit-card"
      >
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
          <h4 class="outfit-name">{{ outfit.name }}</h4>
          <div class="outfit-detail">
            <span class="detail-item">{{ getHairstyleName(outfit.hairstyleId) }}</span>
            <span class="detail-dot">·</span>
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

.occasion-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
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

.outfit-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #5D4037;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outfit-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
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
