export type FaceShapeType = 'oval' | 'round' | 'square' | 'long' | 'diamond'

export type HairLength = 'short' | 'medium' | 'long'

export type BangsType = 'none' | 'straight' | 'side' | 'middle'

export type OccasionTag = 'work' | 'date' | 'vacation'

export type Rating = 1 | 2 | 3 | 4 | 5

export type SortType = 'time-desc' | 'time-asc' | 'rating-desc' | 'rating-asc'

export type SceneType = 'work' | 'date' | 'party' | 'travel' | 'daily' | 'photo' | 'sports'

export type LightEnvironment = 'natural' | 'indoor-warm' | 'indoor-cool' | 'outdoor-sunny' | 'outdoor-cloudy' | 'night'

export type PlanStatus = 'pending' | 'executed' | 'cancelled'

export type AutoTag = 'high-value-low-comfort' | 'comfortable-low-scene-fit' | 'reusable' | 'perfect-match' | 'overwear-risk' | 'scene-star'

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
  note?: string
  rating?: Rating
  createdAt: number
}

export interface CanvasState {
  portraitImage: string | null
  faceShape: FaceShapeType
  hairstyle: Hairstyle | null
  hairColor: HairColor | null
  bangs: BangsType
}

export interface Lens {
  id: string
  name: string
  brand: string
  color: string
  colorCode: string
  diameter: number
  baseCurve: number
  waterContent: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  style: 'natural' | 'cute' | 'sexy' | 'cool' | 'elegant' | 'hip-hop'
  description: string
  image?: string
  createdAt: number
}

export interface WearRecord {
  id: string
  lensId: string
  lensName: string
  wearDate: number
  wearStartTime: number
  wearEndTime?: number
  durationMinutes?: number
  comfortLevel: Rating
  eyeCondition: string
  note?: string
  createdAt: number
}

export interface OutfitPlan {
  id: string
  lensId: string
  sceneName: string
  sceneType: SceneType
  makeupStyle: string
  clothingColor: string
  lightEnvironment: LightEnvironment
  recommendedLensId: string
  recommendedLensName: string
  alternativeLensId?: string
  alternativeLensName?: string
  expectedWearDate: number
  expectedDurationMinutes: number
  matchingScore: Rating
  note?: string
  status: PlanStatus
  executedAt?: number
  wearRecordId?: string
  autoTags: AutoTag[]
  createdAt: number
  updatedAt: number
}

export interface PlanFilter {
  sceneType: SceneType | 'all'
  status: PlanStatus | 'all'
  hasTags: AutoTag[]
  dateFrom?: number
  dateTo?: number
}

export type CareGoal = 'oil-control' | 'color-fix' | 'repair-frizz' | 'bangs-care'

export type CareTaskType =
  | 'wash'
  | 'deep-condition'
  | 'color-retouch'
  | 'trim-bangs'
  | 'trim-ends'
  | 'scalp-care'
  | 'hair-mask'

export type CareTaskStatus = 'pending' | 'completed' | 'overdue' | 'delayed'

export interface CareTask {
  id: string
  planId: string
  type: CareTaskType
  title: string
  dueDate: number
  status: CareTaskStatus
  completedAt?: number
  delayedTo?: number
  note?: string
  createdAt: number
}

export interface HairCarePlan {
  id: string
  outfitId: string
  outfitName: string
  goals: CareGoal[]
  washFrequencyDays: number
  colorRetouchWeeks?: number
  lastColorDate?: number
  trimBangsDate?: number
  trimEndsDate?: number
  autoSuggestions: string[]
  note?: string
  active: boolean
  createdAt: number
  updatedAt: number
}

export interface CareSuggestion {
  type: 'info' | 'warning' | 'tip'
  title: string
  description: string
  relatedGoal?: CareGoal
}
