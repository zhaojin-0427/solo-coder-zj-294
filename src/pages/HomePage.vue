<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import FaceCanvas from '@/components/FaceCanvas.vue'
import HairLibrary from '@/components/HairLibrary.vue'
import ColorPanel from '@/components/ColorPanel.vue'
import Portfolio from '@/components/Portfolio.vue'
import Toolbar from '@/components/Toolbar.vue'
import { useHairStyle } from '@/composables/useHairStyle'
import { hairstyles, bangsOptions } from '@/data/hairstyles'
import { hairColors } from '@/data/hairColors'
import { faceShapeMap } from '@/data/faceShapes'

const faceCanvasRef = ref<InstanceType<typeof FaceCanvas> | null>(null)
const { selectedHairstyle, selectedHairColor, selectedFaceShape, selectedBangs } = useHairStyle()

const handleSave = () => {
  const canvas = faceCanvasRef.value?.getCanvas()
  if (canvas) {
    const previewImage = canvas.toDataURL('image/png')
    return previewImage
  }
}

const handleExport = () => {
  const canvas = faceCanvasRef.value?.getCanvas()
  if (!canvas) return

  const exportCanvas = document.createElement('canvas')
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width * 2 + 60
  const height = canvas.height + 80
  exportCanvas.width = width
  exportCanvas.height = height

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, '#FEF3F7')
  bgGradient.addColorStop(1, '#FCE4EC')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#C44569'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('原图', canvas.width / 2 + 30, 35)
  ctx.fillText('效果预览', canvas.width * 1.5 + 30, 35)

  ctx.save()
  ctx.strokeStyle = '#FFB6C1'
  ctx.lineWidth = 3
  ctx.strokeRect(30, 50, canvas.width, canvas.height)
  ctx.strokeRect(canvas.width + 30, 50, canvas.width, canvas.height)
  ctx.restore()

  ctx.drawImage(canvas, 30, 50)
  ctx.drawImage(canvas, canvas.width + 30, 50)

  ctx.fillStyle = '#8B5A6B'
  ctx.font = '13px sans-serif'
  const infoText = `发型：${selectedHairstyle.value?.name || '未选择'} | 发色：${selectedHairColor.value?.name || '未选择'}`
  ctx.textAlign = 'center'
  ctx.fillText(infoText, width / 2, height - 20)

  const link = document.createElement('a')
  link.download = `发型对比_${Date.now()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

const handlePrint = () => {
  const canvas = faceCanvasRef.value?.getCanvas()
  if (!canvas) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const hairstyleName = selectedHairstyle.value?.name || '未选择'
  const hairColorName = selectedHairColor.value?.name || '未选择'
  const faceShapeName = faceShapeMap[selectedFaceShape.value]?.name || '未选择'
  const bangsName = bangsOptions.find(b => b.type === selectedBangs.value)?.name || '无刘海'
  const previewUrl = canvas.toDataURL('image/png')

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
          </div>
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

    <main class="main-content">
      <div class="layout-grid">
        <aside class="left-panel">
          <HairLibrary />
        </aside>

        <section class="center-panel">
          <FaceCanvas ref="faceCanvasRef" />
          <div class="color-section">
            <ColorPanel />
          </div>
          <div class="toolbar-section">
            <Toolbar
              @save="handleSave"
              @export="handleExport"
              @print="handlePrint"
            />
          </div>
        </section>

        <aside class="right-panel">
          <Portfolio />
        </aside>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2024 发型搭配模拟器 · 让每一次改变都充满期待</p>
    </footer>
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

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
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

@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 280px 1fr;
  }

  .right-panel {
    display: none;
  }
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .left-panel,
  .right-panel {
    position: static;
    max-height: none;
  }
}
</style>
