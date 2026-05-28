// DeepSeek Provider - 大模型对接基类
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  Message,
  ChatOptions,
  ChatResponse,
  StreamChunk,
  LLMProvider,
} from './llm.types';

@Injectable()
export class Provider implements LLMProvider {
  private readonly logger = new Logger();
  private readonly httpClient: AxiosInstance;
  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    const models = this.configService.get<any[]>('models') || [];
    const apiKey = this.configService.get<string>('llm.apiKey');
    const baseUrl = this.configService.get<string>('llm.baseUrl');

    this.defaultModel = models[0]?.model;
    this.httpClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 120000,
    });
  }

  /**
   * 非流式聊天
   */
  async chat(
    messages: Message[],
    options?: ChatOptions,
  ): Promise<ChatResponse> {
    try {
      // TODO: 根据选择的角色添加系统提示
      const systemMessage = this.buildSystemMessage();
      const fullMessages = systemMessage ? [systemMessage, ...messages] : messages;

      const response = await this.httpClient.post('/chat/completions', {
        model: options?.model || this.defaultModel,
        messages: fullMessages,
        temperature: options?.temperature ?? 0.5,
        max_tokens: options?.max_tokens ?? 4096,
        stream: false,
      });

      const data = response.data;
      return {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage,
      };
    } catch (error) {
      this.logger.error('DeepSeek chat error', error.stack, 'Provider');
      throw error;
    }
  }

  /**
   * 流式聊天
   */
  async streamChat(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void,
    options?: ChatOptions,
  ): Promise<void> {
    try {
      // TODO: 根据选择的角色添加系统提示
      const systemMessage = this.buildSystemMessage(options?.role);
      const fullMessages = systemMessage ? [systemMessage, ...messages] : messages;

      console.log("fullMessages >>>", fullMessages)

      const response = await this.httpClient.post(
        '/chat/completions',
        {
          model: options?.model || this.defaultModel,
          messages: fullMessages,
          temperature: options?.temperature ?? 0.5,
          max_tokens: options?.max_tokens ?? 4096,
          stream: true,
        },
        {
          responseType: 'stream',
        },
      );

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onChunk({ delta: '', done: true });
                resolve();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  onChunk({ delta, done: false });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });

        response.data.on('error', (error: Error) => {
          this.logger.error('Stream error', error.stack, 'Provider');
          reject(error);
        });

        response.data.on('end', () => {
          resolve();
        });
      });
    } catch (error) {
      this.logger.error('DeepSeek stream error', error.stack, 'Provider');
      throw error;
    }
  }

  /**
   * 构建系统消息
   * TODO: 根据用户选择的角色动态构建
   */
  private buildSystemMessage(role?: string): Message | null {
    // TODO: 从Session或请求中获取用户选择的角色
    const nRole = role || 'frontend'; // 默认前端工程师
    
    const ROLES = {
      frontend: '你是一个资深前端开发工程师，擅长React、Vue、TypeScript、HTML、CSS等前端技术栈。请用专业、易懂的方式回答问题。',
      backend: '你是一个资深后端开发工程师，擅长Java、Python等后端技术。请用专业、易懂的方式回答问题。',
      fullstack: '你是一个全栈开发工程师，精通前端和后端技术。请用专业、易懂的方式回答问题。',
      devops: '你是一个DevOps工程师，擅长CI/CD、容器化、云原生等技术。请用专业、易懂的方式回答问题。',
    };

    const systemPrompt = ROLES[nRole as keyof typeof ROLES] || ROLES.frontend;
    
    return {
      role: 'system',
      content: systemPrompt,
    };
  }
}
