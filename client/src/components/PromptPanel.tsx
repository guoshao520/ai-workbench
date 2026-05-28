import React, { useState, useEffect, useRef } from 'react'
import { getRealList } from '../services/api'
import { mockPromptData } from '../utils/mockPrompt'

interface PromptPanelProps {
  visible: boolean
  onClose: () => void
  onInsert: (prompt: string) => void
}

interface Prompt {
  id: string
  title: string
  desc: string
  description: string,
  speechTechnique: string,
}

interface PromptCategory {
  id: string
  name: string
  icon: string
  prompts: Prompt[]
}

const USE_MOCK = true

export const PromptPanel: React.FC<PromptPanelProps> = ({ visible, onClose, onInsert }) => {
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [categoryPrompts, setCategoryPrompts] = useState<Prompt[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // 加载分类列表数据
  useEffect(() => {
    if (!visible) return
    setLoading(true)

    if (USE_MOCK) {
      setPromptCategories(mockPromptData)
      if (mockPromptData.length > 0) {
        setActiveCategory(mockPromptData[0].id)
      }
      setLoading(false)
      return
    }

    getRealList('分类列表')
      .then(({ data }) => {
        console.log('分类列表:', data.data)
        const list = data.data || []
        if (list.length > 0) {
          setActiveCategory(list[0].id)
          setPromptCategories(list)
        }
      })
      .catch(err => {
        console.error('加载分类列表失败:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [visible])

  // 加载当前分类下的 prompts
  useEffect(() => {
    if (!visible || !activeCategory) return
    const currentCategory = promptCategories.find(c => c.id === activeCategory)
    if (!currentCategory) return
    
    setLoadingPrompts(true)

    if (USE_MOCK) {
      setCategoryPrompts(currentCategory.prompts || [])
      setLoadingPrompts(false)
      return
    }
    
    getRealList(currentCategory.title)
      .then(({ data }) => {
        console.log('分类 prompts:', data.data)
        setCategoryPrompts(data.data || [])
      })
      .catch(err => {
        console.error('加载 prompts 失败:', err)
        setCategoryPrompts([])
      })
      .finally(() => {
        setLoadingPrompts(false)
      })
  }, [visible, activeCategory, promptCategories])

  // ESC 关闭
  useEffect(() => {
    if (!visible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, onClose])

  // 点击遮罩关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!visible) return null

  const filteredPrompts = categoryPrompts.filter(
    p => !searchText ||
      p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchText.toLowerCase())
  ) || []

  const allFiltered = searchText
    ? promptCategories.flatMap(cat =>
        cat.prompts
          .filter(p =>
            p.title.toLowerCase().includes(searchText.toLowerCase()) ||
            p.desc.toLowerCase().includes(searchText.toLowerCase()) ||
            p.description.toLowerCase().includes(searchText.toLowerCase()) ||
            p.speechTechnique.toLowerCase().includes(searchText.toLowerCase())
          )
          .map(p => ({ ...p, categoryName: cat.name, categoryIcon: cat.icon }))
      )
    : []

  return (
    <div className="prompt-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="prompt-modal">
        {/* 头部 */}
        <div className="prompt-modal-header">
          <h3>📋 Prompt 模板库</h3>
          <button className="prompt-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* 搜索 */}
        <div className="prompt-modal-search">
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="prompt-search-input"
            autoFocus
          />
        </div>

        {/* 加载状态 */}
        {(loading || loadingPrompts) && <div className="prompt-loading">加载中...</div>}

        {/* 分类标签 */}
        {!searchText && !loading && (
          <div className="prompt-categories">
            {promptCategories.map(cat => (
              <button
                key={cat.id}
                className={`prompt-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {/* <span>{cat.icon}</span> */}
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* 列表 */}
        <div className="prompt-modal-list">
          {!loading && !loadingPrompts && (searchText ? (
            allFiltered.length > 0 ? (
              allFiltered.map(prompt => (
                <div
                  key={prompt.id}
                  className="prompt-card"
                  onClick={() => onInsert(prompt.description)}
                >
                  <div className="prompt-card-header">
                    <span className="prompt-card-icon">{prompt.categoryIcon}</span>
                    <span className="prompt-card-title">{prompt.title}</span>
                  </div>
                  <div className="prompt-card-desc">{prompt.desc}</div>
                  <div className="prompt-card-tag">{prompt.categoryName}</div>
                </div>
              ))
            ) : (
              <div className="prompt-empty">未找到匹配的模板</div>
            )
          ) : (
            filteredPrompts.map(prompt => (
              <div
                key={prompt.id}
                className="prompt-card"
                onClick={() => onInsert(prompt.speechTechnique)}
              >
                <div className="prompt-card-title">{prompt.title}</div>
                <div className="prompt-card-desc">{prompt.desc}</div>
                <div className="prompt-card-preview">
                  {prompt.description.slice(0, 80)}...
                </div>
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  )
}