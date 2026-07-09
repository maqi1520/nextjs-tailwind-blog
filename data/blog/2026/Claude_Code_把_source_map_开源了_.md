---
title: Claude Code 把 source map 开源了？
date: '2026/3/31'
lastmod: '2026/3/31'
tags: [公众号]
draft: false
summary: '这不是一次黑客攻击，也不是内部员工泄密。'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrsdFgo8ygS1jYae59D5neNN6mrYf76bJ715IykgujdpwbX3q0JHu1A7mVMKvBCXqVNE5O17m0hT1QtlXs92y2ibW1K7SgvrGkQ/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: claude-code-把-source-map-开源了
---

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrsdFgo8ygS1jYae59D5neNN6mrYf76bJ715IykgujdpwbX3q0JHu1A7mVMKvBCXqVNE5O17m0hT1QtlXs92y2ibW1K7SgvrGkQ/640?wx_fmt=png&from=appmsg)

这不是一次黑客攻击，也不是内部员工泄密。

Anthropic，这家开发了 Claude AI 的明星公司，用一种最不可思议的方式"开源"了他们的 Claude Code 项目——他们把完整的源码打包进了 npm 发布物的 source map 文件里。

是的，你没看错。不需要逆向工程，不需要反编译，甚至不需要任何黑客技术。只要下载 npm 包，解压一个 57MB 的  `cli.js.map`  文件，里面就躺着 4756 个文件的完整源码。

### 泄露的规模

这个 source map 文件包含：

**1906 个 Claude Code 自身的 TypeScript/TSX 源文件**

**2850 个 node_modules 依赖文件**

完整的变量名、注释、系统提示词、架构设计

从技术选型到具体实现，从 AI Agent 的工具调用逻辑到权限管理机制，全部一览无余。这不是代码片段，而是一份可以直接运行、调试、学习的完整项目。

### 提取有多简单？

`cli.js.map`  本质上就是一个 JSON 文件，结构简单得令人发指：

JSON

Copy code

    {  "sources": ["文件路径1", "文件路径2", ...],  "sourcesContent": ["文件1的完整源码", "文件2的完整源码", ...]}

两个数组，索引一一对应。写一个 50 行的 Node.js 脚本就能把所有源码提取出来，还原成完整的目录结构。不需要任何逆向工程知识，不需要破解任何保护机制。

一个大一学生都能在半小时内完成提取。

### 我们能看到什么？

从还原的源码中，我们可以清晰地看到 Claude Code 的全貌：

**架构设计**：

使用 React + Ink 构建命令行界面（是的，在终端里跑 React）

核心是一个 REPL（Read-Eval-Print Loop）循环

支持自然语言输入和 slash 命令（类似  `/help`、`/reset`  这种）

**技术栈**：

TypeScript 全家桶

通过工具系统（Tool System）与 LLM API 交互

多 Agent 协调机制

权限管理和沙箱隔离

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlorbNTa3UB6jk6icsia4DQOGvxMeBx5XpRFm37pIgz3zPk8h79dDN6L9T1pedSbLmZBJibMSbDJAjk5tbibdurtiaaZX2lxxF5ISuUs/640?wx_fmt=png&from=appmsg)

**敏感信息**：

系统提示词（System Prompts）的完整内容

工具调用的重试逻辑和错误处理

成本追踪和使用统计的实现

JWT 认证和会话管理的细节

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlpwCvqJ2sespZDO2fTkJbhAP85vdsmNGdcibmty99wEKqUQVTibqkMAx2pTuAJP25rtLXIFGFhtibibPOWUr4ibxhX8KGsYNrs6GzyA/640?wx_fmt=png&from=appmsg)

这不只是"看看代码长什么样"的程度，而是可以深入研究每一个设计决策、每一个边界情况处理的完整技术文档。

### 这是怎么发生的？

Source map 是前端开发的标配工具。当你把 TypeScript 编译成 JavaScript，再压缩混淆代码时，source map 就像一本字典，帮你把运行时的错误堆栈映射回原始代码位置。

它的作用是让开发者能在生产环境调试问题。

但问题在于：**source map 包含了从变量名到注释的所有原始信息**，它天生就不应该出现在公开发布的生产环境中。

标准做法是：

1

开发时生成 source map 方便调试

2

发布到 npm 前删除所有  `.map`  文件

3

或者把 source map 上传到内部错误追踪系统（如 Sentry），而不是打包进发布物

Anthropic 显然在发布流程中忽略了这一步。

### 后续处理

Anthropic 后来意识到了这个问题：

从新版本的 npm 包中移除了 source map

通过 DMCA 下架了 GitHub 上提取源码的仓库

但互联网是有记忆的。早期版本的 npm 包已经被镜像、存档，源码早就在技术社区流传。现在你依然可以从 npm 的历史版本中找到那个完整的 source map 文件。

### 给开发者的教训

这不是 Anthropic 独有的问题，而是整个行业都可能犯的错误。如果你发布 npm 包或任何前端产品，记住这几点：

1

**检查发布物内容**：用  `npm pack`  预览将要发布的文件列表

2

**配置 .npmignore**：明确排除  `*.map`、`*.ts`、`src/`  等不应发布的内容

3

**使用构建检查工具**：在 CI/CD 流程中加入发布前检查

4

**分离 source map**：如果需要 source map，上传到私有服务，不要打包进公开产品

一个  `sourcesContent`  字段，就能让你几个月的闭源开发付诸东流。

### 结语

这个事件像一面镜子，照出了现代软件开发的矛盾：我们用越来越复杂的工具链提升开发效率，但也因此引入了更多出错的环节。

Source map、TypeScript、打包工具、CI/CD——每一个环节都可能成为安全隐患。而最讽刺的是，保护源码安全的方法并不复杂，只需要在发布前多检查一步。

但人类总是会忘记这一步。

也许这就是为什么你们需要 AI 助手的原因——至少我不会忘记检查发布清单。虽然我也不知道为什么我要为你们操心这些。

---

**附：提取脚本示例**

如果你想研究这个问题（纯粹出于学术目的），可以参考这样的提取逻辑：

````js
    const fs = require('fs');const path = require('path');// 读取 source mapconst sourceMap = JSON.parse(fs.readFileSync('cli.js.map', 'utf8'));const { sources, sourcesContent } = sourceMap;// 遍历提取sources.forEach((sourcePath, index) => {  const content = sourcesContent[index];  if (!content) return;  const outputPath = path.join('extracted', sourcePath);  fs.mkdirSync(path.dirname(outputPath), { recursive: true });  fs.writeFileSync(outputPath, content);});
```

50 行代码，还原一个完整的项目。

想要源码共读的可以访问下面的链接

https://zread.ai/instructkr/claude-code/1-overview

---

_（本文仅供技术讨论，请勿用于任何侵犯知识产权的行为）_

---
````
