// 会话管理Hook

import { useState, useCallback, useEffect } from 'react'
import { Session, Message } from '../types'
import {
  getStoredSessions,
  saveSessions,
  getCurrentSessionId,
  setCurrentSessionId,
  clearCurrentSessionId,
  createNewSession,
  addMessageToSession,
  updateAssistantMessage,
  removeSession,
  generateId
} from '../utils/storage'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrent] = useState<Session | null>(null)

  // 初始化：加载本地存储的会话
  useEffect(() => {
    const storedSessions = getStoredSessions()
    setSessions(storedSessions)

    const currentId = getCurrentSessionId()
    if (currentId) {
      const session = storedSessions.find(s => s.id === currentId)
      if (session) {
        setCurrent(session)
      }
    }
  }, [])

  // 保存会话到本地
  const persistSessions = useCallback((newSessions: Session[]) => {
    setSessions(newSessions)
    saveSessions(newSessions)
  }, [])

  // 创建新会话
  const createSession = useCallback(() => {
    const newSession = createNewSession()
    const newSessions = [newSession, ...sessions]
    persistSessions(newSessions)
    setCurrent(newSession)
    setCurrentSessionId(newSession.id)
    return newSession
  }, [sessions, persistSessions])

  // 切换会话
  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrent(session)
      setCurrentSessionId(sessionId)
    }
  }, [sessions])

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    const newSessions = removeSession(sessions, sessionId)
    persistSessions(newSessions)
    
    if (currentSession?.id === sessionId) {
      setCurrent(null)
      clearCurrentSessionId()
    }
  }, [sessions, currentSession, persistSessions])

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, title: newTitle.trim(), updatedAt: Date.now() }
        : session
    )
    persistSessions(updatedSessions)

    // 如果是当前会话，同步更新标题
    if (currentSession?.id === sessionId) {
      setCurrent(prev => prev ? { ...prev, title: newTitle.trim(), updatedAt: Date.now() } : null)
    }
  }, [sessions, currentSession, persistSessions])

  // 添加消息
  const addMessage = useCallback((message: Message) => {
    if (!currentSession) return
    const newSessions = addMessageToSession(sessions, currentSession.id, message)
    persistSessions(newSessions)
    setCurrent(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      updatedAt: Date.now()
    } : null)
  }, [sessions, currentSession, persistSessions])

  // 更新助手消息
  const updateMessage = useCallback((messageId: string, content: string) => {
    if (!currentSession) return
    const newSessions = updateAssistantMessage(sessions, currentSession.id, messageId, content)
    persistSessions(newSessions)
    setCurrent(prev => prev ? {
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId && msg.role === 'assistant'
          ? { ...msg, content }
          : msg
      )
    } : null)
  }, [sessions, currentSession, persistSessions])

  return {
    sessions,
    currentSession,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    addMessage,
    updateMessage
  }
}