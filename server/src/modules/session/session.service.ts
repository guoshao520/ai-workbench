// 会话服务
import { Injectable, Logger } from '@nestjs/common';
import { Session, Message, SessionSummary } from './entities/session.entity';

@Injectable()
export class SessionService {
  private readonly logger = new Logger();
  private sessions: Map<string, Session> = new Map();

  /**
   * 创建新会话
   */
  createSession(role?: string): Session {
    const id = this.generateId();
    const now = Date.now();
    
    const session: Session = {
      id,
      title: '新对话',
      role: role || 'frontend',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    this.sessions.set(id, session);
    this.logger.log(`Session created: ${id}`, 'SessionService');
    
    return session;
  }

  /**
   * 获取会话
   */
  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /**
   * 获取会话列表摘要
   */
  listSessions(): SessionSummary[] {
    const summaries: SessionSummary[] = [];
    
    this.sessions.forEach((session) => {
      summaries.push({
        id: session.id,
        title: session.title,
        role: session.role,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
      });
    });

    // 按更新时间倒序
    return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * 添加消息到会话
   */
  addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const newMessage: Message = {
      id: this.generateId(),
      ...message,
      timestamp: Date.now(),
    };

    session.messages.push(newMessage);
    session.updatedAt = Date.now();

    // 如果是用户消息且是第一条，更新标题
    if (message.role === 'user' && session.messages.length === 1) {
      session.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
    }

    this.logger.log(`Message added to session ${sessionId}`, 'SessionService');
    
    return newMessage;
  }

  /**
   * 获取会话历史消息
   */
  getHistory(sessionId: string, limit?: number): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    const messages = session.messages;
    if (limit) {
      return messages.slice(-limit);
    }
    return messages;
  }

  /**
   * 删除会话
   */
  deleteSession(id: string): boolean {
    const result = this.sessions.delete(id);
    if (result) {
      this.logger.log(`Session deleted: ${id}`, 'SessionService');
    }
    return result;
  }

  /**
   * 更新助手消息内容
   */
  updateAssistantMessage(sessionId: string, messageId: string, content: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const message = session.messages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant') {
      return false;
    }

    message.content = content;
    session.updatedAt = Date.now();
    
    return true;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
