<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Scissors, BookOpen, Bell, GitCompare } from 'lucide-vue-next'
import FaceCanvas from '@/components/FaceCanvas.vue'
import HairLibrary from '@/components/HairLibrary.vue'
import ColorPanel from '@/components/ColorPanel.vue'
import Portfolio from '@/components/Portfolio.vue'
import Toolbar from '@/components/Toolbar.vue'
import CompareView from '@/components/CompareView.vue'
import CareReminderPanel from '@/components/CareReminderPanel.vue'
import HairCareCenter from '@/components/HairCareCenter.vue'
import CarePlanModal from '@/components/CarePlanModal.vue'
import { useHairStyle } from '@/composables/useHairStyle'
import { useHairCare, careGoalOptions } from '@/composables/useHairCare'
import { hairstyles, bangsOptions } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'
import { faceShapeMap } from '@/data/faceShapes'
import type { OccasionTag, Rating, Outfit } from '@/types'

const faceCanvasRef = ref<InstanceType<typeof FaceCanvas> | null>(null)
const {
  saveToPortfolio,
  selectedHairstyle,
  selectedHairColor,
  selectedFaceShape,
  selectedBangs,
  showCompareView,
  selectedForCompareOutfits,
  setShowCompareView,
  currentAppliedOutfit,
  portfolio,
} = useHairStyle()

const {
  carePlans,
  plansByOutfit,
  getPlanSummary,
} = useHairCare()

const activeMobileTab = ref<'hairstyle' | 'portfolio' | 'compare' | 'care'>('hairstyle')

const showCarePlanModal = ref(false)
const carePlanModalOutfit = ref<Outfit | null>(null)

const showCompareGuide = ref(false)

const handleCompareTabClick = () => {
  if (selectedForCompareOutfits.value.length < 2) {
    showCompareGuide.value = true
    setTimeout(() => {
      showCompareGuide.value = false
    }, 3000)
  } else {
    setShowCompareView(true)
  }
}

const careCenterPanelRef = ref<any>(null)
const openCareCenterFromPanel = () => {
  activeMobileTab.value = 'care'
}

const goToPlanDetail = (planId: string) => {
  activeMobileTab.value = 'care'
}

const openCarePlanForCurrent = () => {
  if (currentAppliedOutfit.value) {
    carePlanModalOutfit.value = currentAppliedOutfit.value
    showCarePlanModal.value = true
  }
}

const handleCarePlanCreated = () => {
  activeMobileTab.value = 'care'
}

const activePlanForCurrent = computed(() => {
  if (!currentAppliedOutfit.value) return null
  return plansByOutfit(currentAppliedOutfit.value.id).find((p) => p.active) || null
})

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const renderStars = (rating?: Rating) => {
  if (!rating) return '未评分'
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

const handleSave = async (data: { name: string; tags: OccasionTag[]; note?: string; rating?: Rating }) => {
  const canvas = await faceCanvasRef.value?.getCanvasAsync()
  let previewImage: string | undefined
  if (canvas) {
    previewImage = canvas.toDataURL('image/png')
  }
  const outfit = saveToPortfolio(data.name, data.tags, previewImage, data.note, data.rating)
  if (outfit && confirm('搭配已保存！是否为该方案创建专属护理计划？')) {
    carePlanModalOutfit.value = outfit
    showCarePlanModal.value = true
  }
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(img)
    img.src = src
  })
}

