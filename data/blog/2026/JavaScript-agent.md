---
title: 使用 JavaScript 从零实现一个 ReAct Agent
date: '2026/7/10'
lastmod: '2026/7/10'
tags: [AI 编程]
draft: false
summary: '从零用 JavaScript 实现一个 ReAct Agent：工具定义、系统提示词、Action 解析、流式输出和 TAO 循环，最后跑出能写多文件贪吃蛇的极简 Codex。'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_jpg/NX8ZoYnTZloSkKibOR0uP5XVZLjMzvhcpo03vbmKGwXSSFtqIY3Aa5IJDqRWGunISMCDyIU02cZwZQmsjb8QF1XiaIQSIMTEBE1lvhgRNOpNY/0?wx_fmt=jpeg,
  ]
authors: ['default']
layout: PostLayout
---

## 1. 初始化项目

使用 Bun 快速创建一个 TypeScript 项目：

```bash
mkdir react-agent
cd react-agent
bun init
# 模板选择 Blank
```

如果还没装 Bun：

```bash
curl -fsSL https://bun.sh/install | bash
```

安装依赖：

```bash
bun add openai
```

修改 `index.ts`：

```ts
import OpenAI from 'openai'
import readline from 'readline'
import fs from 'fs'
import path from 'path'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  // 换成你自己的 Key，也可以用 process.env.DEEPSEEK_API_KEY
  apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
```

这些内容在 002 篇已经介绍过，就不多说了。后面工具写文件会用到 `fs` 和 `path`，一并先导入。

## 2. 流程梳理

在写代码之前，我们先把 ReAct Agent 的运行流程梳理一下：

1. 把用户的提问 + 系统提示词发给 LLM
2. LLM 返回 Thought（思考）+ Action（行动）
3. 如果 Action 是 `Finish【答案】`，结束循环，输出答案
4. 如果 Action 是调用工具，执行工具，将结果以 Observation 的形式追加到对话中
5. 回到第 1 步，继续循环

接下来我们就来实现一个极简版的 Codex——我们说需求，Agent 生成代码。

比如我们跟 Agent 说：

> 使用 HTML + CSS + JS 生成一个贪吃蛇小游戏，代码放在不同的文件中

Agent 便会生成贪吃蛇的代码文件。

PS：之所以要求放在不同的文件中，是为了让 Agent 多走几个 TAO 循环，否则它直接生成一个带脚本和样式的 HTML 文件，那就直接结束了。

## 3. 定义工具

极简 Codex 只需要一个核心工具：`write_file`。能写文件，就能写项目。

为了避免 Agent 把文件撒得到处都是，我们约定所有输出都落到项目下的 `workspace/` 目录：

```ts
const WORK_DIR = path.join(process.cwd(), 'workspace')

if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR, { recursive: true })
}

const tools = {
  write_file(filePath: string, content: string) {
    // 禁止路径穿越，Agent 再怎么胡写也只能落在 workspace 里
    if (filePath.includes('..')) {
      return '错误：路径不能包含 ..'
    }

    const fullPath = path.join(WORK_DIR, filePath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content, 'utf-8')
    return `文件 ${filePath} 写入成功（${content.length} 字符）`
  },
}
```

这里有两点值得注意：

1. **自动建目录**：`snake/css/style.css` 这种路径，中间目录不存在也能写进去。
2. **返回 Observation 文案**：工具执行结果会塞回对话，LLM 下一轮才能知道「写成功了」还是「写失败了」。

真实 Codex / Claude Code 还会有 `read_file`、`list_dir`、`run_command` 等，原理一样：函数进，字符串出。本篇只留 `write_file`，把主链路走通。

## 4. 系统提示词：把 ReAct 规矩写死

ReAct 不靠框架魔法，靠的是 **提示词约束输出格式**。我们要求模型每次只输出一轮 `Thought + Action`，并且工具调用用中文方括号包参数：

```ts
const SYSTEM_PROMPT = `你是一个能写代码的 AI Agent，遵循 ReAct（Thought → Action → Observation）模式工作。

你必须严格按照下面的格式输出，每次只输出一轮 Thought 和 Action：

Thought: 你的思考过程
Action: 工具调用

可用工具：

