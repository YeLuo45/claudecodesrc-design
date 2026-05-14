import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Claude Code Source Design",
  description: "Claude Code 源码分析设计文档 — Decompiled TypeScript Source Analysis v2.1.88",

  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["meta", { name: "theme-color", content: "#f59e0b" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Claude Code Source Design" }],
    ["meta", { property: "og:description", content: "Claude Code 源码分析设计文档" }],
  ],

  lang: "zh-CN",
  base: "/claudecodesrc-design/",

  themeConfig: {
    logo: "/favicon.svg",
    siteTitle: "Claude Code Source Design",

    nav: [
      { text: "首页", link: "/" },
      { text: "架构总览", link: "/architecture" },
      { text: "核心模块", link: "/core-modules" },
      { text: "工具系统", link: "/tool-system" },
      { text: "命令系统", link: "/slash-commands" },
      { text: "权限系统", link: "/permission-system" },
      { text: "上下文管理", link: "/context-management" },
    ],

    sidebar: {
      "/": [
        {
          text: "快速开始",
          items: [
            { text: "首页", link: "/" },
            { text: "架构总览", link: "/architecture" },
          ],
        },
        {
          text: "核心模块",
          items: [
            { text: "主程序入口", link: "/core-modules#main" },
            { text: "查询引擎", link: "/core-modules#query-engine" },
            { text: "命令系统", link: "/core-modules#commands" },
            { text: "工具注册", link: "/core-modules#tools" },
            { text: "上下文构建", link: "/core-modules#context" },
            { text: "历史管理", link: "/core-modules#history" },
          ],
        },
        {
          text: "工具系统",
          items: [
            { text: "文件操作", link: "/tool-system#file" },
            { text: "代码搜索", link: "/tool-system#search" },
            { text: "系统执行", link: "/tool-system#system" },
            { text: "Web 访问", link: "/tool-system#web" },
            { text: "任务管理", link: "/tool-system#task" },
            { text: "子 Agent", link: "/tool-system#subagent" },
            { text: "MCP 集成", link: "/tool-system#mcp" },
          ],
        },
        {
          text: "命令系统",
          items: [
            { text: "命令列表", link: "/slash-commands" },
          ],
        },
        {
          text: "权限系统",
          items: [
            { text: "三种模式", link: "/permission-system#modes" },
            { text: "ML 分类器", link: "/permission-system#classifier" },
          ],
        },
        {
          text: "上下文管理",
          items: [
            { text: "自动压缩", link: "/context-management#compact" },
            { text: "Token 计数", link: "/context-management#token" },
          ],
        },
        {
          text: "子项目对比",
          items: [
            { text: "项目对比", link: "/subprojects" },
          ],
        },
      ],
    },

    footer: {
      message: "基于公开信息的学术研究项目",
      copyright: "Claude Code Source Design Documentation",
    },

    search: {
      provider: "local",
    },
  },

  vite: {
    css: {
      preprocessorOptions: {},
    },
  },
});
