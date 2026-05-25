// Agent服务 - 智能体核心调度器
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolsService } from '../tools/tools.service';
import { LlmService } from '../llm/llm.service';
import { SessionService } from '../session/session.service';
import { RoleManagerService } from '../prompt/role-manager.service';
import { TaskRouterService, RouteDecision } from './task-router.service';
import { Message } from '../session/entities/session.entity';
import { StreamChunk } from '../llm/llm.types';
import { Logger } from '../../utils/logger';

@Injectable()
export class AgentService {
  private readonly logger = new Logger();
  private readonly provider: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolsService: ToolsService,
    private readonly llmService: LlmService,
    private readonly sessionService: SessionService,
    private readonly roleManager: RoleManagerService,
    private readonly taskRouter: TaskRouterService,
  ) {
    this.provider = this.configService.get<string>('llm.provider') || 'deepseek';
  }

  /**
   * 处理用户消息
   * 1. 路由决策
   * 2. 执行计划
   * 3. 返回结果
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    role?: string,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    this.logger.log(`Processing message for session ${sessionId}`, 'AgentService');

    // 1. 获取会话历史
    const history = this.sessionService.getHistory(sessionId);

    // 2. 路由决策
    const decision = await this.taskRouter.route(userMessage, history);
    this.logger.log(`Route decision: ${JSON.stringify(decision)}`, 'AgentService');

    // 3. 根据决策执行
    let response: string;

    if (decision.type === 'llm') {
      // 直接使用 LLM
      response = await this.chatWithLLM(sessionId, userMessage, role, onChunk);
    } else if (decision.type === 'tool') {
      // 使用工具
      const toolResult = await this.executeTool(
        decision.toolName!,
        userMessage,
      );
      response = toolResult;

      // TODO: 如果需要，可以将工具结果传给 LLM 进一步处理
      // response = await this.chatWithLLM(sessionId, `工具结果: ${toolResult}`, role, onChunk);
    } else {
      // both: 先工具后 LLM
      const toolResult = await this.executeTool(decision.toolName!, userMessage);
      const prompt = `用户问题: ${userMessage}\n\n工具分析结果:\n${toolResult}\n\n请根据工具分析结果给出完整的回答和建议。`;
      response = await this.chatWithLLM(sessionId, prompt, role, onChunk);
    }

    return response;
  }

  /**
   * 与 LLM 对话
   */
  async chatWithLLM(
    sessionId: string,
    userMessage: string,
    role?: string,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    // 构建消息列表
    const roleId = role || 'frontend';
    const systemPrompt = this.roleManager.getSystemPrompt(roleId);
    
    const messages: Message[] = [
      { id: '0', role: 'system', content: systemPrompt, timestamp: Date.now() },
      ...this.sessionService.getHistory(sessionId),
      { id: this.generateId(), role: 'user', content: userMessage, timestamp: Date.now() },
    ];

    // 如果有流式回调，使用流式请求
    if (onChunk) {
      await this.llmService.streamChat(
        this.provider,
        messages.map(m => ({ role: m.role, content: m.content })),
        (chunk: StreamChunk) => {
          if (!chunk.done) {
            onChunk(chunk.delta);
          }
        },
      );
      return '[STREAM_COMPLETE]';
    }

    // 非流式请求
    const response = await this.llmService.chat(
      this.provider,
      messages.map(m => ({ role: m.role, content: m.content })),
    );

    return response.content;
  }

  /**
   * 执行工具
   */
  async executeTool(toolName: string, userMessage: string): Promise<string> {
    const tool = this.toolsService.getTool(toolName);
    
    if (!tool) {
      return `未找到工具: ${toolName}`;
    }

    // 从用户消息中提取参数
    const params = this.extractParams(tool, userMessage);

    const result = await this.toolsService.executeTool(toolName, {
      ...params,
      message: userMessage,
    });

    if (result.success) {
      return result.content;
    }

    return `工具执行失败: ${result.content}`;
  }

  /**
   * 从用户消息中提取工具参数
   */
  private extractParams(tool: any, userMessage: string): Record<string, any> {
    const params: Record<string, any> = {};

    // 提取代码块
    const codeBlockMatch = userMessage.match(/```[\s\S]*?```/);
    if (codeBlockMatch) {
      params.code = codeBlockMatch[0];
    }

    // 提取错误信息
    const errorPatterns = [
      /Error:\s*([\s\S]+?)(?:\n|$)/i,
      /Exception:\s*([\s\S]+?)(?:\n|$)/i,
      /TypeError:\s*([\s\S]+?)(?:\n|$)/i,
    ];

    for (const pattern of errorPatterns) {
      const match = userMessage.match(pattern);
      if (match) {
        params.error = match[1];
        break;
      }
    }

    return params;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
