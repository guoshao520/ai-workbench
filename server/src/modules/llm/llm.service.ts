// LLM服务 - 提供统一的LLM调用接口
import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekProvider } from './deepseek.provider';
import { Message, ChatOptions, ChatResponse, StreamChunk } from './llm.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger();

  constructor(private readonly deepseekProvider: DeepSeekProvider) {}

  /**
   * 发送聊天请求
   */
  async chat(
    provider: string,
    messages: Message[],
    options?: ChatOptions,
  ): Promise<ChatResponse> {
    this.logger.log(`Chat request to ${provider}`, 'LlmService');

    switch (provider) {
      case 'deepseek':
        return this.deepseekProvider.chat(messages, options);
      default:
        return this.deepseekProvider.chat(messages, options);
    }
  }

  /**
   * 流式聊天请求
   */
  async streamChat(
    provider: string,
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void,
    options?: ChatOptions,
  ): Promise<void> {
    this.logger.log(`Stream chat request to ${provider}`, 'LlmService');

    switch (provider) {
      case 'deepseek':
        return this.deepseekProvider.streamChat(messages, onChunk, options);
      default:
        return this.deepseekProvider.streamChat(messages, onChunk, options);
    }
  }
}