const drawOutfitPreview = async (outfit: Outfit, targetCanvas: HTMLCanvasElement) => {
  const ctx = targetCanvas.getContext('2d')
  if (!ctx) return

  const width = targetCanvas.width
  const height = targetCanvas.height

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#FEF3F7')
  bgGradient.addColorStop(1, '#FCE4EC')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  if (outfit.previewImage) {
    const img = await loadImage(outfit.previewImage)
    const scale = Math.min(width / img.width, height / img.height) * 0.9
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
  } else {
    const centerX = width / 2
    const centerY = height / 2 + 20
    ctx.save()
    ctx.fillStyle = '#FFE0C2'
    ctx.strokeStyle = '#E8B896'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, 85, 110, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    const hairstyle = hairstyles.find(h => h.id === outfit.hairstyleId)
    const color = hairColors.find(c => c.id === outfit.hairColorId)
    if (hairstyle && color) {
      const hairGradient = ctx.createLinearGradient(0, 40, 0, 340)
      hairGradient.addColorStop(0, color.secondaryColor)
      hairGradient.addColorStop(1, color.primaryColor)
      ctx.fillStyle = hairGradient
      ctx.strokeStyle = color.primaryColor
      ctx.lineWidth = 2

      const scale = 1.4
      const offsetX = width / 2 - 130 * scale + 30
      const offsetY = 40
      const path = new Path2D(hairstyle.svgPath)
      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)
      ctx.fill(path)
      ctx.stroke(path)
      ctx.restore()
    }
    ctx.restore()
  }
}

