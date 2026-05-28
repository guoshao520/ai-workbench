import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'

hljs.registerLanguage('vue', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('python', python)

import 'highlight.js/styles/github-dark.css'
import { Message } from '../types'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
})

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 高亮函数：支持流式实时高亮
const highlightCode = (code: string, language: string): string => {
  if (!code) return ''
  try {
    const validLang = hljs.getLanguage(language) ? language : 'plaintext'
    return hljs.highlight(code, { language: validLang, ignoreIllegals: true }).value
  } catch {
    return escapeHtml(code)
  }
}

const CodeBlock: React.FC<{
  code: string
  language: string
  isStreamingCode?: boolean
}> = ({ code, language, isStreamingCode }) => {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevCodeRef = useRef('')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 流式实时高亮：使用防抖优化
  const performHighlight = useCallback((codeToHighlight: string, lang: string) => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }
    
    // 流式时使用更短的延迟，保证实时性
    const delay = isStreamingCode ? 30 : 0
    
    highlightTimerRef.current = setTimeout(() => {
      const result = highlightCode(codeToHighlight, lang)
      setHighlightedHtml(result)
      prevCodeRef.current = codeToHighlight
    }, delay)
  }, [isStreamingCode])

  useEffect(() => {
    // 代码变化时触发高亮
    if (code !== prevCodeRef.current) {
      performHighlight(code, language)
    }
    
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [code, language, performHighlight])

  // 初始化高亮
  useEffect(() => {
    setHighlightedHtml(highlightCode(code, language))
    prevCodeRef.current = code
  }, [])

  return (
    <div className="code-block-container">
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✔️ 已复制' : '📋 复制'}
        </button>
      </div>
      <pre className="code-content">
        <code 
          className={`hljs ${isStreamingCode ? 'streaming' : ''}`} 
          dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
        />
      </pre>
    </div>
  )
}

const parseContent = (content: string, isStreaming: boolean) => {
  const realContent = content.replace(/\u001F/g, '\n')
  const parts: Array<{
    type: 'text' | 'code'
    html?: string
    code?: string
    language?: string
    streaming?: boolean
  }> = []

  let text = ''
  let codeBlockStarted = false
  let codeLang = ''
  let codeContent = ''

  const lines = realContent.split('\n')

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!codeBlockStarted) {
        if (text) {
          parts.push({ type: 'text', html: md.render(text) })
          text = ''
        }
        codeBlockStarted = true
        codeLang = line.slice(3).trim() || 'plaintext'
        codeContent = ''
      } else {
        codeBlockStarted = false
        parts.push({
          type: 'code',
          code: codeContent,
          language: codeLang,
          streaming: false,
        })
        codeContent = ''
      }
    } else if (codeBlockStarted) {
      codeContent += (codeContent ? '\n' : '') + line
    } else {
      text += (text ? '\n' : '') + line
    }
  }

  if (codeBlockStarted) {
    parts.push({
      type: 'code',
      code: codeContent,
      language: codeLang,
      streaming: isStreaming,
    })
  } else if (text) {
    parts.push({ type: 'text', html: md.render(text) })
  }

  return parts
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const content = message.content || ''
  const parts = useMemo(() => parseContent(content, isStreaming), [content, isStreaming])
  const isUser = message.role === 'user'

  // 滚动到底部 - 节流
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => {
      scrollTimerRef.current = null
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 200)

    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [content])

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? <div className="avatar user-avatar">👤</div> : <div className="avatar ai-avatar">🤖</div>}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {parts.map((item, idx) =>
            item.type === 'text' ? (
              <span key={idx} dangerouslySetInnerHTML={{ __html: item.html }} />
            ) : (
              <CodeBlock
                key={idx}
                code={item.code || ''}
                language={item.language || 'plaintext'}
                isStreamingCode={item.streaming}
              />
            )
          )}
          {isStreaming && <span className="typing-cursor">▊</span>}
        </div>
        <div className="message-time">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}