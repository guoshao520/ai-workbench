import React from 'react'
import { ROLES, TOOLS } from '../constants'

interface ToolPanelProps {
  selectedRole?: string
  selectedTool?: string
  onSelectRole?: (roleId: string) => void
  onSelectTool?: (toolId: string) => void
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedRole,
  selectedTool,
  onSelectRole,
  onSelectTool
}) => {
  return (
    <div className="tool-panel">
      <div className="panel-section">
        <h3 className="panel-title">
          <span>👤</span> 角色切换
        </h3>
        <div className="role-list">
          {ROLES.map(role => (
            <button
              key={role.id}
              className={`role-item ${selectedRole === role.id ? 'active' : ''}`}
              onClick={() => onSelectRole?.(role.id)}
            >
              <span className="role-icon">{role.icon}</span>
              <span className="role-name">{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-title">
          <span>🛠️</span> 内置工具【暂未开发】
        </h3>
        <div className="tool-list">
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              className={`role-item ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => {
                if (tool.id !== '代码生成') {
                  alert("暂未开发")
                  return
                }
                onSelectTool?.(tool.id)
              }}
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
    </div>
  )
}