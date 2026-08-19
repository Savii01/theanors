export interface CommentOption {
  option: 1 | 2 | 3
  text: string
  style: string
}

export interface EngagementPost {
  id: string
  link: string
  platform: string
  content?: string
  selectedOption?: number
  status: 'pending' | 'posted' | 'skipped'
}

export interface EngagementBatch {
  id: string
  posts: EngagementPost[]
  progress: number
}
