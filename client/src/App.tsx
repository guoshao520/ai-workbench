import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatArea } from './components/ChatArea'
import { ChatInput } from './components/ChatInput'
import { ToolPanel } from './components/ToolPanel'
import { PromptPanel } from './components/PromptPanel'
import { DraggableButton } from './components/DraggableButton'
import { useChat } from './hooks/useChat'
import { useSessions } from './hooks/useSessions'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toolPanelCollapsed, setToolPanelCollapsed] = useState(true)
  const [promptPanelVisible, setPromptPanelVisible] = useState(false)
  const pendingPromptRef = useRef<string | null>(null)

  const {
    sessions, currentSession, createSession, switchSession,
    deleteSession, addMessage, updateMessage, renameSession
  } = useSessions()

  const {
    messages, isLoading, error, sendMessage, cancelRequest,
    loadMessages, setCallbacks
  } = useChat()

  useEffect(() => {
    setCallbacks({
      addMessage,
      updateMessage,
      getHistory: () => currentSession?.messages || []
    })
  }, [currentSession, addMessage, updateMessage, setCallbacks])

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.messages)
    } else {
      loadMessages([])
    }
  }, [currentSession?.id, loadMessages])

  const handleSendMessage = async (content: string) => {
    if (!currentSession) {
      createSession()
      await new Promise(r => setTimeout(r, 0))
    }
    await sendMessage(content)
  }

  const handleNewChat = () => createSession()
  const handleSelectSession = (id: string) => switchSession(id)
  const handleDeleteSession = (id: string) => deleteSession(id)
  const handleRenameSession = (id: string, title: string) => renameSession(id, title)

  const handlePromptInsert = (template: string) => {
    pendingPromptRef.current = template
    setPromptPanelVisible(false)
  }

  return (
    <div className="app">
      <Header />

      <div className="app-container">
        {!sidebarCollapsed && (
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSession?.id}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        )}

        <main className="main-content">
          <ChatArea messages={messages} isLoading={isLoading} error={error} />
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            onCancel={cancelRequest}
            pendingPrompt={pendingPromptRef.current}
            onPromptConsumed={() => { pendingPromptRef.current = null }}
          />
        </main>

        {!toolPanelCollapsed && <ToolPanel />}
      </div>

      {/* 侧边栏切换 */}
      <button
        className="toggle-sidebar-btn left"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        title={sidebarCollapsed ? '展开' : '收起'}
      >
        {sidebarCollapsed ? '≫' : '≪'}
      </button>

      {/* 可拖拽的 Prompt 按钮 */}
      <DraggableButton
        className="toggle-prompt-btn"
        onClick={() => setPromptPanelVisible(true)}
      >
        📋
      </DraggableButton>

      {/* 工具面板切换 */}
      <button
        className="toggle-sidebar-btn right"
        onClick={() => setToolPanelCollapsed(!toolPanelCollapsed)}
        title={toolPanelCollapsed ? '展开' : '收起'}
      >
        {!toolPanelCollapsed ? '≪' : '≫'}
      </button>

      {/* Prompt 面板 */}
      <PromptPanel
        visible={promptPanelVisible}
        onClose={() => setPromptPanelVisible(false)}
        onInsert={handlePromptInsert}
      />
    </div>
  )
}

export default App