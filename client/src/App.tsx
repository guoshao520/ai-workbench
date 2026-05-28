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
import { getLastSelectedModel, setLastSelectedModel, getRoleName, setRoleName, getToolName, setToolName } from './utils/storage'
import { MODEL_OPTIONS, ROLES, TOOLS } from './constants'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toolPanelCollapsed, setToolPanelCollapsed] = useState(true)
  const [promptPanelVisible, setPromptPanelVisible] = useState(false)
  const pendingPromptRef = useRef<string | null>(null)

  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = getLastSelectedModel()
    if (saved && MODEL_OPTIONS.some(opt => opt.value === saved)) {
      return saved
    }
    return MODEL_OPTIONS[0].value
  })

  const [selectedRole, setSelectedRole] = useState(() => {
    const saved = getRoleName()
    if (saved && ROLES.some(opt => opt.id === saved)) {
      return saved
    }
    return ROLES[0].id
  })

  const [selectedTool, setSelectedTool] = useState(() => {
    const saved = getToolName()
    if (saved && TOOLS.some(opt => opt.id === saved)) {
      return saved
    }
    return TOOLS[0].id
  })

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
    const modelType = getLastSelectedModel()
    const roleName = getRoleName()

    if (!currentSession) {
      createSession()
      await new Promise(r => setTimeout(r, 0))
    }
    const chatConfig = {
      model: modelType,
      role: roleName
    }

    await sendMessage(content, chatConfig)
  }

  const withCancel = <T extends (...args: any[]) => any>(fn: T) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      cancelRequest();
      return fn(...args);
    };
  };

  const handleNewChat = withCancel(createSession);
  const handleSelectSession = withCancel(switchSession);
  const handleDeleteSession = withCancel(deleteSession);
  const handleRenameSession = withCancel(renameSession);

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
            isLoading={isLoading}
            pendingPrompt={pendingPromptRef.current}
            onSend={handleSendMessage}
            onCancel={cancelRequest}
            onPromptConsumed={() => { pendingPromptRef.current = null }}
            selectedModel={selectedModel}
            onModelChange={(val) => {
              setSelectedModel(val)
              setLastSelectedModel(val)
            }}
          />
        </main>

        {!toolPanelCollapsed &&
          <ToolPanel
            selectedRole={selectedRole}
            selectedTool={selectedTool}
            onSelectRole={(val) => {
              setSelectedRole(val)
              setRoleName(val)
              handleNewChat()
            }}
            onSelectTool={(val) => {
              setSelectedTool(val)
              setToolName(val)
            }}
          />}
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