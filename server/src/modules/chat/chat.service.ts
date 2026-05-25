// Chat服务
import { Injectable, Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { AgentService } from '../agent/agent.service';

// 消息类型
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger();

  constructor(
    private readonly sessionService: SessionService,
    private readonly agentService: AgentService,
  ) {}

  /**
   * 处理聊天消息 - 流式响应
   */
  async handleStreamChat(
    sessionId: string,
    messages: Message[],    // 接收完整消息历史
    role?: string,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    this.logger.log(`Handling stream chat for session ${sessionId}`, 'ChatService');

    // 确保 session 存在
    let activeSession = this.sessionService.getSession(sessionId);
    if (!activeSession) {
      activeSession = this.sessionService.createSession(role);
      sessionId = activeSession.id;
    }

    // 1. 同步历史消息到会话（过滤掉 system 消息，避免重复添加）
    for (const msg of messages) {
      if (msg.role !== 'system') {
        // 检查是否已存在，避免重复
        const exists = activeSession.messages.some(
          m => m.content === msg.content && m.role === msg.role
        );
        if (!exists) {
          this.sessionService.addMessage(sessionId, {
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      }
    }

    // 2. 获取最后一条用户消息
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // 3. 创建助手消息占位
    const assistantMessage = this.sessionService.addMessage(sessionId, {
      role: 'assistant',
      content: '',
    });

    if (!assistantMessage) {
      throw new Error('Failed to create assistant message');
    }

    // 4. 调用 Agent 处理
    let fullContent = '';
    
    await this.agentService.processMessage(
      sessionId,
      lastUserMessage.content,    // 只传最后一条用户消息
      role,
      (chunk: string) => {
        fullContent += chunk;
        // 更新助手消息
        this.sessionService.updateAssistantMessage(
          sessionId,
          assistantMessage.id,
          fullContent,
        );
        // 发送 chunk
        onChunk?.(chunk);
      },
    );

    return fullContent;
  }

  /**
   * 处理聊天消息 - 非流式响应
   */
  async handleChat(
    sessionId: string,
    messages: Message[],    // 接收完整消息历史
    role?: string,
  ): Promise<{ content: string; sessionId: string }> {
    this.logger.log(`Handling chat for session ${sessionId}`, 'ChatService');

    // 确保 session 存在
    let activeSession = this.sessionService.getSession(sessionId);
    if (!activeSession) {
      activeSession = this.sessionService.createSession(role);
      sessionId = activeSession.id;
    }

    // 同步历史消息
    for (const msg of messages) {
      if (msg.role !== 'system') {
        const exists = activeSession.messages.some(
          m => m.content === msg.content && m.role === msg.role
        );
        if (!exists) {
          this.sessionService.addMessage(sessionId, {
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      }
    }

    // 获取最后一条用户消息
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // 调用 Agent 处理
    const content = await this.agentService.processMessage(
      sessionId,
      lastUserMessage.content,
      role,
    );

    // 添加助手消息到会话
    this.sessionService.addMessage(sessionId, {
      role: 'assistant',
      content,
    });

    return { content, sessionId };
  }
}
