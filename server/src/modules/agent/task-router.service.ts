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

  // /**
  //  * 分析任务，决定使用工具还是直接LLM
  //  */
  // async route(
  //   userMessage: string,
  //   context: Message[],
  // ): Promise<RouteDecision> {
  //   this.logger.log(`Routing task for: ${userMessage.slice(0, 50)}...`, 'TaskRouterService');

  //   // TODO: 分析用户意图
  //   // 1. 检测是否需要工具
  //   // 2. 选择合适的工具
  //   // 3. 决定是否需要工具 + LLM 组合

  //   // 意图检测逻辑
  //   const intentPatterns = {
  //     codeGeneration: [
  //       /生成.*代码/i, /写.*代码/i, /创建.*组件/i, /写.*函数/i,
  //       /实现.*功能/i, /帮我写/i, /开发.*页面/i, /写一个/i, /生成一个/i,
  //       /封装/i, /重构/i, /优化/i, /修改/i, /改造/i, /抽离/i, /合并/i,
  //       /提取/i, /整理/i, /简化/i, /美化/i, /加一下/i, /加上/i, /补全/i,
  //       /完善/i, /补齐/i, /修复/i, /改成/i, /换成/i, /编写/i, /搭建/i,
  //     ],
  //     errorAnalysis: [
  //       /报错/i, /错误/i, /异常/i, /崩溃/i, /挂了/i, /不生效/i,
  //       /没反应/i, /不起作用/i, /无法/i, /不能/i, /怎么回事/i,
  //       /为什么/i, /Exception/i, /Error:/i, /有问题/i, /坏了/i,
  //     ],
  //     documentation: [
  //       /生成.*文档/i, /写.*注释/i, /加注释/i, /解释一下/i, /说明/i,
  //       /文档/i, /注释/i, /解读/i, /分析/i,
  //     ],
  //     fileProcessing: [
  //       /处理.*文件/i, /格式化/i, /转换/i, /解析/i, /读取.*文件/i,
  //       /写入/i, /导出/i, /导入/i, /上传/i, /下载/i,
  //     ],
  //   };

  //   let detectedIntent = 'general';
  //   let highestConfidence = 0;

  //   // 检测代码生成意图
  //   for (const pattern of intentPatterns.codeGeneration) {
  //     if (pattern.test(userMessage)) {
  //       if (0.9 > highestConfidence) {
  //         detectedIntent = 'codeGeneration';
  //         highestConfidence = 0.9;
  //       }
  //     }
  //   }

  //   // 检测错误分析意图
  //   for (const pattern of intentPatterns.errorAnalysis) {
  //     if (pattern.test(userMessage)) {
  //       if (0.95 > highestConfidence) {
  //         detectedIntent = 'errorAnalysis';
  //         highestConfidence = 0.95;
  //       }
  //     }
  //   }

  //   // 检测文档生成意图
  //   for (const pattern of intentPatterns.documentation) {
  //     if (pattern.test(userMessage)) {
  //       if (0.7 > highestConfidence) {
  //         detectedIntent = 'documentation';
  //         highestConfidence = 0.7;
  //       }
  //     }
  //   }

  //   // 检测文件处理意图
  //   for (const pattern of intentPatterns.fileProcessing) {
  //     if (pattern.test(userMessage)) {
  //       if (0.75 > highestConfidence) {
  //         detectedIntent = 'fileProcessing';
  //         highestConfidence = 0.75;
  //       }
  //     }
  //   }

  //   // 根据意图返回路由决策
  //   switch (detectedIntent) {
  //     case 'codeGeneration':
  //       return {
  //         type: 'llm', // 代码生成直接用LLM
  //         confidence: highestConfidence,
  //         reason: '检测到代码生成请求，将使用LLM直接生成',
  //       };

  //     case 'errorAnalysis':
  //       return {
  //         type: 'tool',
  //         toolName: 'error-analyzer',
  //         confidence: highestConfidence,
  //         reason: '检测到错误分析请求，将使用错误分析工具',
  //       };

  //     case 'documentation':
  //       return {
  //         type: 'tool',
  //         toolName: 'doc-generator',
  //         confidence: highestConfidence,
  //         reason: '检测到文档生成请求，将使用文档生成工具',
  //       };

  //     case 'fileProcessing':
  //       return {
  //         type: 'tool',
  //         toolName: 'file-processor',
  //         confidence: highestConfidence,
  //         reason: '检测到文件处理请求，将使用文件处理工具',
  //       };

  //     default:
  //       // 默认使用 LLM
  //       return {
  //         type: 'llm',
  //         confidence: 0.5,
  //         reason: '通用对话请求，将使用LLM处理',
  //       };
  //   }
  // }

  async route(
    userMessage: string,
    context: Message[],
  ): Promise<RouteDecision> {
    this.logger.log(`Routing task for: ${userMessage.slice(0, 50)}...`, 'TaskRouterService');

    // 目前只处理llm
    return {
      type: 'llm',
      confidence: 0.9,
      reason: '检测到代码生成请求，将使用LLM直接生成',
    };
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
