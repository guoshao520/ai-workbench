import { Message, RequestOptions } from '../types'

const API_BASE = '/api'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 流式请求SSE
export async function* streamChat(
  messages: Message[],
  options?: RequestOptions
): AsyncGenerator<string> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      role: options?.role,
      template: options?.template,
      sessionId: options?.sessionId,
      model: options?.model,
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // stream: true 确保多字节字符不会被截断
      buffer += decoder.decode(value, { stream: true })

      // 按 \n\n 分割 SSE 事件
      const events = buffer.split('\n\n')
      // 最后一段可能不完整，留在 buffer 里
      buffer = events.pop() || ''

      for (const event of events) {
        const lines = event.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            // 后端直接发原始文本，不需要 JSON 解析
            yield data
          }
        }
      }
    }

    // 处理 buffer 里剩余的内容
    if (buffer.trim()) {
      const lines = buffer.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data !== '[DONE]') {
            yield data
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// 普通请求
export async function sendChat(
  messages: Message[],
  options?: RequestOptions
): Promise<{ content: string; sessionId: string }> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      role: options?.role,
      template: options?.template,
      sessionId: options?.sessionId
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

// 获取会话列表
export async function getSessions(): Promise<SessionSummary[]> {
  const response = await fetch(`${API_BASE}/sessions`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// 创建新会话
export async function createSession(): Promise<{ id: string; title: string }> {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 获取会话历史消息
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/messages`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export { generateId }
