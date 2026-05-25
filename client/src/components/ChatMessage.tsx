import React, { useEffect, useRef, useState, useMemo } from 'react'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Message } from '../types'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// 基础语法修复：补全行尾分号（简单处理）
const quickFixCode = (code: string, language: string): string => {
  // 只对 JS/TS/CSS 这类需要分号的语言做基础修复
  const semicolonLangs = ['javascript', 'js', 'typescript', 'ts', 'css', 'scss', 'less']
  if (!semicolonLangs.includes(language)) return code

  // 简单处理：给不以 } { , : ; 结尾的非空行，尝试补分号
  return code.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return line
    if (trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed.endsWith(',')) {
      return line
    }
    // 行尾加个分号（仅对非注释行生效，粗暴但安全）
    if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.endsWith('*/')) {
      return line + ';'
    }
    return line
  }).join('\n')
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightedCode = useMemo(() => {
    if (!code) return ''
    try {
      // 1. 先做基础语法修复
      const fixedCode = quickFixCode(code, language)
      // 2. 找不到语言自动降级为 plaintext
      const validLang = hljs.getLanguage(language) ? language : 'plaintext'
      // 3. 高亮失败时降级为纯文本（不抛错）
      try {
        return hljs.highlight(fixedCode, { language: validLang }).value
      } catch {
        return hljs.highlight(fixedCode, { language: 'plaintext' }).value
      }
    } catch {
      // 终极兜底：就算全崩了也不挂页面，直接输出原始文本
      return hljs.escape(code)
    }
  }, [code, language])

  return (
    <div className="code-block-container">
      <div className="code-header">
        <span className="code-lang">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✅ 已复制' : '📋 复制'}
        </button>
      </div>
      <pre className="code-content">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  )
}

const parseContent = (content: string) => {
  const realContent = content.replace(/\u001F/g, '\n')
  const parts: any[] = []

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
    })
  } else if (text) {
    parts.push({ type: 'text', html: md.render(text) })
  }

  return parts
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = message.content || ''
    if (!isStreaming) {
      setDisplayedContent(target)
      return
    }

    const interval = setInterval(() => {
      setDisplayedContent((prev) => {
        if (prev.length >= target.length) {
          clearInterval(interval)
          return prev
        }
        return target.slice(0, prev.length + 1)
      })
    }, 16)

    return () => clearInterval(interval)
  }, [message.content, isStreaming])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayedContent])

  const parts = useMemo(() => parseContent(displayedContent), [displayedContent])
  const isUser = message.role === 'user'

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? <div className="avatar user-avatar">👤</div> : <div className="avatar ai-avatar">🤖</div>}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {parts.map((item, idx) =>
            item.type === 'text' ? (
              <div key={idx} dangerouslySetInnerHTML={{ __html: item.html }} />
            ) : (
              <CodeBlock key={idx} code={item.code} language={item.language} />
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