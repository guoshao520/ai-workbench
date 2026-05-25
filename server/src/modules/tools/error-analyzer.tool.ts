// 错误分析工具
import { Injectable } from '@nestjs/common';
import { BaseTool, ToolParameter, ToolResult } from './base-tool';

@Injectable()
export class ErrorAnalyzerTool implements BaseTool {
  name = 'error-analyzer';
  description = '分析错误日志、异常信息，提供问题原因和解决方案';
  icon = '🔍';
  parameters: ToolParameter[] = [
    {
      name: 'error',
      description: '错误日志或异常信息',
      type: 'string',
      required: true,
    },
    {
      name: 'code',
      description: '相关代码（可选）',
      type: 'string',
      required: false,
    },
    {
      name: 'context',
      description: '错误上下文描述',
      type: 'string',
      required: false,
    },
  ];

  /**
   * 匹配度计算
   */
  match(userMessage: string): number {
    const errorKeywords = [
      'error', 'exception', 'bug', '错误', '异常', '失败', 'failed',
      'undefined', 'null', 'TypeError', 'ReferenceError', 'SyntaxError',
      'Cannot', '无法', '报错', '问题', '修复', 'fix',
    ];

    const errorPatterns = [
      /Error:\s*/i,
      /Exception:\s*/i,
      /TypeError:\s*/i,
      /ReferenceError:\s*/i,
      /SyntaxError:\s*/i,
      /RangeError:\s*/i,
      /at\s+.*?\s+\(.*?\)/m,  // Stack trace
      /^\s*at\s+/m,  // Stack trace lines
    ];

    let score = 0;
    const lowerMessage = userMessage.toLowerCase();

    for (const keyword of errorKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }

    for (const pattern of errorPatterns) {
      if (pattern.test(userMessage)) {
        score += 0.3;
      }
    }

    return Math.min(score, 1);
  }

  /**
   * 执行错误分析
   */
  async execute(params: Record<string, any>): Promise<ToolResult> {
    const { error, code, context } = params;

    // TODO: 实现实际的错误分析逻辑
    // 可以调用 LLM 服务进行深度分析
    const analysis = this.analyzeError(error, code, context);

    return {
      success: true,
      data: analysis,
      metadata: {
        tool: this.name,
        analyzedAt: new Date().toISOString(),
        hasCode: !!code,
      },
    };
  }

  /**
   * 错误分析骨架
   */
  private analyzeError(error: string, code?: string, context?: string): any {
    // 解析错误类型
    const errorType = this.extractErrorType(error);
    
    return {
      summary: `检测到 ${errorType} 类型错误`,
      analysis: {
        type: errorType,
        description: 'TODO: LLM将提供详细的错误描述',
        possibleCauses: [
          'TODO: 原因1',
          'TODO: 原因2',
          'TODO: 原因3',
        ],
      },
      solution: {
        immediate: [
          'TODO: 立即可行的解决方案',
        ],
        prevention: [
          'TODO: 预防措施',
        ],
      },
      fixedCode: code ? `// TODO: LLM将提供修复后的代码\n${code}` : null,
      relatedErrors: this.findRelatedErrors(errorType),
    };
  }

  /**
   * 提取错误类型
   */
  private extractErrorType(error: string): string {
    const patterns = [
      { pattern: /TypeError:/i, type: 'TypeError' },
      { pattern: /ReferenceError:/i, type: 'ReferenceError' },
      { pattern: /SyntaxError:/i, type: 'SyntaxError' },
      { pattern: /RangeError:/i, type: 'RangeError' },
      { pattern: /Error:/i, type: 'Error' },
      { pattern: /Exception:/i, type: 'Exception' },
    ];

    for (const { pattern, type } of patterns) {
      if (pattern.test(error)) {
        return type;
      }
    }

    return 'Unknown';
  }

  /**
   * 查找相关错误
   */
  private findRelatedErrors(errorType: string): string[] {
    // TODO: 实现相关错误查找
    const relatedMap: Record<string, string[]> = {
      TypeError: ['ReferenceError', 'SyntaxError'],
      ReferenceError: ['TypeError', 'SyntaxError'],
      SyntaxError: ['TypeError'],
    };

    return relatedMap[errorType] || [];
  }
}
