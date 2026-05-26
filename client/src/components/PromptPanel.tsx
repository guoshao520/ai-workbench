import React, { useState, useEffect, useRef } from 'react'

interface PromptPanelProps {
  visible: boolean
  onClose: () => void
  onInsert: (prompt: string) => void
}

const PROMPT_CATEGORIES = [
  {
    id: 'code-gen',
    name: '代码生成',
    icon: '💻',
    prompts: [
      {
        id: 'react-component',
        title: 'React 组件',
        desc: '生成带 TypeScript 的 React 函数组件',
        template: '请帮我生成一个 React 函数组件 {componentName}，要求：\n1. 使用 TypeScript\n2. 支持 Props 类型定义\n3. 包含基本的样式处理\n4. 导出默认组件',
      },
      {
        id: 'vue-component',
        title: 'Vue 组件',
        desc: '生成 Vue3 Composition API 组件',
        template: '请帮我生成一个 Vue3 组件 {componentName}，要求：\n1. 使用 Composition API + TypeScript\n2. 使用 defineProps 和 defineEmits\n3. 包含 ref/reactive 状态管理\n4. 使用 <script setup> 语法',
      },
      {
        id: 'api-service',
        title: 'API 请求封装',
        desc: '生成 axios 请求封装和接口类型',
        template: '请帮我封装一个 {moduleName} 模块的 API 请求，要求：\n1. 使用 axios 封装\n2. 定义请求和响应的 TypeScript 类型\n3. 包含 GET/POST/PUT/DELETE 方法\n4. 统一错误处理',
      },
      {
        id: 'hook',
        title: '自定义 Hook',
        desc: '生成 React 自定义 Hook',
        template: '请帮我写一个 {hookName} 的 React 自定义 Hook，要求：\n1. 使用 TypeScript\n2. 返回类型明确\n3. 处理加载状态和错误状态\n4. 支持依赖更新',
      },
    ],
  },
  {
    id: 'code-quality',
    name: '代码质量',
    icon: '🔍',
    prompts: [
      {
        id: 'code-review',
        title: '代码审查',
        desc: '审查代码质量和潜在问题',
        template: '请帮我审查以下代码，从以下维度分析：\n1. 代码规范和可读性\n2. 性能优化点\n3. 潜在的 Bug 和边界情况\n4. 类型安全性\n5. 最佳实践建议\n\n代码如下：\n```\n{code}\n```',
      },
      {
        id: 'refactor',
        title: '代码重构',
        desc: '重构代码提升可维护性',
        template: '请帮我重构以下代码，要求：\n1. 提升可读性和可维护性\n2. 减少重复代码\n3. 优化性能\n4. 遵循 SOLID 原则\n5. 保留原有功能不变\n\n代码如下：\n```\n{code}\n```',
      },
      {
        id: 'bug-fix',
        title: 'Bug 修复',
        desc: '分析并修复代码中的 Bug',
        template: '请帮我分析以下代码中的 Bug：\n1. 定位问题原因\n2. 解释为什么会出现这个问题\n3. 提供修复方案\n4. 给出预防类似问题的建议\n\n问题描述：{bugDescription}\n代码如下：\n```\n{code}\n```',
      },
    ],
  },
  {
    id: 'doc',
    name: '文档生成',
    icon: '📄',
    prompts: [
      {
        id: 'api-doc',
        title: 'API 文档',
        desc: '生成接口文档',
        template: '请帮我为以下接口生成 API 文档，包含：\n1. 接口描述\n2. 请求方法和 URL\n3. 请求参数（Query/Body/Path）\n4. 响应数据结构\n5. 错误码说明\n6. 请求示例\n\n接口信息：\n{apiInfo}',
      },
      {
        id: 'readme',
        title: 'README',
        desc: '生成项目 README 文档',
        template: '请帮我生成一个项目的 README.md，包含：\n1. 项目简介\n2. 技术栈\n3. 快速开始（安装和运行）\n4. 项目结构\n5. 核心功能\n6. 开发指南\n7. 部署说明\n\n项目信息：{projectInfo}',
      },
      {
        id: 'comment',
        title: '代码注释',
        desc: '为代码添加完整注释',
        template: '请帮我为以下代码添加完整的注释，要求：\n1. 函数/方法添加 JSDoc 注释\n2. 关键逻辑添加行内注释\n3. 复杂类型添加说明\n4. 保持代码功能不变\n\n代码如下：\n```\n{code}\n```',
      },
    ],
  },
  {
    id: 'arch',
    name: '架构设计',
    icon: '🏗️',
    prompts: [
      {
        id: 'project-init',
        title: '项目初始化',
        desc: '生成项目初始化方案',
        template: '请帮我设计一个 {projectName} 项目的初始化方案：\n1. 技术栈选型和理由\n2. 目录结构设计\n3. 核心依赖清单\n4. 配置文件方案（ESLint/Prettier/TS）\n5. Git 工作流建议\n6. CI/CD 基础配置',
      },
      {
        id: 'module-design',
        title: '模块设计',
        desc: '设计功能模块架构',
        template: '请帮我设计 {moduleName} 模块的架构：\n1. 模块职责划分\n2. 核心类/接口设计\n3. 数据流向图\n4. 与其他模块的交互方式\n5. 扩展性考虑',
      },
      {
        id: 'perf-optimize',
        title: '性能优化',
        desc: '性能分析和优化方案',
        template: '请帮我分析并优化以下场景的性能：\n1. 现状分析（瓶颈在哪）\n2. 优化方案（短期/长期）\n3. 预期收益\n4. 实施步骤\n5. 监控指标\n\n场景描述：{scenario}',
      },
    ],
  },
  {
    id: 'test',
    name: '测试',
    icon: '🧪',
    prompts: [
      {
        id: 'unit-test',
        title: '单元测试',
        desc: '生成 Jest 单元测试',
        template: '请帮我为以下代码编写单元测试，要求：\n1. 使用 Jest + Testing Library\n2. 覆盖正常流程\n3. 覆盖边界情况\n4. 覆盖错误处理\n5. 目标覆盖率 80%+\n\n代码如下：\n```\n{code}\n```',
      },
      {
        id: 'e2e-test',
        title: 'E2E 测试',
        desc: '生成端到端测试用例',
        template: '请帮我编写 E2E 测试用例，要求：\n1. 使用 Playwright/Cypress\n2. 覆盖核心用户流程\n3. 包含断言验证\n4. 处理异步加载场景\n\n功能描述：{feature}',
      },
    ],
  },
]

