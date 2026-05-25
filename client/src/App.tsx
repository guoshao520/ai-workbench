import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatArea } from './components/ChatArea'
import { ChatInput } from './components/ChatInput'
import { ToolPanel } from './components/ToolPanel'
import { useChat } from './hooks/useChat'
import { useSessions } from './hooks/useSessions'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [toolPanelCollapsed, setToolPanelCollapsed] = useState(false)

  const {
    sessions,
    currentSession,
    createSession,
    switchSession,
    deleteSession,
    addMessage,
    updateMessage,
    renameSession
  } = useSessions()

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    loadMessages,
    setCallbacks
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

  const handleNewChat = () => {
    createSession()
  }

  const handleSelectSession = (sessionId: string) => {
    switchSession(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }

  const handleRenameSession = (sessionId: string, title: string) => {
    renameSession(sessionId, title)
  };

  return (
    <div className="app">
      <Header />
      <div className="app-container">
        {sidebarCollapsed && <Sidebar
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
        />}
        <button
          className="collapse-btn sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={!sidebarCollapsed ? '展开' : '收起'}
        >
          {!sidebarCollapsed ? '≫' : '≪'}
        </button>

        <main className="main-content">
          <ChatArea messages={messages} isLoading={isLoading} error={error} />
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} onCancel={cancelRequest} />
        </main>

        <button
          className="collapse-btn tool-toggle"
          onClick={() => setToolPanelCollapsed(!toolPanelCollapsed)}
          title={!toolPanelCollapsed ? '展开' : '收起'}
        >
          {!toolPanelCollapsed ? '≪' : '≫'}
        </button>
        {toolPanelCollapsed && <ToolPanel collapsed={toolPanelCollapsed} />}
      </div>
    </div>
  )
}

export default App