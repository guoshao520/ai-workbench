import React, { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onCancel?: () => void
  isLoading?: boolean
  disabled?: boolean
  pendingPrompt?: string | null
  onPromptConsumed?: () => void
}

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

  // 收到 prompt 时填入输入框
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
      onSend(input)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [input, isLoading, disabled, onSend])

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

  return (
    <div className="chat-input-container">
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