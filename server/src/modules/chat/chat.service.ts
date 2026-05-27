// Chat服务
import { Injectable, Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { AgentService } from '../agent/agent.service';
import { fixAICode, fixByAST } from '../../utils/code-fixer';
import { ChatOptions } from '../llm/llm.types';

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
    options?: ChatOptions
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

    let fullContent = '';

    await this.agentService.processMessage(
      sessionId,
      lastUserMessage.content,
      role,
      (chunk: string) => {
        fullContent += chunk;

        // 实时发送原始 chunk，前端能正常渲染
        onChunk?.(chunk);
      },
      options
    );

    // 流结束后，加判断再调用 AST 修复
    let fixedContent = fullContent;

    // 只有非 Vue 代码才调用 fixByAST
    const isVueCode = 
      fullContent.includes('<template>') || 
      fullContent.includes('```vue') ||
      fullContent.includes('<script setup>');

    if (!isVueCode) {
      try {
        fixedContent = fixByAST(fullContent);
      } catch (e) {
        console.error('AST 修复失败，使用原内容:', e);
        fixedContent = fullContent;
      }
    }

    // 只在结束后更新一次数据库
    this.sessionService.updateAssistantMessage(
      sessionId,
      assistantMessage.id,
      fixedContent
    );

    return fixedContent;
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
