---
title: Vibe Coding 做了2个项目后，我总结了这些实战技巧
date: '2026/3/8'
lastmod: '2026/3/8'
tags: [公众号]
draft: false
summary: 'Vibe Coding 的效率天花板，不在你写 prompt 的能力，而在你给 AI 搭建的"工作环境"。'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrCf8Bvhm95sMKTZP6geAG9hshHcA1FicFOxk7QMmu9O83kFuKNSFzQ7BibI5ZvubIicURmUj0NYcnFs310ibHcPYiaNvjs1FSG4eMU/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: vibe-coding-做了2个项目后我总结了这些实战技巧
---

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrCf8Bvhm95sMKTZP6geAG9hshHcA1FicFOxk7QMmu9O83kFuKNSFzQ7BibI5ZvubIicURmUj0NYcnFs310ibHcPYiaNvjs1FSG4eMU/640?wx_fmt=png&from=appmsg)

Vibe Coding 的效率天花板，不在你写 prompt 的能力，而在你给 AI 搭建的"工作环境"。

用了一段时间 Cursor 之后，我越来越意识到：大多数人 vibe coding 效率上不去，不是 AI 不够聪明，而是工作流没跑通。以下是我踩完坑之后沉淀下来的几个核心技巧。

---

## 技巧一：选用 AI 友好的技术栈，从脚手架开始

我目前的主力栈：**Next.js + Tailwind CSS + Shadcn UI + Tanstack Query + Prisma + PostgreSQL**。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlqkKI0jj8esbYNkVSz1gtdAcB62EPA8m949TPocUToqcBictoibqLpRMyeGqnbLShxLkicW4vALeYhWWpgYLEnIgSTkichQOUpll3M/640?wx_fmt=png&from=appmsg)

选栈的核心标准不是"我喜欢什么"，而是"AI 在哪个栈上生成代码质量最高"。简单说三个原则：

**单文件上下文**：Tailwind 把样式写在 JSX 里，AI 不用跨文件协调，生成准确率高

**透明源码**：Shadcn 组件直接在你项目里，AI 可以读、改、理解，不像 node_modules 里的黑盒组件库

**训练数据充足**：v0.dev、Cursor、Claude 默认输出的就是 Tailwind + Shadcn，生态正循环

**起步别从零开始。**  用 CLI 创建项目，或者去 GitHub 搜  `starter`、`template`、`boilerplate`。这一步能省大量 token——让 AI 从头搭脚手架容易因为网络问题失败，而且浪费上下文。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NX8ZoYnTZlppL3R8tTI4icVb64SWdSFPrFKsFrJ05f4fU2KfjcDY1icwIRJoNAft0ia0mtqo6G51uQ03uL16Cfmz4bPgOsc0sO4ajM6NW7471w/640?wx_fmt=jpeg&from=appmsg)

---

## 技巧二：初始化你的 claude.md / agent.md

Rules 文件是你和 AI 之间的"项目共识文档"。没有它，AI 每次对话都像一个新来的实习生，什么都不知道。

**什么时候初始化？**

已有项目：直接用  `/init`  命令，AI 会自动扫描项目结构生成

新项目：先跑通一个基础功能再初始化，否则内容太空

![](https://mmbiz.qpic.cn/mmbiz_jpg/NX8ZoYnTZloR4p7CE3s5WeZAfqwkmf5775qCYAWaRJrrHwxA4J7pXHfjyUnxTGTy6flWDX3lRs82RyOniaeQry9mVic9ggOQp8PicPl4mGXZiaw/640?wx_fmt=jpeg&from=appmsg)

以下是我总结的`claude.md`文件结构示例

    1. 项目概述- 项目类型- 主要功能特性（1到 2 句话概述）2. 技术栈- 框架、数据库、认证、UI 库等- 关键依赖版本3. 开发命令- npm run dev / build / start- 数据库相关命令（Prisma）4. 目录结构- 清晰展示各目录用途（`src/`不以`@src`开头，会导致上下文加载过长）5. 关键模式- Service 函数模式- React Query + API Client 模式- API 路由约定- 错误处理方式6. 数据库 Schema- 核心模型说明- 特殊系统逻辑（如积分过期、 FIFO 消费）7. 认证方式- Session / API Key / Admin 权限8. 国际化- 语言配置- 路由方式9. 常见任务- 添加新 API 资源的步骤- 添加 React Query mutation 的模板- 数据库变更流程

**四个维护原则：**

AI 初始化，人工确认

简洁实用，只记录实际在用的模式

随项目演进同步更新

提供可直接参考的代码示例

Rules 文件不是写一次就完事的文档，它应该像代码一样随项目迭代。

---

## 技巧三：如果只推荐一个 Skill，我推荐 Superpowers

superpowers — 这是一个为 AI 编程 Agent 打造的完整开发工作流系统。它的核心理念是：通过一套可组合的"技能"，让 AI 自动遵循最佳实践，而不是像没经验的初级工程师一样随意发挥。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/NX8ZoYnTZlqv7NUibLsUNiagWGCFNAGh4ZpiawpCL6hnicoMaQfsl6ewiam1AwRib3DQvnpDo46DF7A75qicKsKaZicXibKibjFibNH26o0G9ZUgSJ447g/640?wx_fmt=jpeg&from=appmsg)

