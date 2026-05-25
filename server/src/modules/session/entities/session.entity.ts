// 会话实体
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  role: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface SessionSummary {
  id: string;
  title: string;
  role: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}
