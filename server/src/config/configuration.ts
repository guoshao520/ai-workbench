// 配置模块
export const configuration = () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  llm: {
    provider: process.env.LLM_PROVIDER || 'deepseek',
    apiKey: process.env.API_KEY || '',
    baseUrl: process.env.BASE_URL || 'https://api.deepseek.com',
    model: process.env.MODEL || 'deepseek-ai/DeepSeek-V4-Pro',
  },
  models: [
    {
      provider: 'deepseek',
      model: 'deepseek-ai/DeepSeek-V4-Pro',
      label: 'DeepSeek V4 Pro',
    },
    {
      provider: 'siliconflow',
      model: 'Pro/zai-org/GLM-4.7',
      label: 'GLM-4.7 国产稳定',
    },
    {
      provider: 'siliconflow',
      model: 'Pro/zai-org/GLM-5',
      label: 'GLM-5 高性能',
    },
  ],
  // 默认模型
  defaultModel: process.env.MODEL || 'deepseek-ai/DeepSeek-V4-Pro',
});
