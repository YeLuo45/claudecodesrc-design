# Slash Commands

> ~87 个斜杠命令的完整列表

## 1. Command Categories

### Git Workflow

| Command | Description |
|---------|-------------|
| `/commit` | 提交当前更改 |
| `/commit-push-pr` | 提交并推送 PR |
| `/review` | 代码审查 |
| `/branch` | 创建/切换分支 |
| `/diff` | 查看差异 |
| `/log` | 查看提交日志 |

### Session Management

| Command | Description |
|---------|-------------|
| `/session` | 会话管理 |
| `/sessions` | 列出所有会话 |
| `/save` | 保存当前会话 |
| `/load` | 加载会话 |
| `/resume` | 恢复会话 |
| `/clear` | 清除会话 |

### Memory

| Command | Description |
|---------|-------------|
| `/memory` | 记忆管理 |
| `/memory-save` | 保存记忆 |
| `/memory-search` | 搜索记忆 |
| `/memory-list` | 列出记忆 |
| `/memory-delete` | 删除记忆 |

### Configuration

| Command | Description |
|---------|-------------|
| `/config` | 配置管理 |
| `/model` | 选择模型 |
| `/temperature` | 设置温度 |
| `/max-tokens` | 设置最大 Token |

### Skills

| Command | Description |
|---------|-------------|
| `/skills` | 技能管理 |
| `/skill` | 使用技能 |
| `/skill-list` | 列出技能 |
| `/skill-create` | 创建技能 |

### MCP

| Command | Description |
|---------|-------------|
| `/mcp` | MCP 管理 |
| `/mcp-serve` | 启动 MCP 服务器 |
| `/mcp-list` | 列出 MCP 服务器 |
| `/mcp-add` | 添加 MCP 服务器 |
| `/mcp-remove` | 移除 MCP 服务器 |

### Permissions

| Command | Description |
|---------|-------------|
| `/permissions` | 权限管理 |
| `/permissions-allow` | 允许操作 |
| `/permissions-deny` | 拒绝操作 |

### Tools

| Command | Description |
|---------|-------------|
| `/tools` | 列出工具 |
| `/tool` | 使用工具 |
| `/help` | 显示帮助 |

### Other

| Command | Description |
|---------|-------------|
| `/voice` | 语音模式 |
| `/desktop` | 桌面模式 |
| `/theme` | 主题设置 |
| `/vim` | Vim 模式 |
| `/copy` | 复制内容 |
| `/exit` | 退出 |

## 2. Command Handler Pattern

```typescript
// 命令处理器模式
interface CommandHandler {
  description: string;
  permissions?: string[];  // 所需权限
  handler: (args: string[], context: CommandContext) => Promise<void>;
}

// 注册命令
const commands: Record<string, CommandHandler> = {
  '/commit': {
    description: 'Commit current changes',
    permissions: ['git'],
    async handler(args, context) {
      // 获取 git 状态
      const status = await git.status();

      // 创建提交
      const commit = await git.commit({
        message: args.join(' ') || 'Update',
        all: true,
      });

      // 输出结果
      console.log(`Committed: ${commit.sha}`);
    },
  },
};
```

## 3. Command Parsing

```typescript
function parseCommand(input: string): ParsedCommand | null {
  // 检查是否以 / 开头
  if (!input.startsWith('/')) {
    return null;
  }

  // 分割命令和参数
  const parts = input.slice(1).split(/\s+/);
  const name = '/' + parts[0];
  const args = parts.slice(1);

  return { name, args, raw: input };
}
```
