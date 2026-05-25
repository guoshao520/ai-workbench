import React, { useState, useRef } from 'react'
import { Session } from '../types'

interface SidebarProps {
  sessions: Session[]
  currentSessionId?: string
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession?: (sessionId: string, title: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const clickCountRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  const groupSessions = (sessions: Session[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 86400000
    const weekAgo = today - 7 * 86400000

    const groups: { label: string; sessions: Session[] }[] = [
      { label: '今天', sessions: [] },
      { label: '昨天', sessions: [] },
      { label: '最近7天', sessions: [] },
      { label: '更早', sessions: [] },
    ]

    sessions.forEach(session => {
      const t = session.updatedAt
      if (t >= today) groups[0].sessions.push(session)
      else if (t >= yesterday) groups[1].sessions.push(session)
      else if (t >= weekAgo) groups[2].sessions.push(session)
      else groups[3].sessions.push(session)
    })

    return groups.filter(g => g.sessions.length > 0)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const handleDoubleClick = (session: Session) => {
    if (!onRenameSession) return
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const handleRenameSubmit = (sessionId: string) => {
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(sessionId, editTitle.trim())
    }
    setEditingId(null)
  }

  const handleItemClick = (id: string) => {
    if(editingId) return
    clickCountRef.current += 1
    if(timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      if(clickCountRef.current === 1){
        onSelectSession(id)
      }
      clickCountRef.current = 0
    }, 250)
  }

  const sessionGroups = groupSessions(sessions)

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <button className="new-chat-btn" onClick={onNewChat}>
            <span className="btn-icon">✚</span>
            <span>新建对话</span>
          </button>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? '展开' : '收起'}
        >
          {collapsed ? '≫' : '≪'}
        </button>
      </div>

      {!collapsed && (
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">
              <p>暂无会话</p>
              <p className="hint">点击上方按钮开始新对话</p>
            </div>
          ) : (
            sessionGroups.map(group => (
              <div key={group.label} className="session-group">
                <div className="group-label">{group.label}</div>
                {group.sessions.map(session => (
                  <div
                    key={session.id}
                    className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
                    onClick={() => handleItemClick(session.id)}
                    onMouseEnter={() => setHoveredId(session.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onDoubleClick={() => handleDoubleClick(session)}
                  >
                    <div className="session-icon">💬</div>
                    <div className="session-info">
                      {editingId === session.id ? (
                        <input
                          className="rename-input"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={() => handleRenameSubmit(session.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameSubmit(session.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="session-title">{session.title}</div>
                          <div className="session-meta">
                            <span className="session-count">{session.messages.length} 条消息</span>
                            <span className="session-time">{formatTime(session.updatedAt)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {(hoveredId === session.id || session.id === currentSessionId) && editingId !== session.id && (
                      <button
                        className="delete-btn"
                        onClick={e => {
                          e.stopPropagation()
                          onDeleteSession(session.id)
                        }}
                        title="删除会话"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      <div className="sidebar-footer">
        {!collapsed && <div className="session-count-total">{sessions.length} 个会话</div>}
      </div>
    </aside>
  )
}