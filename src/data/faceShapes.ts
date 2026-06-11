import type { FaceShape, FaceShapeType } from '@/types'

export const faceShapes: FaceShape[] = [
  {
    type: 'oval',
    name: '鹅蛋脸',
    description: '线条柔和，比例均匀，适合大多数发型',
  },
  {
    type: 'round',
    name: '圆脸',
    description: '脸型圆润，需要增加纵向线条来拉长脸型',
  },
  {
    type: 'square',
    name: '方脸',
    description: '下颌线分明，适合柔和的发型来柔化棱角',
  },
  {
    type: 'long',
    name: '长脸',
    description: '脸型偏长，适合增加两侧宽度的发型',
  },
  {
    type: 'diamond',
    name: '菱形脸',
    description: '额头和下巴较窄，颧骨突出，适合柔和额角的发型',
  },
]

export const faceShapeMap: Record<FaceShapeType, FaceShape> = faceShapes.reduce(
  (acc, shape) => {
    acc[shape.type] = shape
    return acc
  },
  {} as Record<FaceShapeType, FaceShape>
)