1. write_file【相对路径】
   在 Action 的下一行用 Markdown 代码块写文件内容，例如：
   Action: write_file【index.html】
   \`\`\`html
   <!DOCTYPE html>
   <html></html>
   \`\`\`

2. Finish【最终答案】
   所有文件都写完、任务完成后调用，例如：
   Action: Finish【已生成贪吃蛇游戏，共 3 个文件】

规则：
- 每次只调用一个工具，不要一次输出多个 Action
- 文件路径使用相对路径，会写入 workspace 目录
- 代码要完整、可直接运行
- 不要自己编造 Observation，Observation 由系统在你调用工具后返回
- 多文件任务请分多轮 write_file，最后再 Finish
`
```

格式上我们做了两个约定：

- **`Finish【答案】`**：和上一篇讲的 TAO 循环收尾一致。
- **`write_file【路径】` + 代码块**：文件内容经常是多行 HTML/CSS/JS，塞进一行参数里很难解析，所以内容放在 Action 后面的 fenced code block 里。

## 5. 解析 Action

LLM 返回的是纯文本，我们要自己把 Action 抠出来。用两个正则分别匹配 `Finish` 和 `write_file`：

````ts
type AgentAction =
  | { type: 'finish'; answer: string }
  | { type: 'write_file'; path: string; content: string }

function parseAction(text: string): AgentAction | null {
  const finishMatch = text.match(/Action:\s*Finish【([\s\S]*?)】/)
  if (finishMatch) {
    return { type: 'finish', answer: finishMatch[1].trim() }
  }

  // 兼容 ```html / ```css / ```js / 无语言标记
  const writeMatch = text.match(
    /Action:\s*write_file【([^】]+)】\s*\n?```(?:[\w-]*\n)?([\s\S]*?)```/
  )
  if (writeMatch) {
    return {
      type: 'write_file',
      path: writeMatch[1].trim(),
      content: writeMatch[2].replace(/\n$/, ''),
    }
  }

  return null
}
````

可以先在本地用假数据测一下解析，确认路径和内容都能拿对，再接真实模型：

```ts
const demo = `Thought: 先写 HTML
Action: write_file【index.html】
\`\`\`html
<!DOCTYPE html>
<html></html>
\`\`\``

console.log(parseAction(demo))
// => { type: 'write_file', path: 'index.html', content: '<!DOCTYPE html>\n<html></html>' }
```

解析失败时不要直接崩溃，把错误当 Observation 扔回去，让模型按格式重试，下一节循环里会处理。

## 6. 流式输出：边生成边打印

如果不加流式，`chat.completions.create` 会等模型把整段 Thought + Action（含完整文件内容）生成完才返回。写一个稍长的 `game.js` 时，控制台会卡好几秒，像死机一样。

Coding Agent 更自然的体验是：**字一个个往外蹦**。OpenAI SDK 兼容接口都支持 `stream: true`，DeepSeek 也一样。改动集中在 `chat` 函数：

```ts
/** 流式调用 LLM：边生成边往控制台打字，同时拼出完整文本供解析 Action */
async function chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: 0.2,
    stream: true,
  })

  let full = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      process.stdout.write(delta)
      full += delta
    }
  }
  // 流结束后补一个换行，避免 Observation 粘在最后一行
  process.stdout.write('\n')
  return full
}
```

几点说明：

1. **`stream: true`** 之后，返回值不再是一次性的 `ChatCompletion`，而是可 `for await` 的异步迭代器。
2. 每个 chunk 里只有增量文本 `delta.content`，用 `process.stdout.write` 立刻打到终端；不要用 `console.log`，否则每个 token 都会换行。
3. 一边打印一边把 delta 拼进 `full`。流结束后 `full` 才是完整回复，后面的 `parseAction(full)` 和消息历史都依赖它。
4. 流式只影响「怎么展示」，不影响 ReAct 语义：仍是凑齐一整轮 Thought + Action 再执行工具。

## 7. 实现 TAO 循环

主循环还是那几步：发消息 → 解析 Action → 执行工具 → 追加 Observation → 再发消息。差别是 `chat()` 已经实时打印了，循环里不要再 `console.log(reply)`，否则会打两遍。

```ts
async function runAgent(userInput: string) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userInput },
  ]

  const maxSteps = 15

  for (let step = 1; step <= maxSteps; step++) {
    console.log(`\n===== 第 ${step} 轮 =====`)

    // chat() 内部已实时输出，这里不要再 console.log(reply)
    const reply = await chat(messages)
    messages.push({ role: 'assistant', content: reply })

    const action = parseAction(reply)

    // 格式不对：把错误当 Observation，让模型重试
    if (!action) {
      const observation =
        '无法解析 Action。请严格按格式输出 Thought 和 Action；write_file 后必须紧跟代码块。'
      console.log('\nObservation:', observation)
      messages.push({ role: 'user', content: `Observation: ${observation}` })
      continue
    }

    // 结束
    if (action.type === 'finish') {
      console.log('\n最终答案:', action.answer)
      return action.answer
    }

    // 执行 write_file
    let observation: string
    try {
      observation = tools.write_file(action.path, action.content)
    } catch (err) {
      observation = `错误: ${(err as Error).message}`
    }

    console.log('\nObservation:', observation)
    messages.push({ role: 'user', content: `Observation: ${observation}` })
  }

  console.log(`\n达到最大步数 ${maxSteps}，停止循环`)
}
```

对照一下第 2 节讲的流程：

| 步骤             | 代码在哪                                                       |
| ---------------- | -------------------------------------------------------------- |
| Thought + Action | `chat()` 流式拼接后的完整文本                                  |
| 实时输出         | `process.stdout.write(delta)`                                  |
| 判断 Finish      | `action.type === 'finish'`                                     |
| 执行工具         | `tools.write_file(...)`                                        |
| Observation 回灌 | `messages.push({ role: 'user', content: 'Observation: ...' })` |
| 继续循环         | `for` 下一轮再调 `chat()`                                      |

`maxSteps` 是保险：模型如果一直不 Finish，或者解析一直失败，不至于死循环烧 token。

## 8. 接上交互入口

最后把 readline 和 `runAgent` 接起来：

```ts
rl.question('你想让 Agent 做什么？\n> ', async (input) => {
  try {
    await runAgent(input.trim())
  } catch (err) {
    console.error('运行失败:', err)
  } finally {
    rl.close()
  }
})
```

完整 `index.ts` 按上面 1 ～ 8 节拼在一起即可。文件结构大致是：

```text
react-agent/
├── index.ts
├── package.json
└── workspace/          # 运行后自动生成，Agent 写的文件在这里
    ├── index.html
    ├── style.css
    └── game.js
