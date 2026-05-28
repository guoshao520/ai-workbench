// 模型列表
export const MODEL_OPTIONS = [
  { value: 'deepseek-ai/DeepSeek-V4-Pro', label: 'DeepSeek V4 Pro' },
  { value: 'Pro/zai-org/GLM-4.7', label: 'GLM-4.7 🚀' },
  { value: 'Pro/zai-org/GLM-5', label: 'GLM-5 🔥' },
]

// 角色列表
export const ROLES = [
  { id: 'frontend', name: '前端工程师', icon: '🎨' },
  { id: 'backend', name: '后端工程师', icon: '⚙️' },
  { id: 'fullstack', name: '全栈工程师', icon: '🚀' },
]

// 内置工具
export const TOOLS = [
  { id: 'code-generator', name: '代码生成', description: '生成Vue/React组件', icon: '💻' },
  { id: 'doc-generator', name: '文档生成', description: '生成接口文档', icon: '📄' },
  { id: 'error-analyzer', name: '错误分析', description: '分析错误日志', icon: '🔍' },
  { id: 'file-processor', name: '文件处理', description: '转换文件内容', icon: '📁' }
]