**四个核心原则：**

**测试驱动**：永远先写测试，没看到测试失败，就不能确定测试是否有效

**系统化而非临时化**：用流程替代猜测，每个技能都有明确的决策流程

**复杂度削减**：YAGNI 原则，积极删除不必要的功能

**证据而非声明**：宣布完成之前必须验证，看到测试通过，而不是"我觉得可以了"

**五阶段工作流：**

1

**头脑风暴**（brainstorming）— AI 不会直接写代码，而是苏格拉底式一次问一个问题，帮你厘清需求。设计方案分小节呈现，每节确认后再继续

2

**工作区隔离**（git worktrees）— 创建新分支和 worktree，不污染主分支

3

**编写计划**（writing-plans）— 把设计拆成 2-5 分钟的小任务，每个任务有精确的文件路径、代码片段和验证步骤

4

**子代理执行**（subagent-driven）— 主代理为每个任务派遣子代理，完成后两阶段审查：先查规格符合性，再查代码质量，循环直到通过

5

**收尾**（finishing）— 验证测试、合并/创建 PR、清理 worktree

**关键体验：你只需要触发第一个命令，后续流程会自动串联执行。**

---

## 技巧四：数据库和 API 设计，从 Brainstorm 开始而不是 Plan Mode

这是我踩过最大的坑之一。

很多人拿到需求直接用 Plan Mode 让 AI 去规划执行步骤。**不要这样做。** Plan Mode 是 AI 自主决策定义的 task，它很容易跑偏——其中一个步骤判断错了，后续步骤会跟着全错，最后你花更多时间去修。

正确的做法是用  `/brainstorm`  命令，和 AI 一起完成数据库设计和 API 设计。AI 会一次问你一个问题，帮你把需求想清楚、把边界理清楚，最后输出一份你们都认可的设计方案。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZloT9UVLvaKS9kO43WXjopk82hksRlk8F9LVDBAjFtzxmYICKfT6IWgDfJmmVXOhwohNXs2E6P78MluHjXv5P30icbqInntiav3QE/640?wx_fmt=png&from=appmsg)

**Vibe Coding 的时间分配应该是：**

**70% 讨论** — 和 AI 一起头脑风暴、明确需求和设计

**20% AI 执行** — 设计确认后让 AI 去写代码

**10% 人工 Review** — 看不懂的代码不提交

**那什么时候可以直接用 Plan Mode？**  有明确执行步骤、不需要 AI 做设计决策的任务。比如：把单个 HTML 拆成多个 React 组件，给多个页面做 i18n 翻译。这类任务是纯执行，Plan Mode 反而高效。

一句话总结：**需要决策的用 Brainstorm，纯执行的用 Plan Mode。**

---

## 技巧五：前端设计——先出 HTML 原型，再组件化

让 AI 直接生成一个完整页面的 React 组件，效果往往不理想。我摸索出的工作流是分两步走：

**第一步：在 Google AI Studio 里用 Gemini 生成单个静态 HTML。**

只要静态的，不要交互逻辑。关键是——多生成几个风格方案，挑你最满意的那个。这一步的目的是快速锁定视觉方向，HTML 是最低成本的原型。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NX8ZoYnTZlpVeRO3vhEuMpPMs0m7vgE9UicnFcYrrw6xdpRSDD9oSDXesy9BIIFeB5DJGQ8we4eMG0gwLOwlALIRH2owcZLUogY3OILRWH8o/640?wx_fmt=jpeg&from=appmsg)

**第二步：把选中的 HTML 下载到项目里，让 Cursor 根据 HTML 拆成多个 React 组件。**

AI 在"照着已有 HTML 实现组件"这件事上准确率远高于"从零想象一个页面"。给它一个视觉参考，它的发挥就稳定得多。

**工具搭配建议：**

设计感要求高的：用  `claude-opus`  模型配合  `ui-ux-pro-max`  风格，出来的效果比较新颖

快速出原型的：Google AI Studio + Gemini，免费且快

---

## 技巧六：用语音输入法提效

AI 时代，你的打字速度和文字组织能力已经跟不上你的想法了。你脑子里想的是一整段需求描述，手指打出来的却是关键词拼凑。

选一款好的语音输入法，能让你和 AI 的沟通效率翻倍：

**闪电说** — 免费，本地模型，离线可用。缺点是中英文混合识别不太准

**智谱 AutoGLM** — 中英混合识别更好，适合写代码场景下夹杂英文术语

不要小看这个技巧，当你习惯了语音输入之后，和 AI 对话的体验会从"打字聊天"变成"语音会议"。

---

Vibe Coding 的核心不是写出完美的 prompt，而是搭好工作流：**选对技术栈、写好 Rules、用 Brainstorm 做设计、让 AI 在正确的轨道上跑。**

使用这套技巧后，往往能够一次对话就成功，我已经上线了 2 个站点 Vibe Design 和 MD2Card，并且节约了大量时间，最后说下本文就是  `/brainstorm`  命令实现的，我负责灌输想法，ai 负责写。
