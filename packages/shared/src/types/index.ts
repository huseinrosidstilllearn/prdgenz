export enum Role {
  FREE = 'FREE',
  PRO = 'PRO',
}

export enum Language {
  ID = 'ID',
  EN = 'EN',
}

export enum PRDMode {
  WIZARD = 'WIZARD',
  CHAT = 'CHAT',
  ONESHOT = 'ONESHOT',
}

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface PRD {
  id: string
  projectId: string
  title: string
  language: Language
  mode: PRDMode
  currentVersion: number
  shareId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PRDVersion {
  id: string
  prdId: string
  versionNumber: number
  content: PRDContent
  contentMd: string
  createdAt: Date
}

export interface PRDContent {
  title: string
  summary: string
  problem: string
  targetUser: string
  features: Feature[]
  userStories: UserStory[]
  acceptanceCriteria: AcceptanceCriteria[]
  techStack: TechStack
  timeline: Timeline[]
  outputFormat: string
  risks?: Risk[]
  successMetrics?: string[]
  openQuestions?: string[]
}

export interface Feature {
  id: string
  name: string
  description: string
  priority: 'must' | 'should' | 'could'
}

export interface UserStory {
  id: string
  asA: string
  iWant: string
  soThat: string
}

export interface AcceptanceCriteria {
  id: string
  featureId: string
  criteria: string
}

export interface TechStack {
  frontend: string[]
  backend: string[]
  database: string[]
  infrastructure: string[]
  reasoning: string
}

export interface Timeline {
  id: string
  milestone: string
  duration: string
  deliverables: string[]
}

export interface Risk {
  id: string
  description: string
  impact: 'high' | 'medium' | 'low'
  mitigation: string
}

export interface ApiKey {
  id: string
  userId: string
  provider: string
  keyEncrypted: string
  createdAt: Date
  updatedAt: Date
}

export interface WizardInput {
  idea: string
  problem: string
  targetUser: string
  features: string[]
  techStack?: string[]
  timeline?: string
  constraints?: string
}

export interface OneShotInput {
  idea: string
  constraints?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export type GenerateInput = WizardInput | OneShotInput | ChatMessage[]

export interface GenerateOptions {
  language: Language
  mode: PRDMode
  provider: string
  model: string
  apiKey: string
  input: GenerateInput
}

export interface GenerateResult {
  content: PRDContent
  contentMd: string
}

export interface AIProviderInfo {
  id: string
  name: string
  type: 'direct' | 'aggregator'
  models: string[]
  configured: boolean
}
