# Architecture

> Claude Code 源码架构：163,318 行 TypeScript 代码的完整解析

## 1. Overview

| 指标 | 数值 |
|------|------|
| 版本 | v2.1.88 |
| 文件数 | ~1,940 files |
| 代码行数 | ~163,318 lines |
| 语言 | TypeScript 6.0+ |
| 运行时 | Bun (Node.js >= 18) |
| 终端 UI | React + Ink |
| API | Anthropic SDK |

## 2. Top-Level Structure

```
claude-code-source-code/
├── src/
│   ├── main.tsx              # CLI 入口和 REPL 引导 (4,683 行)
│   ├── query.ts              # 核心 Agent 循环 (最大单文件, 785KB)
│   ├── QueryEngine.ts        # SDK/Headless 查询生命周期引擎
│   ├── Tool.ts               # 工具接口定义 + buildTool 工厂
│   ├── commands.ts           # 斜杠命令定义 (~25K 行)
│   ├── tools.ts              # 工具注册和预设
│   ├── context.ts            # 用户输入上下文处理
│   ├── history.ts            # 会话历史管理
│   ├── cost-tracker.ts       # API 成本追踪
│   ├── setup.ts              # 首次运行初始化
│   │
│   ├── cli/                  # CLI 基础设施 (stdio, 结构化传输)
│   ├── commands/             # ~87 个斜杠命令实现
│   ├── components/           # React/Ink 终端 UI (33 子目录)
│   ├── tools/                # 40+ 工具实现 (44 子目录)
│   ├── services/             # 业务逻辑层 (22 子目录)
│   ├── utils/                # 工具函数库
│   ├── state/                # 应用状态管理
│   ├── types/                # TypeScript 类型定义
│   ├── hooks/                # React Hooks
│   ├── bridge/               # Claude Desktop 远程桥接
│   ├── remote/               # 远程模式
│   ├── coordinator/          # 多 Agent 协调
│   ├── tasks/                # 任务管理
│   ├── assistant/            # KAIROS 助手模式
│   ├── memdir/               # 长期记忆管理
│   ├── plugins/              # 插件系统
│   ├── voice/                # 语音模式
│   └── vim/                  # Vim 模式
│
├── docs/                     # 深度分析文档 (中英双语)
├── vendor/                   # 第三方依赖
├── stubs/                    # 模块存根
├── types/                    # 全局类型定义
├── utils/                    # 顶级工具函数
├── scripts/                  # 构建脚本
└── package.json
```

## 3. Tech Stack

| 组件 | 技术 |
|------|------|
| 语言 | TypeScript 6.0+ |
| 运行时 | Bun (编译为 Node.js >= 18 bundle) |
| Claude API | Anthropic SDK |
| 终端 UI | React + Ink |
| 代码打包 | esbuild |
| 数据验证 | Zod |
| 工具协议 | MCP (Model Context Protocol) |

## 4. Core Execution Flow

```
User Input
    ↓
processUserInput()         # 解析 /斜杠命令
    ↓
query()                    # 主 Agent 循环 (query.ts)
    ├── fetchSystemPromptParts()    # 组装系统提示词
    ├── StreamingToolExecutor       # 并行工具执行
    ├── autoCompact()               # 自动上下文压缩
    └── runTools()                  # 工具编排和调度
    ↓
yield SDKMessage           # 流式结果返回消费者
```

## 5. Main Module Descriptions

### Tool System (40+ tools)

| 类别 | 工具 |
|------|------|
| 文件操作 | FileReadTool, FileEditTool, FileWriteTool |
| 代码搜索 | GlobTool, GrepTool |
| 系统执行 | BashTool |
| Web 访问 | WebFetchTool, WebSearchTool |
| 任务管理 | TaskCreateTool, TaskUpdateTool, TaskGetTool, TaskListTool |
| 子 Agent | AgentTool |
| 代码环境 | NotebookEditTool, REPLTool, LSPTool |
| Git 工作流 | EnterWorktreeTool, ExitWorktreeTool |
| 配置和权限 | ConfigTool, AskUserQuestionTool |
| 记忆和规划 | TodoWriteTool, EnterPlanModeTool, ExitPlanModeTool |
| 自动化 | ScheduleCronTool, RemoteTriggerTool, SleepTool |
| MCP 集成 | MCPTool |

### Slash Commands (~87)

`/commit` `/commit-push-pr` `/review` `/resume` `/session` `/memory` `/config` `/skills` `/help` `/voice` `/desktop` `/mcp` `/permissions` `/theme` `/vim` `/copy` 等

### Permission System

- 三种模式：`default`（询问用户）/ `bypass`（自动允许）/ `strict`（自动拒绝）
- 工具级细粒度控制
- 基于 ML 的自动化权限推断分类器
- 权限规则的持久化存储

### Context Management

- 自动压缩策略（`autoCompact`）：响应式压缩、微压缩、修剪压缩
- 上下文折叠（`CONTEXT_COLLAPSE`）
- Token 计数和估算
- 会话记录持久化

### Analysis Documents (`docs/`)

| 文档 | 内容 |
|------|------|
| 01 - Telemetry and Privacy | 双层分析管道 (Anthropic + Datadog)，无退出开关 |
| 02 - Hidden Features and Model Codenames | 内部代号如 Capybara, Tengu, Fennec, Numbat |
| 03 - Undercover Mode | Anthropic 员工自动进入公共仓库的卧底模式 |
| 04 - Remote Control and Emergency Switches | 每小时轮询、6+ 紧急开关、危险操作弹窗 |
| 05 - Future Roadmap | KAIROS 自主 Agent、语音模式、17 个未发布工具 |

## 6. Subprojects Comparison

| 项目 | 语言 | 性质 | 文件数 |
|------|------|------|--------|
| original-source-code | TypeScript | 原始泄露源码 | 1,884 files |
| claude-code-source-code | TypeScript | 反编译源码 (v2.1.88) + 文档 | 1,940 files |
| claw-code | Python | 干净室架构重写 | 109 files |
| nano-claude-code | Python | 最小化多 Provider 重实现 | ~30 files |
