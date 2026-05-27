// LLM服务 - 提供统一的LLM调用接口
import { Injectable, Logger } from '@nestjs/common';
import { Provider } from './provider';
import { Message, ChatOptions, ChatResponse, StreamChunk } from './llm.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger();

  constructor(private readonly Provider: Provider) {}

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
        return this.Provider.chat(messages, options);
      default:
        return this.Provider.chat(messages, options);
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
        return this.Provider.streamChat(messages, onChunk, options);
      default:
        return this.Provider.streamChat(messages, onChunk, options);
    }
  }
}
