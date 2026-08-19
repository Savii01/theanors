export interface ThemeValidation {
  postLink: string
  fitScore: number
  rationale: string
  warnings: string[]
}

export interface ValidationResult {
  overallScore: number
  cohesionRationale: string
  posts: ThemeValidation[]
  passed: boolean
}
