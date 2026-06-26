export type Channel = 'web' | 'sms' | 'whatsapp' | 'voice'
export type Language = 'en' | 'ha' | 'yo' | 'ig' | 'pcm'

export type QuestionType = 'text' | 'long_text' | 'mcq' | 'multi_select' | 'rating' | 'dropdown'

export interface ShowIf {
  question_id: string
  equals: string[]
}

export interface Question {
  id: string
  section: string
  text: string
  type: QuestionType
  options?: string[]
  has_other?: boolean
  scale_min?: number
  scale_max?: number
  scale_min_label?: string
  scale_max_label?: string
  required?: boolean
  show_if?: ShowIf
}

export interface Respondent {
  id: string
  phone_number?: string
  channel: Channel
  language: Language
  created_at: string
  metadata: Record<string, any>
}

export interface SurveyFlow {
  id: string
  name: string
  questions: Question[]
  active: boolean
  version: number
  created_at: string
}

export interface ResponseRow {
  id: string
  respondent_id: string
  survey_flow_id: string
  question_id: string
  answer_text?: string
  answer_value?: any
  created_at: string
}