# Subprojects Comparison

> Original Source / Claw-Code / Nano Claude Code 架构对比

## 1. Overview Comparison

| Aspect | Original Source | Claw-Code | Nano Claude Code |
|--------|-----------------|-----------|-----------------|
| Language | TypeScript | Python | Python |
| Files | 1,884 | 109 | ~30 |
| Lines | ~160K | ~5K | ~5K |
| Nature | Raw leak | Clean-room rewrite | Minimal reimplementation |
| Maintainer | Anthropic | @instructkr | Community |
| License | Proprietary | MIT | MIT |

## 2. Architecture Comparison

### Original Source (TypeScript)

```
Original Source/
├── src/
│   ├── main.tsx          # CLI + REPL
│   ├── query.ts          # Core loop
│   ├── QueryEngine.ts    # Engine
│   ├── Tool.ts          # Interface
│   ├── commands.ts       # Commands
│   ├── tools.ts         # Tool registry
│   ├── context.ts        # Context
│   ├── history.ts        # History
│   ├── cli/             # CLI infrastructure
│   ├── commands/        # 87 command implementations
│   ├── components/      # React/Ink UI
│   ├── tools/           # 40+ tool implementations
│   ├── services/        # Business logic
│   ├── state/           # State management
│   ├── bridge/          # Remote bridge
│   ├── remote/          # Remote mode
│   └── ...              # 37 subdirectories
└── docs/               # Analysis docs
```

### Claw-Code (Python)

```
claw-code/
├── src/
│   ├── __init__.py      # Package export
│   ├── main.py          # CLI entry (~200 lines)
│   ├── query_engine.py  # Query engine
│   ├── runtime.py       # Runtime session
│   ├── models.py        # Data classes
│   ├── commands.py      # Command metadata
│   ├── tools.py         # Tool metadata
│   ├── permissions.py   # Permission context
│   ├── context.py       # Context layer
│   ├── setup.py         # Workspace init
│   ├── session_store.py # Session persistence
│   ├── transcript.py    # Transcript storage
│   ├── reference_data/  # JSON snapshots
│   ├── commands/        # Command implementations
│   ├── tools/           # Tool implementations
│   ├── services/        # Business logic
│   ├── components/      # Terminal UI
│   ├── state/           # State management
│   └── ...              # Other subdirectories
└── tests/               # Validation tests
```

### Nano Claude Code (Python)

```
nano-claude-code/
├── nano_claude.py       # Entry point (~748 lines)
├── agent.py             # Agent loop (~174 lines)
├── providers.py         # Multi-provider (~507 lines)
├── tools.py             # Tool dispatch (~467 lines)
├── tool_registry.py     # Registry (~98 lines)
├── context.py           # System prompt (~135 lines)
├── compaction.py        # Context compression (~196 lines)
├── config.py            # Config (~72 lines)
├── memory/              # Memory package
├── skill/               # Skill package
├── multi_agent/         # Multi-agent package
└── tests/               # Tests
```

## 3. Feature Comparison

| Feature | Original | Claw-Code | Nano |
|---------|----------|-----------|------|
| Streaming API | ✅ | ✅ | ✅ |
| Tool execution | ✅ | ✅ | ✅ |
| Slash commands | ~87 | ~20 | 17 |
| Context compression | ✅ | Partial | ✅ |
| Memory system | ✅ | ✅ | ✅ |
| Multi-agent | ✅ | ✅ | ✅ |
| MCP integration | ✅ | ❌ | Partial |
| Permission system | ML-based | Rule-based | Simple |
| Session persistence | ✅ | ✅ | ✅ |
| Model providers | Anthropic | Multiple | Multiple |

## 4. Core Loop Comparison

### Original Source

```typescript
// TypeScript - Original
async function* query(request: QueryRequest) {
  const stream = await anthropic.messages.stream({
    model: config.model,
    messages: buildMessages(request),
    system: systemPrompt,
    tools: toolDefinitions,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_stop') {
      const results = await executeTools(event.tool_calls);
      yield* results;
    }
  }
}
```

### Claw-Code

```python
# Python - Claw-Code
class QueryEnginePort:
    async def query(self, request: QueryRequest) -> AsyncIterator[Message]:
        async for event in self.client.messages.stream(
            model=self.config.model,
            messages=self.build_messages(request),
            system=self.system_prompt,
            tools=self.tool_definitions,
        ):
            if event.type == 'content_block_stop':
                results = await self.execute_tools(event.tool_calls)
                async for result in results:
                    yield result
```

### Nano Claude Code

```python
# Python - Nano Claude Code
async def run_loop(messages: list[dict]) -> AsyncIterator[dict]:
    async for event in await provider.messages_stream(
        model=config.model,
        messages=messages,
        system=build_system_prompt(),
        tools=build_tools(),
    ):
        if event.type == 'content_block_stop':
            results = await execute_tools(event.tool_calls)
            for result in results:
                yield result
```

## 5. Multi-Provider Support

### Nano Claude Code Providers

| Provider | Models |
|----------|--------|
| Anthropic | Claude 3.5 / Claude 4 |
| OpenAI | GPT-4 / o-series |
| Google | Gemini |
| Moonshot | Kimi |
| Alibaba | Qwen |
| Zhipu | GLM |
| DeepSeek | DeepSeek |
| Ollama | Llama3 / Qwen2.5 / etc |
| vLLM | Any OpenAI-compatible |

### Claw-Code Providers

| Provider | Models |
|----------|--------|
| Anthropic | Claude 3.5 / Claude 4 |

## 6. License

### Original Source
> Proprietary — All rights reserved by Anthropic

### Claw-Code
> MIT License — Clean-room implementation

### Nano Claude Code
> MIT License — Minimal reimplementation

## 7. Use Cases

| Use Case | Recommended |
|----------|-------------|
| Research/Analysis | Original Source |
| Learning architecture | Claw-Code |
| Production use | Nano Claude Code |
| Custom development | Claw-Code |
| Quick prototyping | Nano Claude Code |

## 8. Community

| Project | Stars | Contributors |
|---------|-------|--------------|
| claw-code | 30K+ | 100+ |
| nano-claude-code | Growing | 20+ |
| collection | 10K+ | 50+ |
