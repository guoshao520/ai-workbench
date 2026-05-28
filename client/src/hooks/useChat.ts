import { useState, useCallback, useRef } from 'react'
import { Message } from '../types'
import { streamChat, generateId } from '../services/api'

interface SessionCallbacks {
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, content: string) => void
  getHistory: () => Message[]
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const callbacksRef = useRef<SessionCallbacks | null>(null)

  // 外部注入 session 回调
  const setCallbacks = useCallback((callbacks: SessionCallbacks) => {
    callbacksRef.current = callbacks
  }, [])

  // 发送消息
  const sendMessage = useCallback(async (
    content: string,
    options?: { role?: string; template?: string, model?: string }
  ) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    callbacksRef.current?.addMessage(userMessage)

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, assistantMessage])
    callbacksRef.current?.addMessage(assistantMessage)

    setIsLoading(true)
    setError(null)
    abortControllerRef.current = new AbortController()

    try {
      const historyMessages = callbacksRef.current?.getHistory() || []
      const fullMessages = [...historyMessages.slice(-3), userMessage]
      let fullContent = ''

      for await (const chunk of streamChat(fullMessages, {
        role: options?.role,
        template: options?.template,
        model: options?.model,
      })) {
        fullContent += chunk
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: fullContent }
            : msg
        ))
        callbacksRef.current?.updateMessage(assistantMessage.id, fullContent)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('请求已取消')
      } else {
        const errorMessage = err instanceof Error ? err.message : '发生未知错误'
        setError(errorMessage)
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: `错误: ${errorMessage}` }
            : msg
        ))
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [isLoading])

  // 取消请求
  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  // 加载会话消息
  const loadMessages = useCallback((sessionMessages: Message[]) => {
    setMessages(sessionMessages)
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    loadMessages,
    setCallbacks
  }
}