# Core Modules

> Claude Code 核心模块详细分析

## 1. main.tsx — CLI Entry Point

`src/main.tsx` 是 CLI 入口点，4,683 行代码，包含：

### Entry Points

```typescript
// 入口函数按优先级处理多条快速路径
async function main() {
  // 1. CLI 解析
  // 2. 环境检查
  // 3. REPL 初始化
  // 4. 会话恢复
}
```

### Key Functions

| 函数 | 行数 | 职责 |
|------|------|------|
| `processArgs()` | ~500 | 命令行参数解析 |
| `initREPL()` | ~800 | REPL 初始化 |
| `loadSession()` | ~400 | 会话加载 |
| `setupEnvironment()` | ~300 | 环境配置 |

## 2. query.ts — Core Agent Loop

`src/query.ts` 是最大的单文件，785KB，包含：

### Main Loop

```typescript
async function* query(
  request: QueryRequest
): AsyncIterable<SDKMessage> {
  // 1. 构建系统提示词
  const systemPrompt = await fetchSystemPromptParts();

  // 2. 流式 API 调用
  const stream = await anthropic.messages.stream({
    model: config.model,
    messages: buildMessages(request),
    system: systemPrompt,
    tools: toolDefinitions,
  });

  // 3. 处理工具调用
  for await (const event of stream) {
    if (event.type === 'content_block_stop') {
      // 处理工具调用结果
      const results = await executeTools(event.tool_calls);
      // 继续循环
    }
  }
}
```

### Key Functions

| 函数 | 职责 |
|------|------|
| `fetchSystemPromptParts()` | 组装系统提示词 |
| `StreamingToolExecutor` | 并行工具执行 |
| `autoCompact()` | 自动上下文压缩 |
| `runTools()` | 工具编排和调度 |

## 3. QueryEngine.ts — Query Lifecycle Engine

`QueryEngine.ts` 管理查询生命周期：

```typescript
class QueryEngine {
  async query(request: QueryRequest): Promise<QueryResult> {
    // 1. 验证请求
    // 2. 构建上下文
    // 3. 执行查询
    // 4. 处理结果
    // 5. 更新历史
  }

  async compact(): Promise<void> {
    // 上下文压缩
  }
}
```

## 4. Tool.ts — Tool Interface

`Tool.ts` 定义工具接口：

```typescript
interface Tool {
  name: string;
  description: string;
  input_schema: z.ZodSchema;
  fn: (input: unknown, context: ToolContext) => Promise<ToolResult>;
}

// buildTool 工厂
function buildTool<T extends z.ZodSchema>(
  config: ToolConfig<T>
): Tool {
  return {
    name: config.name,
    description: config.description,
    input_schema: config.schema,
    fn: async (input, context) => {
      // 验证输入
      const validated = config.schema.parse(input);
      // 执行
      return config.handler(validated, context);
    },
  };
}
```

## 5. commands.ts — Slash Commands

`commands.ts` (~25K 行) 定义所有斜杠命令：

```typescript
// 命令注册
const commands: Record<string, Command> = {
  '/commit': {
    description: '提交更改',
    handler: commitCommand,
    permissions: ['git'],
  },
  '/review': {
    description: '代码审查',
    handler: reviewCommand,
  },
  // ... 85+ more
};
```

## 6. tools.ts — Tool Registration

`tools.ts` 注册所有内置工具：

```typescript
// 工具预设
const builtinTools: Tool[] = [
  // 文件操作
  FileReadTool,
  FileEditTool,
  FileWriteTool,
  // 代码搜索
  GlobTool,
  GrepTool,
  // 系统执行
  BashTool,
  // ... 35+ more
];

// 注册到全局工具表
export function registerTools(): void {
  for (const tool of builtinTools) {
    toolRegistry.register(tool);
  }
}
```

## 7. context.ts — Context Building

`context.ts` 构建用户输入上下文：

```typescript
async function buildContext(input: UserInput): Promise<Context> {
  return {
    // 用户输入
    input: input.text,
    // 工作目录
    cwd: process.cwd(),
    // Git 状态
    gitStatus: await getGitStatus(),
    // 文件内容
    openFiles: await readOpenFiles(),
    // 记忆内容
    memories: await searchMemories(input),
    // 项目配置
    projectConfig: loadProjectConfig(),
  };
}
```

## 8. history.ts — Session History

`history.ts` 管理会话历史：

```typescript
class HistoryManager {
  async saveTurn(sessionId: string, turn: Turn): Promise<void> {
    // 保存到磁盘
    await db.put(`sessions/${sessionId}/turns/${turn.id}`, turn);
  }

  async loadSession(sessionId: string): Promise<Session> {
    // 加载完整会话
  }

  async compactSession(sessionId: string): Promise<void> {
    // 压缩会话历史
  }
}
```

## 9. cost-tracker.ts — Cost Tracking

`cost-tracker.ts` 追踪 API 成本：

```typescript
interface CostRecord {
  input_tokens: number;
  output_tokens: number;
  cost: number;  // USD
}

async function trackCost(response: APIResponse): Promise<void> {
  const record: CostRecord = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cost: calculateCost(response),
  };
  await db.put(`costs/${Date.now()}`, record);
}
```

## 10. setup.ts — First-Run Setup

`setup.ts` 处理首次运行初始化：

```typescript
async function setup(): Promise<void> {
  // 1. 检查环境
  await checkEnvironment();

  // 2. 创建配置目录
  await ensureConfigDir();

  // 3. 初始化记忆存储
  await initMemoryStore();

  // 4. 显示欢迎信息
  showWelcome();
}
```
