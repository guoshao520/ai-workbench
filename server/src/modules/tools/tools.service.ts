// 工具服务 - 统一管理所有工具
import { Injectable, Logger } from '@nestjs/common';
import { BaseTool, ToolPlan, ExecutionResult } from './base-tool';
import { CodeGeneratorTool } from './code-generator.tool';
import { DocGeneratorTool } from './doc-generator.tool';
import { ErrorAnalyzerTool } from './error-analyzer.tool';
import { FileProcessorTool } from './file-processor.tool';

@Injectable()
export class ToolsService {
  private readonly logger = new Logger();
  private tools: Map<string, BaseTool> = new Map();

  constructor(
    private readonly codeGenerator: CodeGeneratorTool,
    private readonly docGenerator: DocGeneratorTool,
    private readonly errorAnalyzer: ErrorAnalyzerTool,
    private readonly fileProcessor: FileProcessorTool,
  ) {
    this.registerTools();
  }

  /**
   * 注册所有内置工具
   */
  private registerTools() {
    this.register(this.codeGenerator);
    this.register(this.docGenerator);
    this.register(this.errorAnalyzer);
    this.register(this.fileProcessor);
    
    this.logger.log(`Registered ${this.tools.size} tools`, 'ToolsService');
  }

  /**
   * 注册工具
   */
  register(tool: BaseTool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * 获取所有工具
   */
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 根据名称获取工具
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * 分析用户消息，匹配最合适的工具
   */
  async analyzeIntent(userMessage: string): Promise<ToolPlan | null> {
    let bestMatch: ToolPlan | null = null;
    let highestScore = 0;

    for (const tool of this.tools.values()) {
      const score = tool.match(userMessage);
      
      if (score > highestScore && score > 0.3) { // 阈值0.3
        highestScore = score;
        
        // TODO: 根据工具和消息提取参数
        bestMatch = {
          toolName: tool.name,
          confidence: score,
          reason: `匹配到工具: ${tool.name}`,
          parameters: this.extractParameters(tool, userMessage),
        };
      }
    }

    return bestMatch;
  }

  /**
   * 执行工具
   */
  async executeTool(toolName: string, params: Record<string, any>): Promise<ExecutionResult> {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      return {
        type: 'tool',
        content: `未找到工具: ${toolName}`,
        success: false,
      };
    }

    try {
      this.logger.log(`Executing tool: ${toolName}`, 'ToolsService');
      const result = await tool.execute(params);

      return {
        type: 'tool',
        content: result.success ? JSON.stringify(result.data) : result.error || 'Tool execution failed',
        toolName,
        success: result.success,
        metadata: result.metadata,
      };
    } catch (error) {
      this.logger.error(`Tool execution error: ${toolName}`, error.stack, 'ToolsService');
      return {
        type: 'tool',
        content: `工具执行错误: ${error.message}`,
        toolName,
        success: false,
      };
    }
  }

  /**
   * 从用户消息中提取工具参数
   * TODO: 实现更智能的参数提取
   */
  private extractParameters(tool: BaseTool, userMessage: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // 简单实现：提取代码块
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
}
