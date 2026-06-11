export type FaceShapeType = 'oval' | 'round' | 'square' | 'long' | 'diamond'

export type HairLength = 'short' | 'medium' | 'long'

export type BangsType = 'none' | 'straight' | 'side' | 'middle'

export type OccasionTag = 'work' | 'date' | 'vacation'

export interface FaceShape {
  type: FaceShapeType
  name: string
  description: string
}

export interface Hairstyle {
  id: string
  name: string
  length: HairLength
  bangs: BangsType
  suitableFaces: FaceShapeType[]
  description: string
  svgPath: string
}

export interface HairColor {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
}

export interface Outfit {
  id: string
  name: string
  hairstyleId: string
  hairColorId: string
  faceShapeType: FaceShapeType
  bangsType: BangsType
  occasionTags: OccasionTag[]
  portraitImage?: string
  previewImage?: string
  createdAt: number
}

export interface CanvasState {
  portraitImage: string | null
  faceShape: FaceShapeType
  hairstyle: Hairstyle | null
  hairColor: HairColor | null
  bangs: BangsType
}
