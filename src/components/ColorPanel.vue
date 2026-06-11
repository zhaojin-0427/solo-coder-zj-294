<script setup lang="ts">
import { Palette } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import type { HairColor } from '@/types'

const { selectedHairColor, hairColors, setHairColor } = useHairStyle()

const selectColor = (color: HairColor) => {
  setHairColor(color)
}
</script>

<template>
  <div class="color-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <Palette :size="20" />
        染发色系
      </h3>
    </div>

    <div class="color-grid">
      <div
        v-for="color in hairColors"
        :key="color.id"
        :class="['color-card', { selected: selectedHairColor.id === color.id }]"
        @click="selectColor(color)"
      >
        <div
          class="color-circle"
          :style="{
            background: `linear-gradient(135deg, ${color.secondaryColor}, ${color.primaryColor})`
          }"
        >
          <div v-if="selectedHairColor.id === color.id" class="check-mark">
            ✓
          </div>
        </div>
        <span class="color-name">{{ color.name }}</span>
      </div>
    </div>

    <div class="color-detail">
      <div class="detail-label">当前发色</div>
      <div class="detail-value">
        <span
          class="color-preview"
          :style="{
            background: `linear-gradient(135deg, ${selectedHairColor.secondaryColor}, ${selectedHairColor.primaryColor})`
          }"
        ></span>
        {{ selectedHairColor.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-panel {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(196, 69, 105, 0.1);
}

.panel-header {
  margin-bottom: 16px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #C44569;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.color-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.color-card:hover {
  background: #FFF0F3;
  transform: translateY(-2px);
}

.color-card.selected {
  background: #FFF0F3;
  border-color: #C44569;
}

.color-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.color-card:hover .color-circle {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.check-mark {
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C44569;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-name {
  font-size: 13px;
  color: #5D4037;
  font-weight: 500;
}

.color-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, #FEF3F7, #FCE4EC);
  border-radius: 14px;
}

.detail-label {
  font-size: 13px;
  color: #8B5A6B;
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #C44569;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
