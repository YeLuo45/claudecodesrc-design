# Tool System

> 40+ 内置工具的完整分类和实现分析

## 1. Tool Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Tool System                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Tool Registry                                       │ │
│  │ - 40+ builtin tools                                 │ │
│  │ - MCP tools (dynamic)                               │ │
│  │ - Plugin tools (extensible)                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                            │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Tool Executor                                        │ │
│  │ - StreamingToolExecutor (parallel)                   │ │
│  │ - SequentialToolExecutor (ordered)                   │ │
│  │ - Rate limiter                                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                            │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Tool Result                                          │ │
│  │ - Text, JSON, Error                                 │ │
│  │ - Auto-compaction                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Tool Categories

### File Operations

| Tool | Description | Input |
|------|-------------|-------|
| `FileReadTool` | 读取文件内容 | `{ path: string, lineRanges?: number[][] }` |
| `FileEditTool` | 编辑文件 | `{ path: string, oldText: string, newText: string }` |
| `FileWriteTool` | 写入文件 | `{ path: string, content: string }` |
| `GlobTool` | 文件模式匹配 | `{ pattern: string }` |
| `GrepTool` | 代码搜索 | `{ pattern: string, path?: string }` |

### Code Search

| Tool | Description | Input |
|------|-------------|-------|
| `GrepTool` | 正则搜索 | `{ pattern: string, path?: string, regex?: boolean }` |
| `GlobTool` | Glob 匹配 | `{ pattern: string, cwd?: string }` |
| `LSPTool` | Language Server | `{ command: string, args: any[] }` |

### System Execution

| Tool | Description | Input |
|------|-------------|-------|
| `BashTool` | 执行 Shell 命令 | `{ command: string, timeout?: number }` |
| `ScriptTool` | 执行脚本文件 | `{ path: string, args?: string[] }` |

### Web Access

| Tool | Description | Input |
|------|-------------|-------|
| `WebFetchTool` | 获取网页内容 | `{ url: string }` |
| `WebSearchTool` | 网络搜索 | `{ query: string, numResults?: number }` |

### Task Management

| Tool | Description | Input |
|------|-------------|-------|
| `TaskCreateTool` | 创建任务 | `{ title: string, description?: string }` |
| `TaskUpdateTool` | 更新任务 | `{ id: string, status?: string }` |
| `TaskGetTool` | 获取任务 | `{ id: string }` |
| `TaskListTool` | 列出任务 | `{}` |

### Sub-Agent

| Tool | Description | Input |
|------|-------------|-------|
| `AgentTool` | 启动子 Agent | `{ prompt: string, model?: string }` |
| `SendMessageTool` | 发送消息 | `{ agentId: string, message: string }` |

### Code Environments

| Tool | Description | Input |
|------|-------------|-------|
| `NotebookEditTool` | Jupyter 笔记本编辑 | `{ path: string, cell: object }` |
| `REPLTool` | 交互式 REPL | `{ language: string, code: string }` |
| `LSPTool` | 语言服务器协议 | `{ method: string, params: object }` |

### Git Workflow

| Tool | Description | Input |
|------|-------------|-------|
| `EnterWorktreeTool` | 进入 Git Worktree | `{ branch: string, path?: string }` |
| `ExitWorktreeTool` | 退出 Git Worktree | `{}` |
| `GitLogTool` | Git 日志 | `{ path?: string, n?: number }` |
| `GitDiffTool` | Git 差异 | `{ path?: string }` |

### Configuration & Permissions

| Tool | Description | Input |
|------|-------------|-------|
| `ConfigTool` | 读取/设置配置 | `{ key: string, value?: any }` |
| `AskUserQuestionTool` | 询问用户 | `{ question: string }` |

### Memory & Planning

| Tool | Description | Input |
|------|-------------|-------|
| `TodoWriteTool` | 写入待办事项 | `{ content: string, done?: boolean }` |
| `EnterPlanModeTool` | 进入计划模式 | `{}` |
| `ExitPlanModeTool` | 退出计划模式 | `{}` |

