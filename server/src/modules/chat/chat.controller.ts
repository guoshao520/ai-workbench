// Chat控制器 - 处理聊天请求和SSE
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { SessionService } from '../session/session.service';

// 消息类型
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestDto {
  messages: Message[];    // 前端传的是消息历史列表
  sessionId?: string;
  role?: string;
  template?: string;
  model?: string;
}

@Controller('api')
export class ChatController {
  private readonly logger = new Logger();

  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * POST /api/chat - 流式聊天
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async streamChat(
    @Body() body: ChatRequestDto,
    @Res() res: Response,
  ) {
    const { messages, sessionId, role, template, model } = body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    // 获取或创建会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = this.sessionService.createSession(role);
      currentSessionId = session.id;
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

    // 确保连接不被关闭
    res.flushHeaders();

    try {
      // 流式处理 - 传入完整消息历史
      await this.chatService.handleStreamChat(
        currentSessionId,
        messages,
        role,
        (chunk: string) => {
          const escaped = chunk.replace(/\n/g, '\u001F')
          res.write(`data: ${escaped}\n\n`)
        },
        { model } 
      );

      // 发送完成信号
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      this.logger.error('Stream chat error', error.stack, 'ChatController');
      res.write(`data: [ERROR] ${error.message}\n\n`);
      res.end();
    }
  }

  /**
   * POST /api/chat/sync - 同步聊天（非流式）
   */
  @Post('chat/sync')
  @HttpCode(HttpStatus.OK)
  async syncChat(@Body() body: ChatRequestDto) {
    const { messages, sessionId, role, template } = body;

    if (!messages || messages.length === 0) {
      return { success: false, error: 'Messages are required' };
    }

    // 获取或创建会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = this.sessionService.createSession(role);
      currentSessionId = session.id;
    }

    const result = await this.chatService.handleChat(
      currentSessionId,
      messages,    // 传完整消息历史
      role,
    );

    return {
      success: true,
      ...result,
    };
  }
}
