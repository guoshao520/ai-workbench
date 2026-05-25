// 会话控制器
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionSummary } from './entities/session.entity';

@Controller('api/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * 获取会话列表
   */
  @Get()
  getSessions(): SessionSummary[] {
    return this.sessionService.listSessions();
  }

  /**
   * 创建新会话
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSession(@Body() body: { role?: string }) {
    const session = this.sessionService.createSession(body.role);
    return {
      id: session.id,
      title: session.title,
    };
  }

  /**
   * 删除会话
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSession(@Param('id') id: string) {
    this.sessionService.deleteSession(id);
  }

  /**
   * 获取会话历史消息
   */
  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.sessionService.getHistory(id);
  }
}
