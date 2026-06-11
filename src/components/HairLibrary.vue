<script setup lang="ts">
import { ref, computed } from 'vue'
import { Scissors, Star } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import { getHairstylesByLength, bangsOptions } from '@/data/hairstyles'
import type { HairLength, BangsType, Hairstyle } from '@/types'

const {
  selectedHairstyle,
  selectedHairColor,
  selectedBangs,
  selectedFaceShape,
  setHairstyle,
  setBangs,
  recommendedHairstyles,
} = useHairStyle()

const activeLength = ref<HairLength>('medium')
const showRecommended = ref(false)

const lengthTabs = [
  { key: 'short' as HairLength, name: '短发' },
  { key: 'medium' as HairLength, name: '中长发' },
  { key: 'long' as HairLength, name: '长发' },
]

const displayHairstyles = computed(() => {
  if (showRecommended.value) {
    return recommendedHairstyles.value
  }
  return getHairstylesByLength(activeLength.value)
})

const selectHairstyle = (style: Hairstyle) => {
  setHairstyle(style)
}

const selectBangs = (type: BangsType) => {
  setBangs(type)
}

const isRecommended = (style: Hairstyle) => {
  return style.suitableFaces.includes(selectedFaceShape.value)
}
</script>

<template>
  <div class="hair-library">
    <div class="library-header">
      <h3 class="library-title">
        <Scissors :size="20" />
        发型库
      </h3>
      <button
        class="recommend-btn"
        :class="{ active: showRecommended }"
        @click="showRecommended = !showRecommended"
      >
        <Star :size="14" />
        智能推荐
      </button>
    </div>

    <div class="length-tabs" v-if="!showRecommended">
      <button
        v-for="tab in lengthTabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeLength === tab.key }]"
        @click="activeLength = tab.key"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="hairstyle-grid">
      <div
        v-for="style in displayHairstyles"
        :key="style.id"
        :class="['hair-card', { selected: selectedHairstyle?.id === style.id, recommended: isRecommended(style) }]"
        @click="selectHairstyle(style)"
      >
        <div class="hair-preview">
          <svg viewBox="0 0 260 320" class="hair-svg">
            <defs>
              <linearGradient :id="'grad-' + style.id" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="selectedHairColor.secondaryColor" />
                <stop offset="100%" :stop-color="selectedHairColor.primaryColor" />
              </linearGradient>
            </defs>
            <ellipse cx="130" cy="150" rx="70" ry="90" fill="#FFE0C2" />
            <path :d="style.svgPath" :fill="'url(#grad-' + style.id + ')'" transform="scale(1.1) translate(10, 5)" />
          </svg>
          <div v-if="isRecommended(style)" class="recommend-badge">
            <Star :size="10" fill="currentColor" />
            推荐
          </div>
        </div>
        <div class="hair-info">
          <h4 class="hair-name">{{ style.name }}</h4>
          <p class="hair-desc">{{ style.description }}</p>
        </div>
      </div>
    </div>

    <div class="bangs-section">
      <h4 class="section-title">刘海类型</h4>
      <div class="bangs-options">
        <button
          v-for="bangs in bangsOptions"
          :key="bangs.type"
          :class="['bangs-btn', { active: selectedBangs === bangs.type }]"
          @click="selectBangs(bangs.type)"
        >
          {{ bangs.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hair-library {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(196, 69, 105, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.library-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #C44569;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.recommend-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #FFB6C1;
  border-radius: 16px;
  background: #fff;
  color: #C44569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-btn:hover {
  background: #FFF0F3;
}

.recommend-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}

.length-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #FFB6C1;
  border-radius: 14px;
  background: #fff;
  color: #C44569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: #FFF0F3;
}

.tab-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}

.hairstyle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 4px;
}

.hairstyle-grid::-webkit-scrollbar {
  width: 4px;
}

.hairstyle-grid::-webkit-scrollbar-track {
  background: #FFF0F3;
  border-radius: 2px;
}

.hairstyle-grid::-webkit-scrollbar-thumb {
  background: #FFB6C1;
  border-radius: 2px;
}

.hair-card {
  position: relative;
  border: 2px solid #FFE4EA;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: #FFFAFB;
}

.hair-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(196, 69, 105, 0.15);
  border-color: #FFB6C1;
}

.hair-card.selected {
  border-color: #C44569;
  box-shadow: 0 0 0 3px rgba(196, 69, 105, 0.2);
}

.hair-card.recommended {
  border-color: #FFD54F;
}

.hair-preview {
  position: relative;
  aspect-ratio: 260 / 320;
  background: linear-gradient(180deg, #FEF3F7 0%, #FCE4EC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hair-svg {
  width: 80%;
  height: 80%;
}

.recommend-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #FFD54F, #FFA726);
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.hair-info {
  padding: 10px 12px;
}

.hair-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #5D4037;
}

.hair-desc {
  margin: 0;
  font-size: 11px;
  color: #9E7A85;
  line-height: 1.4;
}

.bangs-section {
  border-top: 1px solid #FFE4EA;
  padding-top: 16px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #C44569;
}

.bangs-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.bangs-btn {
  padding: 8px 6px;
  border: 1px solid #FFB6C1;
  border-radius: 12px;
  background: #fff;
  color: #C44569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.bangs-btn:hover {
  background: #FFF0F3;
}

.bangs-btn.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
}
</style>
