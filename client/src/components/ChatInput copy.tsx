import React, { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react'
import { MODEL_OPTIONS } from '../constants'

interface ChatInputProps {
  onSend: (message: string, model: string) => void
  onCancel?: () => void
  isLoading?: boolean
  disabled?: boolean
  pendingPrompt?: string | null
  onPromptConsumed?: () => void
  selectedModel: string
  onModelChange: (value: string) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
  pendingPrompt,
  onPromptConsumed,
  selectedModel,
  onModelChange,
}) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动填充快捷模板
  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt)
      onPromptConsumed?.()
      textareaRef.current?.focus()
    }
  }, [pendingPrompt, onPromptConsumed])

  // 输入框高度自适应
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [])

  // 发送
  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input, selectedModel)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [input, selectedModel, isLoading, disabled, onSend])

  // 手动插入换行符
  const insertNewline = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = input
    
    // 在光标位置插入换行符
    const newValue = value.substring(0, start) + '\n' + value.substring(end)
    setInput(newValue)

    // 恢复光标位置到换行符之后
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1
      adjustHeight()
    })
  }, [input, adjustHeight])

  // 键盘事件处理：Enter 发送，Ctrl+Enter 换行
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl + Enter: 换行
        e.preventDefault()
        insertNewline()
      } else {
        // Enter: 发送
        e.preventDefault()
        handleSend()
      }
    }
  }, [handleSend, insertNewline])

  // 输入变化
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustHeight()
  }, [adjustHeight])

  return (
    <div className="chat-input-container">
      <div className="chat-input-model">
        <span>选择模型：</span>
        <select
          className="chat-input-select"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
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
          placeholder="输入消息，Enter 发送，Ctrl+Enter 换行..."
          disabled={disabled || isLoading}
          rows={3}
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