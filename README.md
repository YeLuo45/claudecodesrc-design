# ClaudeCodeSrc Design

Design documentation site for [collection-claude-code-source-code](https://github.com/Nilonderg/collection-claude-code-source-code) — Claude Code source code analysis.

**GitHub Repository**: https://github.com/yeluo45/claudecodesrc-design

## Project Structure

```
claudecodesrc-design/
├── docs-site/                 # VitePress documentation site
│   ├── .vitepress/
│   │   ├── config.mjs         # VitePress configuration
│   │   ├── theme/             # Custom theme
│   │   └── public/            # Static assets
│   ├── index.md               # Home page
│   ├── architecture.md         # Architecture overview
│   ├── core-modules.md         # Core modules analysis
│   ├── tool-system.md         # Tool system (40+ tools)
│   ├── slash-commands.md      # Slash commands (~87)
│   ├── permission-system.md   # Permission system
│   ├── context-management.md  # Context management
│   └── subprojects.md         # Subproject comparison
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages deployment
└── package.json
```

## Quick Start

```bash
cd docs-site
pnpm install
pnpm run dev      # Development preview
pnpm run build    # Production build
pnpm run preview  # Preview build
```

## Live Site

https://yeluo45.github.io/claudecodesrc-design/

## Content

| Document | Description |
|----------|-------------|
| [Architecture](https://yeluo45.github.io/claudecodesrc-design/architecture) | Complete architecture overview |
| [Core Modules](https://yeluo45.github.io/claudecodesrc-design/core-modules) | Detailed module analysis |
| [Tool System](https://yeluo45.github.io/claudecodesrc-design/tool-system) | 40+ built-in tools |
| [Slash Commands](https://yeluo45.github.io/claudecodesrc-design/slash-commands) | ~87 slash commands |
| [Permission System](https://yeluo45.github.io/claudecodesrc-design/permission-system) | Three modes + ML classifier |
| [Context Management](https://yeluo45.github.io/claudecodesrc-design/context-management) | Auto-compaction + token counting |
| [Subprojects](https://yeluo45.github.io/claudecodesrc-design/subprojects) | Project comparison |

## Source Projects Analyzed

| Project | Language | Files | Description |
|---------|----------|-------|-------------|
| original-source-code | TypeScript | 1,884 | Raw leaked source |
| claude-code-source-code | TypeScript | ~1,940 | Decompiled v2.1.88 + docs |
| claw-code | Python | 109 | Clean-room rewrite |
| nano-claude-code | Python | ~30 | Minimal multi-provider |

## Key Findings

| Aspect | Details |
|--------|---------|
| Version | v2.1.88 |
| Total Lines | ~163,318 |
| Tool Count | 40+ |
| Slash Commands | ~87 |
| Tech Stack | TypeScript + Bun + React + Ink |

## License

This is an academic research project. All source code belongs to Anthropic.
