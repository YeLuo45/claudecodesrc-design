# Context Management

> 自动上下文压缩、Token 计数和会话管理

## 1. Context Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Context Management                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Context Builder                                      │ │
│  │ - User input                                        │ │
│  │ - System prompt                                     │ │
│  │ - Tool definitions                                  │ │
│  │ - Session history                                  │ │
│  │ - Memories                                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                            │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Token Counter                                       │ │
│  │ - Count tokens per message                         │ │
│  │ - Estimate compression ratio                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                            │
│                            ▼                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Auto-Compact                                        │ │
│  │ - Reactive compression                              │ │
│  │ - Micro-compression                                 │ │
│  │ - Trimmed compression                               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 2. Context Building

```typescript
interface Context {
  system: string;           // System prompt
  messages: Message[];       // Conversation history
  tools: ToolDefinition[];  // Available tools
  memories: MemoryEntry[];  // Relevant memories
  documents: Document[];    // Open files
}

async function buildContext(
  request: UserRequest
): Promise<Context> {
  return {
    system: await buildSystemPrompt(request),
    messages: await loadRecentMessages(request.sessionId),
    tools: toolRegistry.getDefinitions(),
    memories: await searchMemories(request.input),
    documents: await loadOpenFiles(request.cwd),
  };
}
```

## 3. Token Counting

```typescript
// Token 计数器
class TokenCounter {
  // Claude token counting (approximation)
  count(text: string): number {
    // 简单估算：4 字符 ≈ 1 token
    return Math.ceil(text.length / 4);
  }

  // 精确计数（使用 TikToken）
  async countPrecise(text: string, model: string): Promise<number> {
    const encoder = await getEncoder(model);
    return encoder.encode(text).length;
  }

  // 计算消息总 token
  async countMessages(messages: Message[]): Promise<number> {
    let total = 0;
    for (const msg of messages) {
      total += await this.countPrecise(msg.content, 'claude-3');
      total += 4;  // Role token
    }
    return total;
  }
}
```

## 4. Auto-Compact

### Overview

自动压缩是 Claude Code 保持上下文在模型限制内的机制：

```typescript
// 自动压缩配置
interface CompactConfig {
  // 目标 token 数量
  targetTokens: number;
  // 压缩阈值（百分比）
  threshold: number;
  // 压缩策略
  strategy: 'reactive' | 'micro' | 'trimmed';
}

// 压缩策略
type CompactStrategy =
  | 'reactive'   // 响应式：只压缩必要的部分
  | 'micro'      // 微压缩：压缩最小的历史片段
  | 'trimmed';   // 修剪压缩：移除最老的半透明消息
```

### Reactive Compression

```typescript
// 响应式压缩
async function reactiveCompact(
  context: Context,
  config: CompactConfig
): Promise<Context> {
  const currentTokens = await tokenCounter.countMessages(context.messages);

  // 检查是否超过阈值
  if (currentTokens < config.targetTokens * config.threshold) {
    return context;  // 不需要压缩
  }

  // 找到要压缩的范围
  const compressRange = findCompressRange(
    context.messages,
    config.targetTokens
  );

  // 压缩消息
  const compressed = compressMessages(
    context.messages,
    compressRange
  );

  return { ...context, messages: compressed };
}
```

### Micro Compression

```typescript
// 微压缩：压缩最小的历史片段
async function microCompact(
  context: Context,
  config: CompactConfig
): Promise<Context> {
  // 找到最小的压缩单位
  let startIdx = 0;
  let minSize = Infinity;

  for (let i = 0; i < context.messages.length; i++) {
    const size = await tokenCounter.countPrecise(
      context.messages[i].content,
      'claude-3'
    );
    if (size < minSize && size > 100) {
      minSize = size;
      startIdx = i;
    }
  }

  // 压缩这一个片段
  const compressed = [...context.messages];
  compressed[startIdx] = {
    ...compressed[startIdx],
    content: `[Earlier conversation compressed: ${minSize} tokens]`,
  };

  return { ...context, messages: compressed };
}
```

### Trimmed Compression

```typescript
// 修剪压缩：移除最老的半透明消息
async function trimmedCompact(
  context: Context,
  config: CompactConfig
): Promise<Context> {
  // 找到半透明消息（tool results）
  const transparentIndices = context.messages
    .map((msg, i) => msg.role === 'tool' ? i : -1)
    .filter(i => i >= 0);

  // 移除最老的 50%
  const toRemove = Math.floor(transparentIndices.length / 2);
  const remaining = context.messages.filter(
    (_, i) => !transparentIndices.slice(0, toRemove).includes(i)
  );

  return { ...context, messages: remaining };
}
```

## 5. Context Collapse

```typescript
// CONTEXT_COLLAPSE：完全折叠历史
async function collapseContext(
  context: Context
): Promise<Context> {
  // 保留系统提示词和最近的消息
  const recentMessages = context.messages.slice(-4);

  // 生成历史摘要
  const summary = await generateSummary(context.messages);

  return {
    ...context,
    messages: [
      ...recentMessages,
      {
        role: 'system',
        content: `[Previous conversation summarized: ${summary}]`,
      },
    ],
  };
}
```

## 6. Token Budget

```typescript
// Token 预算管理
interface TokenBudget {
  maxTokens: number;         // 模型最大 token
  systemTokens: number;      // 系统提示词 token
  toolTokens: number;        // 工具定义 token
  availableForMessages: number;  // 可用于消息的 token
}

function calculateBudget(config: ModelConfig): TokenBudget {
  const maxTokens = getModelMaxTokens(config.model);

  return {
    maxTokens,
    systemTokens: estimateSystemTokens(config),
    toolTokens: estimateToolTokens(config),
    availableForMessages: maxTokens
      - estimateSystemTokens(config)
      - estimateToolTokens(config)
      - 100,  // Buffer
  };
}
```

## 7. Session Transcript

```typescript
// 会话记录持久化
class TranscriptStore {
  async saveTurn(sessionId: string, turn: Turn): Promise<void> {
    const key = `sessions/${sessionId}/turns/${turn.id}`;
    await this.db.put(key, {
      ...turn,
      timestamp: Date.now(),
    });
  }

  async loadSession(sessionId: string): Promise<Turn[]> {
    const keys = await this.db.getKeys(
      `sessions/${sessionId}/turns/`
    );
    const turns = await Promise.all(
      keys.map(key => this.db.get(key))
    );
    return turns.sort((a, b) => a.timestamp - b.timestamp);
  }
}
```
