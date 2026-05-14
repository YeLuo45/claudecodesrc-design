---
layout: home

hero:
  name: "Claude Code Source Design"
  text: "源码分析设计文档"
  tagline: "基于 collection-claude-code-source-code 的 Claude Code 逆向工程研究 — Decompiled TypeScript Source v2.1.88"
  image:
    src: /banner.png
    alt: Claude Code Source Architecture
  actions:
    - theme: brand
      text: 开始阅读
      link: /architecture
    - theme: alt
      text: 快速参考
      link: /core-modules

features:
  - icon: 🏗️
    title: 架构总览
    details: TypeScript 1,940 文件，163,318 行代码的完整架构分析
  - icon: ⚙️
    title: 核心模块
    details: 主程序入口、查询引擎、命令系统、工具注册的深入解析
  - icon: 🔧
    title: 工具系统
    details: 40+ 内置工具：文件操作、代码搜索、Web 访问、任务管理等
  - icon: ⚡
    title: 命令系统
    details: ~87 个斜杠命令的完整列表和实现分析
  - icon: 🔒
    title: 权限系统
    details: 三种模式 + ML 分类器的智能权限推断
  - icon: 📦
    title: 子项目对比
    details: Original Source / Claw-Code / Nano Claude Code 的架构对比
---