```

## 9. 运行

把 API Key 填好后执行：

```bash
bun run index.ts
```

提示词可以这样输入：

```text
你想让 Agent 做什么？
> 使用 HTML + CSS + JS 生成一个贪吃蛇小游戏，代码分别放在 index.html、style.css、game.js 三个文件中，要求能用方向键控制，吃到食物会变长。
```

开了流式之后，你会看到 Thought、Action 和代码块像打字一样往外冒，而不是卡一会儿再整段弹出：

````text
===== 第 1 轮 =====
Thought: 先创建 HTML 结构，引入样式和脚本
Action: write_file【index.html】
```html
<!DOCTYPE html>
...
````

Observation: 文件 index.html 写入成功（... 字符）

===== 第 2 轮 =====
Thought: 接下来写样式
Action: write_file【style.css】
...

===== 第 3 轮 =====
Thought: 最后写游戏逻辑
Action: write_file【game.js】
...

===== 第 4 轮 =====
Thought: 三个文件都写完了
Action: Finish【已生成贪吃蛇小游戏，打开 index.html 即可游玩】

````

跑完后：

```bash
ls workspace
# index.html  style.css  game.js

# 用浏览器打开
open workspace/index.html   # macOS
# 或直接双击 index.html
````

如果方向键能控制蛇移动、吃到食物会变长，这个极简 ReAct Agent 就算跑通了。

## 10. 常见问题

**1. 解析一直失败**

模型有时会写成 `Action: write_file(index.html)`，或者代码块忘了闭合。Observation 已经在引导它重试；如果连续失败，可以把 `temperature` 再调低，或在用户问题末尾补一句：

> 请严格使用 write_file【路径】+ 代码块 的格式，分多轮写入。

**2. 一次写多个文件 / 一次多个 Action**

提示词里写了「每次只调用一个工具」，但仍可能出现。当前解析器只取第一段匹配到的 Action，多写的部分会被忽略。这也是 ReAct 文本协议的老问题，后面如果上官方 function calling，会稳很多。

**3. 控制台还是整段一起出来**

检查三点：`stream: true` 是否写上了；打印用的是 `process.stdout.write` 而不是等全部结束后再 `console.log`；循环里没有对 `reply` 再打一遍。部分终端或日志采集器会缓冲 stdout，本地交互式终端一般没问题。

**4. 生成的贪吃蛇不能玩**

Agent 能写文件，不代表代码一定对。你可以继续加工具，比如 `read_file` 让它自查，或者你把报错贴回去再跑一轮。本篇目标是把 TAO 循环跑通，不是保证游戏质量。

**5. 没有 Bun**

逻辑是标准 Node API，也可以：

```bash
npm init -y
npm i openai
npx tsx index.ts
```

## 11. 完整代码

为了方便复制，把可运行的 `index.ts` 放在下面（记得替换 API Key）：

````ts
import OpenAI from 'openai'
import readline from 'readline'
import fs from 'fs'
import path from 'path'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
})

const WORK_DIR = path.join(process.cwd(), 'workspace')
if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR, { recursive: true })
}

const tools = {
  write_file(filePath: string, content: string) {
    if (filePath.includes('..')) {
      return '错误：路径不能包含 ..'
    }
    const fullPath = path.join(WORK_DIR, filePath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content, 'utf-8')
    return `文件 ${filePath} 写入成功（${content.length} 字符）`
  },
}

const SYSTEM_PROMPT = `你是一个能写代码的 AI Agent，遵循 ReAct（Thought → Action → Observation）模式工作。