const handleExportCurrent = async () => {
  const resultCanvas = await faceCanvasRef.value?.getCanvasAsync()
  if (!resultCanvas) return

  const { originalDataUrl, resultDataUrl } = await faceCanvasRef.value?.getBothCanvases() || {}
  if (!originalDataUrl || !resultDataUrl) return

  const planSummaryLines: string[] = activePlanForCurrent.value
    ? getPlanSummary(activePlanForCurrent.value.id)
    : []

  const extraHeight = planSummaryLines.length > 0 ? 30 + planSummaryLines.length * 22 : 0

  const exportCanvas = document.createElement('canvas')
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  const width = resultCanvas.width * 2 + 60
  const height = resultCanvas.height + 140 + extraHeight
  exportCanvas.width = width
  exportCanvas.height = height

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#FEF3F7')
  bgGradient.addColorStop(1, '#FCE4EC')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#C44569'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('原始脸型', resultCanvas.width / 2 + 30, 35)
  ctx.fillText('发型效果', resultCanvas.width * 1.5 + 30, 35)

  ctx.save()
  ctx.strokeStyle = '#FFB6C1'
  ctx.lineWidth = 3
  ctx.strokeRect(30, 50, resultCanvas.width, resultCanvas.height)
  ctx.strokeRect(resultCanvas.width + 30, 50, resultCanvas.width, resultCanvas.height)
  ctx.restore()

  const originalImg = await loadImage(originalDataUrl)
  const resultImg = await loadImage(resultDataUrl)

  ctx.drawImage(originalImg, 30, 50)
  ctx.drawImage(resultImg, resultCanvas.width + 30, 50)

  ctx.fillStyle = '#8B5A6B'
  ctx.font = '14px sans-serif'
  const infoText = `发型：${selectedHairstyle.value?.name || '未选择'} | 发色：${selectedHairColor.value?.name || '未选择'} | 刘海：${bangsOptions.find(b => b.type === selectedBangs.value)?.name || '无'}`
  ctx.textAlign = 'center'
  const infoY = resultCanvas.height + 75
  ctx.fillText(infoText, width / 2, infoY)

  let currentY = infoY + 28

  if (planSummaryLines.length > 0) {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#FFB6C1'
    ctx.lineWidth = 2
    const boxX = 40
    const boxY = currentY
    const boxW = width - 80
    const boxH = 20 + planSummaryLines.length * 22
    const boxR = 12
    ctx.beginPath()
    ctx.moveTo(boxX + boxR, boxY)
    ctx.lineTo(boxX + boxW - boxR, boxY)
    ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + boxR)
    ctx.lineTo(boxX + boxW, boxY + boxH - boxR)
    ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - boxR, boxY + boxH)
    ctx.lineTo(boxX + boxR, boxY + boxH)
    ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - boxR)
    ctx.lineTo(boxX, boxY + boxR)
    ctx.quadraticCurveTo(boxX, boxY, boxX + boxR, boxY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#C44569'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('🌸 护理计划摘要', boxX + 16, boxY + 24)

    ctx.fillStyle = '#5D4037'
    ctx.font = '12px sans-serif'
    planSummaryLines.forEach((line, i) => {
      ctx.fillText('· ' + line, boxX + 20, boxY + 48 + i * 22)
    })
    currentY = boxY + boxH + 16
  }

  ctx.fillStyle = '#B88899'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`生成时间：${new Date().toLocaleString('zh-CN')}`, width / 2, height - 20)

  const link = document.createElement('a')
  link.download = `发型方案_${Date.now()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

const handleExportCompare = async () => {
  const outfits = selectedForCompareOutfits.value
  if (outfits.length < 2) return

  const cardWidth = 320
  const cardHeight = 700
  const padding = 24
  const gap = 20
  const headerHeight = 80

  const totalWidth = cardWidth * outfits.length + gap * (outfits.length - 1) + padding * 2
  const totalHeight = cardHeight + headerHeight + padding * 2

  const exportCanvas = document.createElement('canvas')
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  exportCanvas.width = totalWidth
  exportCanvas.height = totalHeight

  const bgGradient = ctx.createLinearGradient(0, 0, 0, totalHeight)
  bgGradient.addColorStop(0, '#FFF5F8')
  bgGradient.addColorStop(1, '#FCE4EC')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, totalWidth, totalHeight)

  ctx.fillStyle = '#C44569'
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('试戴方案对比卡', totalWidth / 2, 45)
  ctx.fillStyle = '#8B5A6B'
  ctx.font = '13px sans-serif'
  ctx.fillText(`生成时间：${new Date().toLocaleString('zh-CN')}`, totalWidth / 2, 68)

  for (let i = 0; i < outfits.length; i++) {
    const outfit = outfits[i]
    const x = padding + i * (cardWidth + gap)
    const y = headerHeight

    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#FFE4EA'
    ctx.lineWidth = 2
    const radius = 16
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + cardWidth - radius, y)
    ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius)
    ctx.lineTo(x + cardWidth, y + cardHeight - radius)
    ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight)
    ctx.lineTo(x + radius, y + cardHeight)
    ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#FF6B9D'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`方案 ${i + 1}`, x + 16, y + 28)

    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = 260
    previewCanvas.height = 280
    await drawOutfitPreview(outfit, previewCanvas)
    ctx.drawImage(previewCanvas, x + 30, y + 42, 260, 280)

    let contentY = y + 340

    ctx.fillStyle = '#5D4037'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(outfit.name, x + 16, contentY)
    contentY += 24

    if (outfit.rating) {
      ctx.fillStyle = '#FFD54F'
      ctx.font = '16px sans-serif'
      ctx.fillText(renderStars(outfit.rating), x + 16, contentY)
      contentY += 22
    }

    ctx.fillStyle = '#8B5A6B'
    ctx.font = '12px sans-serif'
    const hairstyle = hairstyles.find(h => h.id === outfit.hairstyleId)
    const color = hairColors.find(c => c.id === outfit.hairColorId)
    const bangs = bangsOptions.find(b => b.type === outfit.bangsType)
    const faceShape = faceShapeMap[outfit.faceShapeType]

    ctx.fillText(`脸型：${faceShape?.name || '未知'}`, x + 16, contentY)
    contentY += 18
    ctx.fillText(`发型：${hairstyle?.name || '未知'}`, x + 16, contentY)
    contentY += 18
    ctx.fillText(`刘海：${bangs?.name || '未知'}`, x + 16, contentY)
    contentY += 18
    ctx.fillText(`发色：${color?.name || '未知'}`, x + 16, contentY)
    contentY += 22

    if (outfit.occasionTags.length > 0) {
      ctx.fillStyle = '#8B5A6B'
      ctx.font = '12px sans-serif'
      ctx.fillText('场合：', x + 16, contentY)
      let tagX = x + 52
      outfit.occasionTags.forEach(tag => {
        const tagName = tag === 'work' ? '职场' : tag === 'date' ? '约会' : '度假'
        ctx.fillStyle = '#FFF0F3'
        const tagWidth = ctx.measureText(tagName).width + 16
        ctx.beginPath()
        ctx.roundRect(tagX, contentY - 12, tagWidth, 20, 6)
        ctx.fill()
        ctx.fillStyle = '#C44569'
        ctx.fillText(tagName, tagX + 8, contentY + 2)
        tagX += tagWidth + 6
      })
      contentY += 28
    }

    const outfitPlan = plansByOutfit(outfit.id).find((p) => p.active)
    if (outfitPlan) {
      const summaryLines = getPlanSummary(outfitPlan.id).slice(0, 3)
      if (summaryLines.length > 0) {
        ctx.save()
        ctx.fillStyle = '#FFF5F8'
        ctx.strokeStyle = '#FFB6C1'
        ctx.lineWidth = 1
        const boxX = x + 14
        const boxY = contentY
        const boxW = cardWidth - 28
        const boxH = 16 + summaryLines.length * 18
        const r = 10
        ctx.beginPath()
        ctx.moveTo(boxX + r, boxY)
        ctx.lineTo(boxX + boxW - r, boxY)
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r)
        ctx.lineTo(boxX + boxW, boxY + boxH - r)
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH)
        ctx.lineTo(boxX + r, boxY + boxH)
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r)
        ctx.lineTo(boxX, boxY + r)
        ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        ctx.fillStyle = '#C44569'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('🌸 护理摘要', boxX + 10, boxY + 18)

        ctx.fillStyle = '#6B4452'
        ctx.font = '11px sans-serif'
        summaryLines.forEach((line, idx) => {
          ctx.fillText('· ' + line, boxX + 12, boxY + 36 + idx * 18)
        })
        contentY = boxY + boxH + 10
      }
    }

    ctx.fillStyle = '#B88899'
    ctx.font = '11px sans-serif'
    ctx.fillText(`保存时间：${formatDate(outfit.createdAt)}`, x + 16, contentY)
    contentY += 20

    if (outfit.note && contentY < y + cardHeight - 30) {
      ctx.fillStyle = '#6B4452'
      ctx.font = '12px sans-serif'
      ctx.fillText('备注：', x + 16, contentY)
      contentY += 18
      ctx.fillStyle = '#5D4037'
      ctx.font = '12px sans-serif'
      const words = outfit.note.split('')
      let line = ''
      for (const char of words) {
        const testLine = line + char
        if (ctx.measureText(testLine).width > cardWidth - 40) {
          ctx.fillText(line, x + 16, contentY)
          line = char
          contentY += 16
          if (contentY > y + cardHeight - 30) break
        } else {
          line = testLine
        }
      }
      if (line && contentY <= y + cardHeight - 30) ctx.fillText(line, x + 16, contentY)
    }
  }

  const link = document.createElement('a')
  link.download = `方案对比卡_${Date.now()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

const handleExport = async (mode: 'current' | 'compare') => {
  if (mode === 'current') {
    await handleExportCurrent()
  } else {
    await handleExportCompare()
  }
}

const handlePrint = async () => {
  const canvas = await faceCanvasRef.value?.getCanvasAsync()
  if (!canvas) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const hairstyleName = selectedHairstyle.value?.name || '未选择'
  const hairColorName = selectedHairColor.value?.name || '未选择'
  const faceShapeName = faceShapeMap[selectedFaceShape.value]?.name || '未选择'
  const bangsName = bangsOptions.find(b => b.type === selectedBangs.value)?.name || '无刘海'
  const previewUrl = canvas.toDataURL('image/png')

  const noteText = currentAppliedOutfit.value?.note || ''
  const ratingText = currentAppliedOutfit.value?.rating
    ? renderStars(currentAppliedOutfit.value.rating)
    : '未评分'

  const planSummaryLines: string[] = activePlanForCurrent.value
    ? getPlanSummary(activePlanForCurrent.value.id)
    : []

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>发型参考卡</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 40px;
          background: #fff;
          color: #333;
        }
        .card {
          max-width: 500px;
          margin: 0 auto;
          border: 2px solid #FFB6C1;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(180deg, #FEF3F7 0%, #FCE4EC 100%);
        }
        .card-header {
          padding: 24px;
          text-align: center;
          background: linear-gradient(135deg, #FF6B9D, #C44569);
          color: #fff;
        }
        .card-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .card-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }
        .card-body {
          padding: 24px;
        }
        .preview-image {
          width: 100%;
          max-width: 300px;
          margin: 0 auto 24px;
          display: block;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(196, 69, 105, 0.2);
        }
        .info-section {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #FFE4EA;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #8B5A6B;
          font-size: 14px;
        }
        .info-value {
          color: #C44569;
          font-weight: 600;
          font-size: 14px;
        }
        .note-section {
          margin-top: 16px;
          background: #FEF3F7;
          border-radius: 12px;
          padding: 16px;
        }
        .note-label {
          color: #8B5A6B;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .note-content {
          color: #5D4037;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .care-section {
          margin-top: 16px;
          background: linear-gradient(135deg, #FFF5F8, #fff);
          border: 1px solid #FFB6C1;
          border-radius: 12px;
          padding: 16px;
        }
        .care-label {
          color: #C44569;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .care-item {
          color: #5D4037;
          font-size: 12px;
          padding: 5px 0;
          padding-left: 10px;
          border-left: 3px solid #FFB6C1;
          margin-left: 4px;
          margin-bottom: 6px;
          line-height: 1.5;
        }
        .card-footer {
          padding: 20px 24px;
          text-align: center;
          color: #B88899;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .card { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">💇 发型参考卡</h1>
          <p class="card-subtitle">Hair Style Reference</p>
        </div>
        <div class="card-body">
          <img src="${previewUrl}" class="preview-image" alt="发型预览" />
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">脸型</span>
              <span class="info-value">${faceShapeName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">发型</span>
              <span class="info-value">${hairstyleName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">刘海</span>
              <span class="info-value">${bangsName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">发色</span>
              <span class="info-value">${hairColorName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">评分</span>
              <span class="info-value">${ratingText}</span>
            </div>
          </div>
          ${noteText ? `
            <div class="note-section">
              <div class="note-label">📝 备注 / 适合理由</div>
              <div class="note-content">${noteText}</div>
            </div>
          ` : ''}
          ${planSummaryLines.length > 0 ? `
            <div class="care-section">
              <div class="care-label">🌸 护理计划摘要</div>
              ${planSummaryLines.map(line => `<div class="care-item">${line}</div>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="card-footer">
          生成时间：${new Date().toLocaleString('zh-CN')}
        </div>
      </div>
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}
</script>

<template>
  <div class="home-page">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <Sparkles :size="28" class="logo-icon" />
          <h1 class="app-title">发型搭配模拟器</h1>
        </div>
        <p class="app-subtitle">虚拟试戴 · 记录灵感 · 发现适合你的发型</p>
      </div>
    </header>

    <div class="mobile-tabs">
      <button
        :class="['mobile-tab', { active: activeMobileTab === 'hairstyle' }]"
        @click="activeMobileTab = 'hairstyle'"
      >
        <Scissors :size="16" />
        发型库
      </button>
      <button
        :class="['mobile-tab', { active: activeMobileTab === 'portfolio' }]"
        @click="activeMobileTab = 'portfolio'"
      >
        <BookOpen :size="16" />
        作品集
      </button>
      <button
        :class="['mobile-tab', { active: activeMobileTab === 'compare' }]"
        @click="handleCompareTabClick"
      >
        <GitCompare :size="16" />
        对比中心
      </button>
      <button
        :class="['mobile-tab', { active: activeMobileTab === 'care' }]"
        @click="activeMobileTab = 'care'"
      >
        <Bell :size="16" />
        提醒中心
      </button>
    </div>

    <main class="main-content">
      <div class="layout-grid">
        <aside class="left-panel" :class="{ 'mobile-hidden': activeMobileTab !== 'hairstyle' }">
          <HairLibrary />
        </aside>

        <section class="center-panel">
          <FaceCanvas ref="faceCanvasRef" />
          <div class="color-section">
            <ColorPanel />
          </div>

          <div class="reminder-section">
            <CareReminderPanel
              @openCenter="openCareCenterFromPanel"
              @goToPlan="goToPlanDetail"
            />
          </div>

          <div class="toolbar-section">
            <Toolbar
              @save="handleSave"
              @export="handleExport"
              @print="handlePrint"
            />
          </div>
        </section>

        <aside class="right-panel" :class="{ 'mobile-visible': activeMobileTab === 'care' || activeMobileTab === 'portfolio' }">
          <div v-show="activeMobileTab === 'portfolio'" class="right-tab-content">
            <Portfolio />
          </div>
          <div v-show="activeMobileTab === 'care'" ref="careCenterPanelRef" class="right-tab-content">
            <HairCareCenter />
          </div>
          <div v-if="activeMobileTab !== 'portfolio' && activeMobileTab !== 'care'" class="right-tab-content">
            <Portfolio />
          </div>
        </aside>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2024 发型搭配模拟器 · 让每一次改变都充满期待</p>
    </footer>

    <CompareView v-if="showCompareView" @close="setShowCompareView(false)" />
    <CarePlanModal
      :visible="showCarePlanModal"
      :outfit="carePlanModalOutfit"
      @close="showCarePlanModal = false"
      @created="handleCarePlanCreated"
    />

    <Teleport to="body">
      <Transition name="guide-fade">
        <div v-if="showCompareGuide" class="compare-guide-toast">
          <div class="guide-icon">💡</div>
          <div class="guide-content">
            <div class="guide-title">请先选择要对比的方案</div>
            <div class="guide-desc">在「作品集」中勾选 2-3 个方案卡片，即可开启对比功能</div>
          </div>
          <button class="guide-close" @click="showCompareGuide = false">×</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF5F8 0%, #FEF3F7 50%, #FCE4EC 100%);
}

.app-header {
  padding: 32px 24px 24px;
  text-align: center;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-icon {
  color: #C44569;
}

.app-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Playfair Display', serif;
}

.app-subtitle {
  margin: 0;
  font-size: 14px;
  color: #8B5A6B;
}

.mobile-tabs {
  display: none;
  justify-content: center;
  gap: 8px;
  padding: 0 24px 16px;
  flex-wrap: wrap;
}

.mobile-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #FFB6C1;
  border-radius: 20px;
  background: #fff;
  color: #C44569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.mobile-tab:hover {
  background: #FFF0F3;
}

.mobile-tab.active {
  background: linear-gradient(135deg, #FF6B9D, #C44569);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(196, 69, 105, 0.3);
}

.main-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 320px 1fr 360px;
  gap: 24px;
  align-items: start;
}

.left-panel,
.right-panel {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow: hidden;
}

.right-tab-content {
  height: 100%;
  max-height: calc(100vh - 48px);
  overflow: hidden;
}

.center-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.color-section {
  width: 100%;
  max-width: 460px;
}

.reminder-section {
  width: 100%;
  max-width: 540px;
}

.toolbar-section {
  width: 100%;
  max-width: 500px;
  padding-top: 8px;
}

.app-footer {
  padding: 24px;
  text-align: center;
  color: #B88899;
  font-size: 12px;
}

@media (max-width: 1280px) {
  .layout-grid {
    grid-template-columns: 280px 1fr 320px;
  }
}

@media (max-width: 1200px) {
  .mobile-tabs {
    display: flex;
  }

  .layout-grid {
    grid-template-columns: 1fr;
  }

  .left-panel {
    display: block;
    position: static;
    max-height: none;
    order: 2;
  }

  .right-panel {
    display: none;
    position: static;
    max-height: none;
    order: 3;
  }

  .left-panel.mobile-hidden {
    display: none !important;
  }

  .right-panel.mobile-visible {
    display: block !important;
  }

  .center-panel {
    order: 1;
  }
}

@media (max-width: 900px) {
  .left-panel,
  .right-panel {
    position: static;
    max-height: none;
  }
}

.compare-guide-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #fff 0%, #FFF5F8 100%);
  border: 2px solid #FFB6C1;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 12px 40px rgba(196, 69, 105, 0.25);
  z-index: 3000;
  max-width: 360px;
}

.guide-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.guide-title {
  font-size: 15px;
  font-weight: 600;
  color: #C44569;
  margin-bottom: 4px;
}

.guide-desc {
  font-size: 13px;
  color: #8B5A6B;
  line-height: 1.5;
}

.guide-close {
  background: none;
  border: none;
  color: #B88899;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.guide-close:hover {
  color: #C44569;
}

.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: all 0.3s ease;
}

.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
