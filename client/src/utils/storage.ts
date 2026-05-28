// 本地存储工具
import { MODEL_OPTIONS, ROLES, TOOLS } from '../constants'
import { Session, Message } from '../types'

const SESSIONS_KEY = 'ai_workbench_sessions'
const CURRENT_SESSION_KEY = 'ai_workbench_current_session'

const MODEL_STORAGE_KEY = 'last_selected_model';
const ROLE_STORAGE_KEY = 'role_name';
const TOOL_STORAGE_KEY = 'tool_name';

// 获取所有会话
export function getStoredSessions(): Session[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// 保存会话列表
export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

// 获取当前会话ID
export function getCurrentSessionId(): string | null {
  return localStorage.getItem(CURRENT_SESSION_KEY)
}

// 设置当前会话ID
export function setCurrentSessionId(sessionId: string): void {
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
}

// 清除当前会话ID
export function clearCurrentSessionId(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY)
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// 创建新会话
export function createNewSession(): Session {
  const now = Date.now()
  return {
    id: generateId(),
    title: '新对话',
    createdAt: now,
    updatedAt: now,
    messages: []
  }
}

// 添加消息到会话
export function addMessageToSession(
  sessions: Session[],
  sessionId: string,
  message: Message
): Session[] {
  return sessions.map(session => {
    if (session.id === sessionId) {
      const newMessages = [...session.messages, message]
      const title = session.title === '新对话' && message.role === 'user'
        ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
        : session.title
      
      return {
        ...session,
        messages: newMessages,
        title,
        updatedAt: Date.now()
      }
    }
    return session
  })
}

// 更新助手消息
export function updateAssistantMessage(
  sessions: Session[],
  sessionId: string,
  messageId: string,
  content: string
): Session[] {
  return sessions.map(session => {
    if (session.id === sessionId) {
      return {
        ...session,
        messages: session.messages.map(msg => {
          if (msg.id === messageId && msg.role === 'assistant') {
            return { ...msg, content }
          }
          return msg
        }),
        updatedAt: Date.now()
      }
    }
    return session
  })
}

// 删除会话
export function removeSession(sessions: Session[], sessionId: string): Session[] {
  return sessions.filter(session => session.id !== sessionId)
}

/**
 * -----个人选项相关配置-----
 */

// 获取模型名称
export function getLastSelectedModel(): string | null {
  return localStorage.getItem(MODEL_STORAGE_KEY) || MODEL_OPTIONS[0]?.value;
}

// 设置模型名称
export function setLastSelectedModel(modelType: string): void {
  localStorage.setItem(MODEL_STORAGE_KEY, modelType);
}

// 获取角色名称
export function getRoleName(): string | null {
  return localStorage.getItem(ROLE_STORAGE_KEY) || ROLES[0]?.id;
}

// 设置角色名称
export function setRoleName(name: string): void {
  localStorage.setItem(ROLE_STORAGE_KEY, name);
}

// 获取工具名称
export function getToolName(): string | null {
  return localStorage.getItem(TOOL_STORAGE_KEY) || TOOLS[0]?.id;
}

// 设置工具名称
export function setToolName(name: string): void {
  localStorage.setItem(TOOL_STORAGE_KEY, name);
}
