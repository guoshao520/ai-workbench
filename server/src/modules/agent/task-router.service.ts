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

  constructor(private readonly toolsService: ToolsService) { }

  /**
   * 分析任务，决定使用哪个工具或直接LLM
   */
  async route(
    userMessage: string,
    context: Message[],
  ): Promise<RouteDecision> {
    this.logger.log(`Routing task for: ${userMessage.slice(0, 50)}...`, 'TaskRouterService');

    const intentPatterns = {
      // 代码生成（最高优先级）
      codeGeneration: [
        /生成.*代码/i,
        /写.*代码/i,
        /创建.*组件/i,
        /写.*函数/i,
        /实现.*功能/i,
        /帮我写/i,
        /开发.*页面/i,
        /写一个/i,
        /生成一个/i,
        /封装/i,
        /重构/i,
        /优化/i,
        /修改/i,
        /改造/i,
        /抽离/i,
        /合并/i,
        /提取/i,
        /整理/i,
        /简化/i,
        /美化/i,
        /加一下/i,
        /加上/i,
        /补全/i,
        /完善/i,
        /补齐/i,
        /修复/i,
        /改成/i,
        /换成/i,
        /编写/i,
        /搭建/i,
        /组件/i,
        /TS类型/i,
        /类型定义/i,
        /响应式/i,
        /适配移动端/i,
        /复制.*运行/i,
        /直接运行/i,
        /注释/i,
        /加注释/i,
        /完整注释/i,
      ],

      // 错误分析（真实报错）
      errorAnalysis: [
        /代码报错/i,
        /运行报错/i,
        /报错信息/i,
        /编译报错/i,
        /启动报错/i,
        /报错如下/i,
        /异常信息/i,
        /崩溃/i,
        /挂了/i,
        /无法运行/i,
        /SyntaxError/i,
        /ReferenceError/i,
        /TypeError/i,
        /Exception/i,
      ],

      // 文档与注释（只保留纯文档需求）
      documentation: [
        /生成.*文档/i,
        /接口文档/i,
        /说明文档/i,
        /写文档/i,
        /解读/i,
        /分析/i,
      ],

      // 文件处理（极低优先级，只处理真正的文件操作）
      fileProcessing: [
        /处理.*文件/i,
        /格式化文件/i,
        /转换文件/i,
        /解析文件/i,
        /读取.*文件/i,
        /写入文件/i,
        /导出文件/i,
        /上传文件/i,
        /下载文件/i,
      ],
    };

    let detectedIntent = 'general';
    let highestConfidence = 0;

    // 1. 代码生成 0.9（最高）
    for (const p of intentPatterns.codeGeneration) {
      if (p.test(userMessage) && 0.9 > highestConfidence) {
        detectedIntent = 'codeGeneration';
        highestConfidence = 0.9;
      }
    }

    // 2. 错误分析 0.85
    for (const p of intentPatterns.errorAnalysis) {
      if (p.test(userMessage) && 0.85 > highestConfidence) {
        detectedIntent = 'errorAnalysis';
        highestConfidence = 0.85;
      }
    }

    // 3. 文件处理 0.7
    for (const p of intentPatterns.fileProcessing) {
      if (p.test(userMessage) && 0.7 > highestConfidence) {
        detectedIntent = 'fileProcessing';
        highestConfidence = 0.7;
      }
    }

    // 4. 文档生成 0.6
    for (const p of intentPatterns.documentation) {
      if (p.test(userMessage) && 0.6 > highestConfidence) {
        detectedIntent = 'documentation';
        highestConfidence = 0.6;
      }
    }

    // 最终决策
    switch (detectedIntent) {
      case 'codeGeneration':
        return {
          type: 'llm',
          confidence: highestConfidence,
          reason: '检测到代码/组件生成需求，使用 LLM 生成',
        };
      case 'errorAnalysis':
        return {
          type: 'tool',
          toolName: 'error-analyzer',
          confidence: highestConfidence,
          reason: '检测到代码报错，使用错误分析工具',
        };
      case 'documentation':
        return {
          type: 'tool',
          toolName: 'doc-generator',
          confidence: highestConfidence,
          reason: '检测到文档生成需求，使用文档生成工具',
        };
      case 'fileProcessing':
        return {
          type: 'tool',
          toolName: 'file-processor',
          confidence: highestConfidence,
          reason: '检测到文件处理需求，使用文件处理工具',
        };
      default:
        return {
          type: 'llm',
          confidence: 0.5,
          reason: '通用对话，使用 LLM 处理',
        };
    }
  }

  async shouldUseToolFirst(userMessage: string): Promise<boolean> {
    const toolTriggerKeywords = [
      '分析报错', '检查报错', '审查报错',
      '帮我看看报错', '这是什么错误',
    ];

    for (const keyword of toolTriggerKeywords) {
      if (userMessage.includes(keyword)) {
        return true;
      }
    }
    return false;
  }
}