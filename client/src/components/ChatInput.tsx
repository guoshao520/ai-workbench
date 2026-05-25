// 输入框组件

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onCancel?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false
}) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [])

  // 发送消息
  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [input, isLoading, disabled, onSend])

  // 键盘事件
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // 输入事件
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustHeight()
  }, [adjustHeight])

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Shift+Enter 换行, Enter 发送)"
          disabled={disabled || isLoading}
          rows={1}
        />
        <div className="chat-input-actions">
          {isLoading ? (
            <button 
              className="cancel-btn"
              onClick={onCancel}
              title="取消"
            >
              ⏹️
            </button>
          ) : (
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              title="发送"
            >
              ➤
            </button>
          )}
        </div>
      </div>
      <div className="input-hint">
        <span>按 Enter 发送，Shift + Enter 换行</span>
      </div>
    </div>
  )
}
