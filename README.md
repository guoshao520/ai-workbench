# SynthCode - 前端开发者AI智能提效工作台

一个功能完善的前端开发者AI智能助手，基于 Nest.js 后端 + React 前端，支持流式对话、代码生成、错误分析等能力。

## 项目结构

```
ai-workbench/
├── client/                    # React前端 (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # React组件
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── services/         # API服务
│   │   ├── types/            # 类型定义
│   │   └── utils/            # 工具函数
│   └── ...
│
├── server/                    # Nest.js后端
│   ├── src/
│   │   ├── common/           # 公共模块（过滤器、拦截器）
│   │   ├── config/           # 配置模块
│   │   ├── modules/          # 业务模块
│   │   │   ├── session/      # 会话管理
│   │   │   ├── chat/         # 聊天（SSE流式）
│   │   │   ├── prompt/       # Prompt工程
│   │   │   ├── agent/        # Agent智能体
│   │   │   ├── tools/        # 内置工具集
│   │   │   └── llm/          # 大模型对接
│   │   └── utils/            # 工具类
│   └── ...
│
├── package.json              # Workspace根配置
└── README.md
```

## 技术栈

### 前端
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **CSS3** - 深色主题样式

### 后端
- **Nest.js** - Node.js企业级框架
- **TypeScript** - 类型安全
- **Express** - HTTP适配器
- **Axios** - HTTP客户端

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cd server
cp .env.example .env
# 编辑 .env 填入你的 DeepSeek API Key
```

### 3. 启动开发服务器

```bash
# 启动前后端（同时运行）
npm run dev

# 单独启动前端 (http://localhost:5173)
npm run dev:client

# 单独启动后端 (http://localhost:3001)
npm run dev:server
```

### 4. 生产构建

```bash
# 构建前端
cd client && npm run build

# 构建后端
cd server && npm run build

# 启动生产服务
cd server && npm run start
```

## 功能特性

- 💬 **流式对话** - SSE流式输出，实时响应
- 💻 **代码生成** - 智能生成前端代码
- 📄 **文档生成** - 自动生成接口文档
- 🔍 **错误分析** - 智能分析错误日志
- 📁 **文件处理** - 支持文件格式化、转换
- 💾 **会话管理** - 多会话切换和历史记录
- 👤 **角色切换** - 前端/后端/全栈/DevOps工程师
- 📝 **快捷模板** - 代码审查、Bug修复等模板

## 模块架构

### 后端模块 (Nest.js)

| 模块 | 说明 |
|------|------|
| `session` | 会话记忆管理，创建/删除/存储聊天历史 |
| `chat` | 聊天控制器，处理HTTP请求和SSE流式响应 |
| `prompt` | Prompt工程，包含角色管理和模板管理 |
| `agent` | Agent智能体核心调度器，任务路由决策 |
| `tools` | 内置业务工具集（代码生成、文档、错误分析等） |
| `llm` | 大模型对接层，支持DeepSeek等LLM |

### API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat` | 发送消息，SSE流式响应 |
| POST | `/api/chat/sync` | 发送消息，同步响应 |
| GET | `/api/sessions` | 获取会话列表 |
| POST | `/api/sessions` | 创建新会话 |
| DELETE | `/api/sessions/:id` | 删除会话 |
| GET | `/api/sessions/:id/messages` | 获取会话历史消息 |

## 内置工具

| 工具 | 说明 |
|------|------|
| `code-generator` | 代码生成工具，支持React/Vue等组件生成 |
| `doc-generator` | 文档生成工具，支持API文档、README、JSDoc |
| `error-analyzer` | 错误分析工具，分析错误日志并提供解决方案 |
| `file-processor` | 文件处理工具，格式化、验证、转换文件 |

## 角色预设

| 角色 | 描述 |
|------|------|
| `frontend` | 前端工程师 - React/Vue/TypeScript |
| `backend` | 后端工程师 - Node.js/Python/Java |
| `fullstack` | 全栈工程师 - 前后端全链路 |
| `devops` | DevOps工程师 - CI/CD/容器化 |

## 开发指南

### 添加新工具

1. 在 `modules/tools/` 创建新的工具类，实现 `BaseTool` 接口
2. 在 `tools.module.ts` 中注册
3. 在 `tools.service.ts` 中注入

### 添加新角色

在 `modules/prompt/role-manager.service.ts` 的 `initRoles()` 方法中添加新角色。

### 添加新模板

在 `modules/prompt/template-manager.service.ts` 的 `initTemplates()` 方法中添加新模板。

## License

MIT
# ai-workbench