export const PromptPanel: React.FC<PromptPanelProps> = ({ visible, onClose, onInsert }) => {
  const [activeCategory, setActiveCategory] = useState(PROMPT_CATEGORIES[0].id)
  const [searchText, setSearchText] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

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

  const currentCategory = PROMPT_CATEGORIES.find(c => c.id === activeCategory)

  const filteredPrompts = currentCategory?.prompts.filter(
    p => !searchText ||
      p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchText.toLowerCase())
  ) || []

  const allFiltered = searchText
    ? PROMPT_CATEGORIES.flatMap(cat =>
        cat.prompts
          .filter(p =>
            p.title.toLowerCase().includes(searchText.toLowerCase()) ||
            p.desc.toLowerCase().includes(searchText.toLowerCase()) ||
            p.template.toLowerCase().includes(searchText.toLowerCase())
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

        {/* 分类标签 */}
        {!searchText && (
          <div className="prompt-categories">
            {PROMPT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`prompt-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 列表 */}
        <div className="prompt-modal-list">
          {searchText ? (
            allFiltered.length > 0 ? (
              allFiltered.map(prompt => (
                <div
                  key={prompt.id}
                  className="prompt-card"
                  onClick={() => onInsert(prompt.template)}
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
                onClick={() => onInsert(prompt.template)}
              >
                <div className="prompt-card-title">{prompt.title}</div>
                <div className="prompt-card-desc">{prompt.desc}</div>
                <div className="prompt-card-preview">
                  {prompt.template.slice(0, 80)}...
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}