### Automation

| Tool | Description | Input |
|------|-------------|-------|
| `ScheduleCronTool` | 定时任务 | `{ cron: string, action: string }` |
| `RemoteTriggerTool` | 远程触发 | `{ url: string, payload?: object }` |
| `SleepTool` | 延迟执行 | `{ seconds: number }` |

### MCP Integration

| Tool | Description | Input |
|------|-------------|-------|
| `MCPTool` | MCP 工具调用 | `{ server: string, tool: string, args: object }` |

## 3. Tool Execution Flow

```
1. Tool Call Request
   │
   ▼
2. Input Validation (Zod Schema)
   │
   ▼
3. Permission Check
   │
   ├─── Allowed ──► 4. Execute Tool
   │
   └─── Denied ──► Return Error
   │
   ▼
5. Result Processing
   │
   ▼
6. Auto-Compact (if needed)
   │
   ▼
7. Return to Agent
```

## 4. Streaming Tool Executor

```typescript
class StreamingToolExecutor {
  async executeAll(
    toolCalls: ToolCall[],
    context: ToolContext
  ): Promise<ToolResult[]> {
    // 并行执行所有工具调用
    const promises = toolCalls.map(call =>
      this.executeOne(call, context)
    );

    // 等待所有完成
    return Promise.all(promises);
  }

  async executeOne(
    call: ToolCall,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = toolRegistry.get(call.name);
    if (!tool) {
      return { error: `Unknown tool: ${call.name}` };
    }

    try {
      return await tool.fn(call.input, context);
    } catch (error) {
      return { error: error.message };
    }
  }
}
```

## 5. Tool Definition Example

```typescript
const FileReadTool = buildTool({
  name: 'FileRead',
  description: 'Read the contents of a file',
  schema: z.object({
    path: z.string().describe('Path to the file to read'),
    lineRanges: z.array(
      z.tuple([z.number(), z.number()])
    ).optional().describe('Specific line ranges to read'),
  }),
  async handler(input, context) {
    const { path, lineRanges } = input;

    // 检查文件是否存在
    if (!await fs.exists(path)) {
      return { error: `File not found: ${path}` };
    }

    // 读取文件
    let content = await fs.readFile(path, 'utf-8');

    // 如果指定了行范围，提取相应内容
    if (lineRanges) {
      const lines = content.split('\n');
      content = lineRanges
        .map(([start, end]) => lines.slice(start, end).join('\n'))
        .join('\n');
    }

    return { content };
  },
});
```

## 6. MCP Tool Integration

```typescript
// MCP 工具通过 MCPTool 接入
const MCPTool = buildTool({
  name: 'MCP',
  description: 'Call a tool from an MCP server',
  schema: z.object({
    server: z.string().describe('MCP server name'),
    tool: z.string().describe('Tool name on the server'),
    args: z.record(z.any()).describe('Tool arguments'),
  }),
  async handler(input, context) {
    const { server, tool, args } = input;

    // 获取 MCP 客户端
    const client = mcpClients.get(server);
    if (!client) {
      return { error: `Unknown MCP server: ${server}` };
    }

    // 调用远程工具
    const result = await client.callTool(tool, args);
    return { result };
  },
});
```

## 7. Tool Permissions

```typescript
interface ToolPermission {
  tool: string;
  mode: 'ask' | 'allow' | 'deny';
  lastPrompt?: string;  // ML 分类器学习
}

// 权限检查
async function checkPermission(
  tool: string,
  input: unknown
): Promise<boolean> {
  const permission = getPermission(tool);

  switch (permission.mode) {
    case 'allow':
      return true;
    case 'deny':
      return false;
    case 'ask':
      // 询问用户或使用 ML 分类器
      return await mlClassifier.predict(tool, input);
  }
}
```
