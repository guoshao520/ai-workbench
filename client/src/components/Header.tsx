// 头部组件

import React from 'react'

interface HeaderProps {
  title?: string
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'SynthCode' 
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">{title}</span>
        </div>
      </div>
      <div className="header-center">
        <span className="header-subtitle">AI 研发提效平台</span>
      </div>
      <div className="header-right">
        <button className="header-btn" title="设置">
          ⚙️
        </button>
      </div>
    </header>
  )
}
