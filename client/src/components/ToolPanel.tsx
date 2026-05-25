// 工具面板组件

import React from 'react'
import { Tool } from '../types'

interface ToolPanelProps {
  onSelectTool?: (toolId: string) => void
}

const TOOLS: Tool[] = [
  {
    id: 'code-generator',
    name: '代码生成',
    description: '生成React组件、工具函数等代码',
    icon: '💻'
  },
  {
    id: 'doc-generator',
    name: '文档生成',
    description: '生成接口文档、README等',
    icon: '📄'
  },
  {
    id: 'error-analyzer',
    name: '错误分析',
    description: '分析错误日志并提供解决方案',
    icon: '🔍'
  },
  {
    id: 'file-processor',
    name: '文件处理',
    description: '处理和转换文件内容',
    icon: '📁'
  }
]

const ROLES = [
  { id: 'frontend', name: '前端工程师', icon: '🎨' },
  { id: 'backend', name: '后端工程师', icon: '⚙️' },
  { id: 'fullstack', name: '全栈工程师', icon: '🚀' },
  { id: 'devops', name: 'DevOps工程师', icon: '🔧' }
]

const TEMPLATES = [
  { id: 'code-review', name: '代码审查', icon: '👀' },
  { id: 'bug-fix', name: 'Bug修复', icon: '🐛' },
  { id: 'api-doc', name: 'API文档', icon: '📋' },
  { id: 'file-explain', name: '代码解释', icon: '📖' }
]

export const ToolPanel: React.FC<ToolPanelProps> = ({ onSelectTool }) => {
  return (
    <aside className="tool-panel">
      <div className="panel-section">
        <h3 className="panel-title">
          <span>🛠️</span> 内置工具
        </h3>
        <div className="tool-list">
          {TOOLS.map(tool => (
            <div 
              key={tool.id}
              className="tool-item"
              onClick={() => onSelectTool?.(tool.id)}
            >
              <span className="tool-icon">{tool.icon}</span>
              <div className="tool-info">
                <div className="tool-name">{tool.name}</div>
                <div className="tool-desc">{tool.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-title">
          <span>👤</span> 角色切换
        </h3>
        <div className="role-list">
          {ROLES.map(role => (
            <button key={role.id} className="role-item">
              <span className="role-icon">{role.icon}</span>
              <span className="role-name">{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-title">
          <span>📝</span> 快捷模板
        </h3>
        <div className="template-list">
          {TEMPLATES.map(template => (
            <button key={template.id} className="template-item">
              <span className="template-icon">{template.icon}</span>
              <span className="template-name">{template.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
