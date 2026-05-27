import React, { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react'
import { getLastSelectedModel, setLastSelectedModel } from '../utils/storage'

interface ChatInputProps {
  onSend: (message: string, model: string) => void
  onCancel?: () => void
  isLoading?: boolean
  disabled?: boolean
  pendingPrompt?: string | null
  onPromptConsumed?: () => void
}

// 模型列表
const MODEL_OPTIONS = [
  { value: 'deepseek-ai/DeepSeek-V4-Pro', label: 'DeepSeek V4 Pro' },
  { value: 'Pro/zai-org/GLM-4.7', label: 'GLM-4.7 🚀' },
  { value: 'Pro/zai-org/GLM-5', label: 'GLM-5 🔥' },
]

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
  pendingPrompt,
  onPromptConsumed
}) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = getLastSelectedModel()
    if (saved && MODEL_OPTIONS.some(opt => opt.value === saved)) {
      return saved
    }
    return MODEL_OPTIONS[0].value
  })

  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt)
      onPromptConsumed?.()
      textareaRef.current?.focus()
    }
  }, [pendingPrompt, onPromptConsumed])

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [])

  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input, selectedModel)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [input, selectedModel, isLoading, disabled, onSend])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustHeight()
  }, [adjustHeight])

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    setLastSelectedModel(value)
  }

  return (
    <div className="chat-input-container">
      {/* === 模型选择器（带美观样式）=== */}
      <div className="chat-input-model">
        <span>选择模型：</span>
        <select
          className="chat-input-select"
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={isLoading || disabled}
          onFocus={(e) => {
            e.target.style.borderColor = '#0070f0'
            e.target.style.boxShadow = '0 0 0 2px rgba(0,112,240,0.15)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0'
            e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          {MODEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
          disabled={disabled || isLoading}
          rows={8}
        />
        <div className="chat-input-actions">
          {isLoading ? (
            <button className="cancel-btn" onClick={onCancel} title="取消">
              ⏹
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
    </div>
  )
}