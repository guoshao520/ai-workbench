export const mockPromptData = [
  {
    id: '1',
    name: '代码生成',
    title: '代码生成',
    icon: '💻',
    prompts: [
      {
        id: '101',
        title: '生成 React 组件',
        desc: '快速生成一个标准 React 函数组件',
        description: '请生成一个标准的 React 函数组件，包含基础结构。',
        speechTechnique: '请生成一个标准的 React 函数组件，包含基础结构。',
      },
      {
        id: '102',
        title: '封装 Axios 请求',
        desc: '生成带 TS 类型的 axios 封装',
        description: '请帮我封装一个 axios 请求模块，包含请求/响应类型、拦截器、错误处理。',
        speechTechnique: '请帮我封装一个 axios 请求模块，包含请求/响应类型、拦截器、错误处理。',
      },
    ],
  },
  {
    id: '2',
    name: '文案优化',
    title: '文案优化',
    icon: '✍️',
    prompts: [
      {
        id: '201',
        title: '润色文案',
        desc: '让表达更专业、流畅',
        description: '请帮我润色下面这段话，让它更流畅、专业、简洁。',
        speechTechnique: '请帮我润色下面这段话，让它更流畅、专业、简洁。',
      },
    ],
  },
  {
    id: '3',
    name: '问题排查',
    title: '问题排查',
    icon: '🔍',
    prompts: [
      {
        id: '301',
        title: '分析报错',
        desc: '帮我分析代码报错原因',
        description: '请帮我分析以下报错信息，并给出解决方案。',
        speechTechnique: '请帮我分析以下报错信息，并给出解决方案。',
      },
    ],
  },
];