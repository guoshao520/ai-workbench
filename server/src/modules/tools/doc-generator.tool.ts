// 文档生成工具
import { Injectable } from '@nestjs/common';
import { BaseTool, ToolParameter, ToolResult } from './base-tool';

@Injectable()
export class DocGeneratorTool implements BaseTool {
  name = 'doc-generator';
  description = '生成接口文档、README文档、代码注释、API文档等';
  icon = '📄';
  parameters: ToolParameter[] = [
    {
      name: 'type',
      description: '文档类型',
      type: 'string',
      required: false,
      default: 'api',
    },
    {
      name: 'content',
      description: '需要生成文档的内容（代码、接口信息等）',
      type: 'string',
      required: true,
    },
    {
      name: 'format',
      description: '输出格式',
      type: 'string',
      required: false,
      default: 'markdown',
    },
  ];

  /**
   * 匹配度计算
   */
  match(userMessage: string): number {
    const docKeywords = [
      '文档', 'doc', '说明', '注释', 'comment', 'readme',
      'api', '接口', '参数', '返回值', '生成文档',
      '注释', 'JSDoc', 'TSDoc',
    ];

    const docPatterns = [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /class\s+\w+\s*(extends|implements)/,
      /@param/,
      /@returns?/,
    ];

    let score = 0;
    const lowerMessage = userMessage.toLowerCase();

    for (const keyword of docKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 0.25;
      }
    }

    for (const pattern of docPatterns) {
      if (pattern.test(userMessage)) {
        score += 0.2;
      }
    }

    return Math.min(score, 1);
  }

  /**
   * 执行文档生成
   */
  async execute(params: Record<string, any>): Promise<ToolResult> {
    const { type = 'api', content, format = 'markdown' } = params;

    // TODO: 实现实际的文档生成逻辑
    const generatedDoc = this.generateDoc(type, content, format);

    return {
      success: true,
      data: {
        document: generatedDoc,
        type,
        format,
        timestamp: Date.now(),
      },
      metadata: {
        tool: this.name,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 生成文档骨架
   */
  private generateDoc(type: string, content: string, format: string): string {
    const timestamp = new Date().toLocaleString('zh-CN');

    switch (type) {
      case 'api':
        return this.generateApiDoc(content, format);
      case 'readme':
        return this.generateReadme(content, format);
      case 'jsdoc':
        return this.generateJsDoc(content, format);
      default:
        return `## 文档\n\n内容: ${content}\n\n生成时间: ${timestamp}`;
    }
  }

  private generateApiDoc(content: string, format: string): string {
    return `# API 文档

## 接口信息

> 待补充

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| - | - | - | - |

## 响应参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| - | - | - |

## 请求示例

\`\`\`javascript
// TODO: Add example
\`\`\`

## 响应示例

\`\`\`json
// TODO: Add example
\`\`\`

---
生成时间: ${new Date().toLocaleString('zh-CN')}
`;
  }

  private generateReadme(content: string, format: string): string {
    return `# 项目名称

> TODO: 填写项目名称

## 项目简介

TODO: 填写项目简介

## 功能特性

- [ ] 功能1
- [ ] 功能2
- [ ] 功能3

## 快速开始

### 安装

\`\`\`bash
npm install
\`\`\`

### 使用

\`\`\`javascript
// TODO: Add usage example
\`\`\`

## API 参考

TODO: 添加 API 文档链接

## License

MIT
`;
  }

  private generateJsDoc(content: string, format: string): string {
    return `/**
 * TODO: 函数描述
 *
 * @param {*} paramName - 参数描述
 * @returns {*} 返回值描述
 * 
 * @example
 * // TODO: Add example
 * 
 * @since ${new Date().toISOString().split('T')[0]}
 */`;
  }
}
