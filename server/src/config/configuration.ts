// 配置模块
export const configuration = () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  llm: {
    provider: process.env.LLM_PROVIDER || 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  },
});
