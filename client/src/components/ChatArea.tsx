// 聊天主区域组件

import React, { useRef, useEffect } from 'react'
import { Message } from '../types'
import { ChatMessage } from './ChatMessage'

interface ChatAreaProps {
  messages: Message[]
  isLoading?: boolean
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isLoading = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 欢迎消息
  const welcomeMessage = messages.length === 0 && !isLoading

  return (
    <div className="chat-area" ref={containerRef}>
      {welcomeMessage && (
        <div className="welcome">
          <div className="welcome-icon">🤖</div>
          <h1 className="welcome-title">欢迎使用 SynthCode</h1>
          <p className="welcome-subtitle">
            我是您的智能前端开发助手，可以帮助您：
          </p>
          <ul className="welcome-features">
            <li>💻 生成高质量的前端代码</li>
            <li>📄 生成接口文档和注释</li>
            <li>🔍 分析错误日志并提供解决方案</li>
            <li>📁 处理和转换文件</li>
            <li>💬 解答技术问题</li>
          </ul>
          <p className="welcome-hint">开始对话吧！</p>
        </div>
      )}
      
      <div className="messages">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            isStreaming={isLoading && message.id === messages[messages.length - 1]?.id}
          />
        ))}
      </div>
      
      {isLoading && messages.length > 0 && (
        <div className="loading-indicator">
          <span>思考中...</span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
