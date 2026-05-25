// 任务路由服务 - 决定使用哪个工具或直接LLM
import { Injectable, Logger } from '@nestjs/common';
import { ToolsService } from '../tools/tools.service';
import { Message } from '../session/entities/session.entity';

export interface RouteDecision {
  type: 'tool' | 'llm' | 'both';
  toolName?: string;
  confidence: number;
  reason: string;
}

@Injectable()
export class TaskRouterService {
  private readonly logger = new Logger();

  constructor(private readonly toolsService: ToolsService) {}

  /**
   * 分析任务，决定使用工具还是直接LLM
   */
  async route(
    userMessage: string,
    context: Message[],
  ): Promise<RouteDecision> {
    this.logger.log(`Routing task for: ${userMessage.slice(0, 50)}...`, 'TaskRouterService');

    // TODO: 分析用户意图
    // 1. 检测是否需要工具
    // 2. 选择合适的工具
    // 3. 决定是否需要工具 + LLM 组合

    // 简单的意图检测逻辑
    const intentPatterns = {
      codeGeneration: [
        /生成.*代码/, /创建.*组件/, /写.*函数/, /帮我写/,
      ],
      errorAnalysis: [
        /报错/, /错误/, /Exception/, /Error:/, /有问题/,
      ],
      documentation: [
        /生成.*文档/, /写.*注释/, /文档/,
      ],
      fileProcessing: [
        /处理.*文件/, /格式化/, /转换/,
      ],
    };

    let detectedIntent = 'general';
    let highestConfidence = 0;

    // 检测代码生成意图
    for (const pattern of intentPatterns.codeGeneration) {
      if (pattern.test(userMessage)) {
        if (0.8 > highestConfidence) {
          detectedIntent = 'codeGeneration';
          highestConfidence = 0.8;
        }
      }
    }

    // 检测错误分析意图
    for (const pattern of intentPatterns.errorAnalysis) {
      if (pattern.test(userMessage)) {
        if (0.85 > highestConfidence) {
          detectedIntent = 'errorAnalysis';
          highestConfidence = 0.85;
        }
      }
    }

    // 检测文档生成意图
    for (const pattern of intentPatterns.documentation) {
      if (pattern.test(userMessage)) {
        if (0.7 > highestConfidence) {
          detectedIntent = 'documentation';
          highestConfidence = 0.7;
        }
      }
    }

    // 根据意图返回路由决策
    switch (detectedIntent) {
      case 'codeGeneration':
        return {
          type: 'llm', // 代码生成直接用LLM
          confidence: highestConfidence,
          reason: '检测到代码生成请求，将使用LLM直接生成',
        };

      case 'errorAnalysis':
        return {
          type: 'tool',
          toolName: 'error-analyzer',
          confidence: highestConfidence,
          reason: '检测到错误分析请求，将使用错误分析工具',
        };

      case 'documentation':
        return {
          type: 'tool',
          toolName: 'doc-generator',
          confidence: highestConfidence,
          reason: '检测到文档生成请求，将使用文档生成工具',
        };

      case 'fileProcessing':
        return {
          type: 'tool',
          toolName: 'file-processor',
          confidence: highestConfidence,
          reason: '检测到文件处理请求，将使用文件处理工具',
        };

      default:
        // 默认使用 LLM
        return {
          type: 'llm',
          confidence: 0.5,
          reason: '通用对话请求，将使用LLM处理',
        };
    }
  }

  /**
   * 决定是否需要先执行工具再调用LLM
   */
  async shouldUseToolFirst(userMessage: string): Promise<boolean> {
    // TODO: 更复杂的决策逻辑
    const toolTriggerKeywords = [
      '分析', '检查', '审查', '检测', '验证',
      '帮我看看', '这是什么错误',
    ];

    for (const keyword of toolTriggerKeywords) {
      if (userMessage.includes(keyword)) {
        return true;
      }
    }

    return false;
  }
}
