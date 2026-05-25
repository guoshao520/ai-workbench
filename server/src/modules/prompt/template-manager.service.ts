// 模板管理服务
import { Injectable } from '@nestjs/common';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  template: string;
}

@Injectable()
export class TemplateManagerService {
  private readonly templates: Map<string, PromptTemplate>;

  constructor() {
    this.templates = new Map();
    this.initTemplates();
  }

  /**
   * 初始化内置模板
   */
  private initTemplates() {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'code-review',
        name: '代码审查',
        description: '审查代码问题并提供优化建议',
        icon: '👀',
        template: `请审查以下代码，指出问题并给出优化建议。

## 待审查代码
\`\`\`
{code}
\`\`\`

## 审查维度
1. 代码规范和风格
2. 潜在 Bug 和安全隐患
3. 性能优化建议
4. 可读性和可维护性
5. 最佳实践

请按以上维度逐一分析。`,
      },
      {
        id: 'bug-fix',
        name: 'Bug修复',
        description: '分析错误日志并提供修复方案',
        icon: '🐛',
        template: `请分析以下错误日志，提供修复方案。

## 错误日志
\`\`\`
{error}
\`\`\`

## 代码上下文
\`\`\`
{code}
\`\`\`

## 分析要点
1. 错误原因分析
2. 解决方案（附代码）
3. 预防措施`,
      },
      {
        id: 'api-doc',
        name: 'API文档',
        description: '根据接口信息生成接口文档',
        icon: '📋',
        template: `请根据以下接口信息生成接口文档。

## 接口信息
请求方法: {method}
请求路径: {path}
请求参数:
{params}

## 文档要求
1. 接口描述
2. 请求参数说明（类型、必填、含义）
3. 响应参数说明
4. 请求示例
5. 响应示例
6. 错误码说明`,
      },
      {
        id: 'file-explain',
        name: '代码解释',
        description: '解释文件的功能和逻辑',
        icon: '📖',
        template: `请解释以下文件的功能和逻辑。

## 文件内容
\`\`\`
{content}
\`\`\`

## 解释维度
1. 文件整体功能
2. 核心函数/类的作用
3. 数据流和调用关系
4. 依赖关系
5. 使用示例`,
      },
      {
        id: 'component-gen',
        name: '组件生成',
        description: '根据需求生成React组件',
        icon: '💻',
        template: `请根据以下需求生成 React 组件。

## 需求描述
{requirements}

## 技术栈
- React 18
- TypeScript
- CSS/Tailwind CSS

## 生成要求
1. 组件代码（包含 Props 类型定义）
2. 使用示例
3. 注意事项`,
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 根据ID获取模板
   */
  getTemplateById(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 填充模板变量
   */
  fillTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      return '';
    }

    let filled = template.template;
    for (const [key, value] of Object.entries(variables)) {
      filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return filled;
  }

  /**
   * 添加自定义模板
   */
  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }
}
