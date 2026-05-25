// 工具基类
import { Message } from '../session/entities/session.entity';

export interface ToolParameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BaseTool {
  name: string;
  description: string;
  icon: string;
  parameters: ToolParameter[];
  
  // 检查是否需要调用此工具，返回匹配度 0-1
  match(userMessage: string): number;
  
  // 执行工具
  execute(params: Record<string, any>): Promise<ToolResult>;
}

// 工具执行计划
export interface ToolPlan {
  toolName: string;
  confidence: number;
  reason: string;
  parameters: Record<string, any>;
}

// Agent执行结果
export interface ExecutionResult {
  type: 'tool' | 'llm';
  content: string;
  toolName?: string;
  success: boolean;
  metadata?: Record<string, any>;
}
