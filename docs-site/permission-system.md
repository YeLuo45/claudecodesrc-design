# Permission System

> 三种权限模式 + ML 分类器的智能权限推断

## 1. Permission Modes

### Mode Overview

| Mode | Description | Behavior |
|------|-------------|----------|
| `default` | 询问模式 | 每次操作前询问用户 |
| `bypass` | 绕过模式 | 自动允许所有操作 |
| `strict` | 严格模式 | 自动拒绝所有操作 |

### Mode Configuration

```typescript
// 配置权限模式
type PermissionMode = 'default' | 'bypass' | 'strict';

// 设置方式
interface Config {
  permissions: {
    mode: PermissionMode;
    toolOverrides?: Record<string, PermissionMode>;
  };
}
```

## 2. Tool-Level Permissions

```typescript
// 工具级权限覆盖
interface ToolPermission {
  tool: string;
  mode: PermissionMode;
  conditions?: PermissionCondition[];
}

interface PermissionCondition {
  field: string;        // 检查的字段
  operator: 'eq' | 'ne' | 'contains';
  value: any;
}

// 示例：为 BashTool 设置严格模式
const toolPermissions: ToolPermission[] = [
  {
    tool: 'Bash',
    mode: 'default',  // 默认询问
    conditions: [
      {
        field: 'command',
        operator: 'contains',
        value: 'rm -rf',
      },
    ],
  },
];
```

## 3. ML-Based Permission Classifier

### Overview

Claude Code 使用机器学习分类器来预测是否应该允许某个操作：

```typescript
// ML 分类器接口
interface PermissionClassifier {
  // 预测是否允许操作
  predict(tool: string, input: unknown): Promise<boolean>;

  // 训练新数据
  train(samples: PermissionSample[]): Promise<void>;

  // 持久化模型
  save(path: string): Promise<void>;

  // 加载模型
  load(path: string): Promise<void>;
}

// 训练样本
interface PermissionSample {
  tool: string;
  input: unknown;
  label: boolean;  // true = allow, false = deny
  context?: {
    userId?: string;
    projectId?: string;
    time?: Date;
  };
}
```

### Features

分类器使用的特征：

| Feature | Description |
|---------|-------------|
| `tool_name` | 工具名称 |
| `command_type` | 命令类型（read/write/execute） |
| `path_depth` | 路径深度 |
| `is_system_path` | 是否为系统路径 |
| `file_extensions` | 文件扩展名 |
| `command_keywords` | 命令关键词 |
| `time_of_day` | 时间 |
| `user_history` | 用户历史 |

### Training

```typescript
// 训练分类器
async function trainClassifier(samples: PermissionSample[]) {
  const classifier = new PermissionClassifier({
    algorithm: 'gradient_boosting',
    features: [
      'tool_name',
      'command_type',
      'path_depth',
      'is_system_path',
    ],
  });

  await classifier.train(samples);
  await classifier.save('./classifier model.pkl');
}
```

## 4. Permission Flow

```
User Action
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Check Tool-Level Override                             │
│    ├── Override exists ──► Use override mode            │
│    └── No override ──► Continue                         │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Check Global Mode                                     │
│    ├── bypass ──► Allow immediately                     │
│    ├── strict ──► Deny immediately                      │
│    └── default ──► Continue                             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. ML Classifier Prediction                             │
│    ├── Confident (>0.9) ──► Apply prediction            │
│    └── Unconfident ──► Ask user                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
User Prompt (if needed)
    │
    ├── Allow ──► Execute + Update classifier            │
    └── Deny ──► Reject + Update classifier             │
```

## 5. Permission Persistence

```typescript
// 权限规则持久化
interface PermissionRule {
  id: string;
  tool: string;
  pattern: string | RegExp;
  decision: 'allow' | 'deny';
  createdAt: Date;
  updatedAt: Date;
}

// 保存规则
async function saveRule(rule: PermissionRule): Promise<void> {
  const db = await openDB('permissions');
  await db.put('rules', rule);
}

// 加载规则
async function loadRules(): Promise<PermissionRule[]> {
  const db = await openDB('permissions');
  return await db.getAll('rules');
}
```

## 6. Permission UI

### CLI Prompts

```typescript
// 权限询问提示
async function promptPermission(
  tool: string,
  input: unknown
): Promise<boolean> {
  const toolName = chalk.bold(tool);
  const inputStr = JSON.stringify(input, null, 2);

  console.log(`
${chalk.yellow('⚠️  Permission Required')}

Tool: ${toolName}
Input: ${inputStr}

${chalk.gray('[a] Allow')}, ${chalk.gray('[d] Deny')}, ${chalk.gray('[A] Allow all')} ${chalk.gray('[D] Deny all')}
  `);

  const answer = await readline.question('> ');

  switch (answer.toLowerCase()) {
    case 'a': return true;
    case 'd': return false;
    case 'A': await saveGlobalRule(tool, 'allow'); return true;
    case 'D': await saveGlobalRule(tool, 'deny'); return false;
    default: return promptPermission(tool, input);
  }
}
```

### Desktop Notifications

```typescript
// 桌面通知
async function notifyPermission(
  tool: string,
  input: unknown
): Promise<boolean> {
  return new Promise((resolve) => {
    const notification = new Notification({
      title: 'Permission Required',
      body: `Allow ${tool}?`,
      actions: ['Allow', 'Deny'],
    });

    notification.on('action', (_, action) => {
      resolve(action === 'Allow');
    });

    notification.on('close', () => {
      resolve(false);
    });
  });
}
```
