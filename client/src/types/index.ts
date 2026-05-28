// 类型定义

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number,
  model?: string
}

export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: Message[]
}

export interface SessionSummary {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

export interface ChatRequest {
  sessionId: string
  message: string
  role?: string
  template?: string
}

export interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
}

export interface RequestOptions {
  role?: string
  template?: string
  sessionId?: string,
  model?: string,
}
