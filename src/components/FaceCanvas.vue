<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Upload, RotateCcw } from 'lucide-vue-next'
import { useHairStyle } from '@/composables/useHairStyle'
import type { FaceShapeType } from '@/types'

const {
  portraitImage,
  selectedFaceShape,
  selectedHairstyle,
  selectedHairColor,
  selectedBangs,
  faceShapes,
  setPortrait,
  setFaceShape,
} = useHairStyle()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const canvasWidth = 400
const canvasHeight = 500

const getBangsPath = (bangsType: string): string => {
  switch (bangsType) {
    case 'straight':
      return 'M80,110 Q100,95 130,98 Q160,100 180,108 Q170,130 130,125 Q90,128 80,110 Z'
    case 'side':
      return 'M75,105 Q95,90 130,92 Q170,95 190,108 Q160,120 120,118 Q85,115 75,105 Z'
    case 'middle':
      return 'M95,100 Q115,90 130,92 Q145,90 165,100 Q150,115 130,112 Q110,115 95,100 Z'
    default:
      return ''
  }
}

const drawCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
  gradient.addColorStop(0, '#FEF3F7')
  gradient.addColorStop(1, '#FCE4EC')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(canvasWidth / 2, canvasHeight / 2 + 20, 150, 180, 0, 0, Math.PI * 2)
  ctx.clip()

  if (portraitImage.value) {
    const img = new Image()
    img.onload = () => {
      const scale = Math.max(300 / img.width, 360 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(
        img,
        (canvasWidth - w) / 2,
        (canvasHeight - h) / 2,
        w,
        h
      )
      drawHairAndFace()
    }
    img.src = portraitImage.value
  } else {
    drawFaceShape(ctx)
    drawHairAndFace()
  }

  ctx.restore()
}

const drawFaceShape = (ctx: CanvasRenderingContext2D) => {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2 + 20

  ctx.save()
  ctx.fillStyle = '#FFE0C2'
  ctx.strokeStyle = '#E8B896'
  ctx.lineWidth = 2

  ctx.beginPath()
  switch (selectedFaceShape.value) {
    case 'oval':
      ctx.ellipse(centerX, centerY, 85, 110, 0, 0, Math.PI * 2)
      break
    case 'round':
      ctx.ellipse(centerX, centerY, 95, 95, 0, 0, Math.PI * 2)
      break
    case 'square':
      ctx.roundRect(centerX - 85, centerY - 95, 170, 190, 25)
      break
    case 'long':
      ctx.ellipse(centerX, centerY, 70, 125, 0, 0, Math.PI * 2)
      break
    case 'diamond':
      ctx.moveTo(centerX, centerY - 110)
      ctx.lineTo(centerX + 90, centerY - 10)
      ctx.lineTo(centerX + 70, centerY + 100)
      ctx.lineTo(centerX - 70, centerY + 100)
      ctx.lineTo(centerX - 90, centerY - 10)
      ctx.closePath()
      break
  }
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#5D4037'
  ctx.beginPath()
  ctx.ellipse(centerX - 30, centerY - 20, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(centerX + 30, centerY - 20, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#5D4037'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(centerX, centerY + 30, 20, 0.1 * Math.PI, 0.9 * Math.PI)
  ctx.stroke()

  ctx.fillStyle = '#FFAB91'
  ctx.beginPath()
  ctx.ellipse(centerX - 50, centerY + 10, 12, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(centerX + 50, centerY + 10, 12, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

const drawHairAndFace = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (selectedHairstyle.value) {
    const scale = 1.4
    const offsetX = canvasWidth / 2 - 130 * scale + 30
    const offsetY = 40

    const hairGradient = ctx.createLinearGradient(0, offsetY, 0, offsetY + 300)
    hairGradient.addColorStop(0, selectedHairColor.value.secondaryColor)
    hairGradient.addColorStop(1, selectedHairColor.value.primaryColor)

    ctx.save()
    ctx.fillStyle = hairGradient
    ctx.strokeStyle = selectedHairColor.value.primaryColor
    ctx.lineWidth = 2

    const path = new Path2D(selectedHairstyle.value.svgPath)
    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)
    ctx.fill(path)
    ctx.stroke(path)
    ctx.restore()

    if (selectedBangs.value !== 'none') {
      const bangsPath = new Path2D(getBangsPath(selectedBangs.value))
      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)
      ctx.fill(bangsPath)
      ctx.restore()
    }

    ctx.restore()
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPortrait(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPortrait(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const resetPortrait = () => {
  setPortrait(null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

watch(
  [selectedFaceShape, selectedHairstyle, selectedHairColor, selectedBangs, portraitImage],
  () => {
    drawCanvas()
  },
  { deep: true }
)

onMounted(() => {
  drawCanvas()
})

defineExpose({
  canvasRef,
  getCanvas: () => canvasRef.value,
})
</script>

<template>
  <div class="face-canvas">
    <div class="canvas-header">
      <h3 class="canvas-title">脸型画布</h3>
      <button class="reset-btn" @click="resetPortrait" v-if="portraitImage">
        <RotateCcw :size="16" />
        重置
      </button>
    </div>

    <div class="face-shape-tabs">
      <button
        v-for="shape in faceShapes"
        :key="shape.type"
        :class="['face-tab', { active: selectedFaceShape === shape.type }]"
        @click="setFaceShape(shape.type as FaceShapeType)"
      >
        {{ shape.name }}
      </button>
    </div>

    <div
      class="canvas-container"
      :class="{ 'dragging': isDragging }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="preview-canvas"
      />

      <div v-if="!portraitImage" class="upload-hint">
        <Upload :size="32" class="upload-icon" />
        <p class="upload-text">拖拽图片到此处或</p>
        <button class="upload-btn" @click="triggerFileInput">
          选择人像照片
        </button>
        <p class="upload-tip">支持 JPG、PNG 格式</p>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="file-input"
        @change="handleFileUpload"
      />
    </div>

    <div class="shape-description">
      <p class="desc-text">
        <strong>{{ faceShapes.find(f => f.type === selectedFaceShape)?.name }}</strong>：
        {{ faceShapes.find(f => f.type === selectedFaceShape)?.description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.face-canvas {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(196, 69, 105, 0.1);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.canvas-title {
  font-size: 20px;
  font-weight: 600;
  color: #C44569;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #FFB6C1;
  border-radius: 20px;
  background: #fff;
  color: #C44569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover {
  background: #FFF0F3;
}

.face-shape-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.face-tab {
  flex: 1;
  min-width: 60px;
  padding: 8px 12px;
  border: 1px solid #FFB6C1;
  border-radius: 16px;
  background: #fff;
  color: #C44569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.face-tab:hover {
  background: #FFF0F3;
}

.face-tab.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.3);
}

.canvas-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #FEF3F7 0%, #FCE4EC 100%);
  border: 2px dashed #FFB6C1;
  transition: all 0.3s;
}

.canvas-container.dragging {
  border-color: #C44569;
  background: #FFF0F3;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #C44569;
}

.upload-icon {
  margin-bottom: 12px;
  opacity: 0.6;
}

.upload-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #8B5A6B;
}

.upload-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(196, 69, 105, 0.4);
}

.upload-tip {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #B88899;
}

.file-input {
  display: none;
}

.shape-description {
  margin-top: 16px;
  padding: 12px 16px;
  background: #FEF3F7;
  border-radius: 12px;
}

.desc-text {
  margin: 0;
  font-size: 13px;
  color: #6B4452;
  line-height: 1.6;
}
</style>