你必须严格按照下面的格式输出，每次只输出一轮 Thought 和 Action：

Thought: 你的思考过程
Action: 工具调用

可用工具：

1. write_file【相对路径】
   在 Action 的下一行用 Markdown 代码块写文件内容，例如：
   Action: write_file【index.html】
   \`\`\`html
   <!DOCTYPE html>
   <html></html>
   \`\`\`

2. Finish【最终答案】
   所有文件都写完、任务完成后调用，例如：
   Action: Finish【已生成贪吃蛇游戏，共 3 个文件】

规则：
- 每次只调用一个工具，不要一次输出多个 Action
- 文件路径使用相对路径，会写入 workspace 目录
- 代码要完整、可直接运行
- 不要自己编造 Observation，Observation 由系统在你调用工具后返回
- 多文件任务请分多轮 write_file，最后再 Finish
`

type AgentAction =
  | { type: 'finish'; answer: string }
  | { type: 'write_file'; path: string; content: string }

function parseAction(text: string): AgentAction | null {
  const finishMatch = text.match(/Action:\s*Finish【([\s\S]*?)】/)
  if (finishMatch?.[1] != null) {
    return { type: 'finish', answer: finishMatch[1].trim() }
  }

  const writeMatch = text.match(
    /Action:\s*write_file【([^】]+)】\s*\n?```(?:[\w-]*\n)?([\s\S]*?)```/
  )
  if (writeMatch?.[1] != null && writeMatch[2] != null) {
    return {
      type: 'write_file',
      path: writeMatch[1].trim(),
      content: writeMatch[2].replace(/\n$/, ''),
    }
  }

  return null
}

/** 流式调用 LLM：边生成边往控制台打字，同时拼出完整文本供解析 Action */
async function chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: 0.2,
    stream: true,
  })

  let full = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      process.stdout.write(delta)
      full += delta
    }
  }
  process.stdout.write('\n')
  return full
}

async function runAgent(userInput: string) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userInput },
  ]

  const maxSteps = 15

  for (let step = 1; step <= maxSteps; step++) {
    console.log(`\n===== 第 ${step} 轮 =====`)

    // chat() 内部已实时输出，这里不要再 console.log(reply)
    const reply = await chat(messages)
    messages.push({ role: 'assistant', content: reply })

    const action = parseAction(reply)

    if (!action) {
      const observation =
        '无法解析 Action。请严格按格式输出 Thought 和 Action；write_file 后必须紧跟代码块。'
      console.log('\nObservation:', observation)
      messages.push({ role: 'user', content: `Observation: ${observation}` })
      continue
    }

    if (action.type === 'finish') {
      console.log('\n最终答案:', action.answer)
      return action.answer
    }

    let observation: string
    try {
      observation = tools.write_file(action.path, action.content)
    } catch (err) {
      observation = `错误: ${(err as Error).message}`
    }

    console.log('\nObservation:', observation)
    messages.push({ role: 'user', content: `Observation: ${observation}` })
  }

  console.log(`\n达到最大步数 ${maxSteps}，停止循环`)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('你想让 Agent 做什么？\n> ', async (input) => {
  try {
    await runAgent(input.trim())
  } catch (err) {
    console.error('运行失败:', err)
  } finally {
    rl.close()
  }
})
````

## 12. 小结

这篇文章做的事其实就五块：

1. **工具**：一个 `write_file`，负责和外部环境交互
2. **提示词**：把 Thought / Action / Finish 的格式钉死
3. **解析器**：从纯文本里抠出要执行的动作
4. **流式输出**：`stream: true` + `stdout.write`，边生成边看
5. **循环**：执行工具 → Observation 回灌 → 再问模型，直到 Finish

这也是大多数 Coding Agent 的骨架。后面你可以沿同一套思路加 `read_file`、`run_command`，或者换成模型官方的 function calling，主循环结构几乎不用变。

下一篇我们会在这个基础上补工具、加记忆、处理更长任务，让它更接近能干活的 Coding Agent。
