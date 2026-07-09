---
title: Reasonix：一个 DeepSeek 专用的终端 Coding Agent，值不值得试？
date: '2026/5/25'
lastmod: '2026/5/25'
tags: [AI 编程, 工具效能]
draft: false
summary: '昨天刷 Hacker News，看到一条讨论挺热闹：有人做了个叫 Reasonix 的终端 coding agent，专门对接 DeepSeek API，主打 prefix cache 命中率高、长会话成本低。帖子 500 多 upvote，评论 200 多条。我顺着链接点进去看了看，也翻了翻评论区...'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlp7k9IicVDAlRheb8T9biaAeoVlulfRTKYbKEmvuniagMDjttIJKk1vevLmclT3lxP4aG0ASHnHWwI5Lvia2bBQGeYRZ07YicRjRWNc/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: reasonix一个-deepseek-专用的终端-coding-agent值不值得试
---

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlp7k9IicVDAlRheb8T9biaAeoVlulfRTKYbKEmvuniagMDjttIJKk1vevLmclT3lxP4aG0ASHnHWwI5Lvia2bBQGeYRZ07YicRjRWNc/640?wx_fmt=png&from=appmsg)

昨天刷 Hacker News，看到一条讨论挺热闹：有人做了个叫 Reasonix 的终端 coding agent，专门对接 DeepSeek API，主打 prefix cache 命中率高、长会话成本低。帖子 500 多 upvote，评论 200 多条。我顺着链接点进去看了看，也翻了翻评论区，有些想法想写下来。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlrvgFXqiciaIId0rtKicDT6lBNQrj6icRzUNEBic4bt3WQTBicwwvjKwic0PDGc4RQHP8pZ17dYYdj8kEK8Oz9PAIS5lPnBwnQ3rOUDms/640?wx_fmt=png&from=appmsg)

## 它到底在卖什么

Reasonix 的定位很直白：终端里的 AI 编程助手，只认 DeepSeek，不走 OpenRouter 那套泛用适配。核心卖点是 cache-first loop，消息 append-only，不重排历史、不 compaction、不在 system prompt 里塞当前时间这类会变的东西，尽量让每次请求的 byte prefix 和上一轮一致，从而吃到 DeepSeek 的 prefix cache。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrP05yibdxSbetZueVCvf5fS9NXLfPUDAAJaq9JTuLicYiaJ63NQ1tcJAkUl3xIaRJ3T9iaTNCQSEHhb5Jo0yk6EdL4QDct3pIj6a4/640?wx_fmt=png&from=appmsg)

官网数字写得很猛：长会话 cache 命中率 90%+，输入 token 成本大约降到 1/5。V4-Flash 未命中，命中 0.014/Mtok。跑起来就一行：

    npx reasonix code

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlqQKibdAHEeyXWd6jxLrWKmMhnrPsNs707qwX0oUXyETQbXiartQOcCVQ5ib2icriaBTNObLFdOjkdGtjW39TN9WzTkOXIaKjtjhTqA/640?wx_fmt=png&from=appmsg)

Node 22+，第一次启动向导填 DeepSeek API key。还有 Tauri 桌面版，和 CLI 共用  `~/.reasonix`  配置。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlojX756H6lsEt6bH2BsMrRanOPGCX4Ta89xvniappNmicuu2h1pNwlkNzccWL2c8PqzeqaoFzswpVSiaS0ahKQAn0MIJUbDBTMianY/640?wx_fmt=png&from=appmsg)

功能上该有的都有：Ink TUI、MCP 一行挂载、`/plan`  只读审计模式、`.reasonix/skills/`  里放 Markdown skill、`reasonix replay`  回放会话。MIT 开源，作者明确说和 DeepSeek 官方无关，是个人 side project。目前已经收录到 DeepSeek 官方文档。

## 我看完的第一反应

技术叙事是清楚的：DeepSeek 的 prefix cache 从 byte 0 开始 fingerprint，很多 agent harness 每轮改 system prompt、做 tool call pruning、compaction，会把 cache 打爆。Reasonix 选择只服务 DeepSeek，用 append-only 换稳定命中，这个 trade-off 说得通。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlpRAjztE2UEt9o22ibz24Qcv5xPyoB4QXv1YAH6gfmbb5Ov1DiaRdmchuK2ITO0e0SYUEuMCibLttqVTz9IBapyeWIkjUUnXKbSXM/640?wx_fmt=png&from=appmsg)

但 HN 评论区最热的质疑也在这里：你真的需要专门为 DeepSeek 写一个新 agent 吗？

有人用 Codex 接了个 DeepSeek bridge，cache hit 39M vs miss 1.6M，桥本身没做任何 cache 优化。也有人说 OpenCode 直连 DeepSeek，今天 1.2 亿 token 命中 cache，miss 只有 260 万；还有人报 98.6% 命中率。结论大概是：只要 harness 不太乱，DeepSeek 的 cache 本来就好用，Reasonix 的增量价值需要看 ARCHITECTURE.md 里那些更细的设计，比如 R1 thought harvest、tool-call repair，而不是「直连 api.deepseek.com」这五个字。

另一个 veteran（jbellis，写 harness 有一年了）说得更直接：OpenCode 那些人不是傻，故意 break prefix cache 往往是因为测过，整体效果更好。tool call pruning 会损 cache，但 Anthropic 用户数据上反而省了 30% spend。把「append-only 永远最优」当公理，可能是在浪费大家时间。如果 DeepSeek 真的需要特殊策略，应该带着数据去提 PR，而不是另起炉灶。

我倾向于认同后半段：cache 是成本杠杆，但不是唯一杠杆。上下文太长模型变笨、compaction 丢信息、plan 模式省误操作，都是 harness 设计的一部分。Reasonix 押注「DeepSeek only + cache first」，适合已经确定长期用 DeepSeek、会话很长、对 token 账单敏感的人；如果你本来就在 OpenCode 、 Claude Code 里接 DeepSeek 且命中率已经 95%+，换工具的动机就不那么强。

## 官网本身成了反面教材

讽刺的是，HN 上最高赞的吐槽之一不是产品逻辑，是 landing page。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlpPyia0EXzja1Y0UW35k01HGEiaDT8PadO7rX3ZrvvGeVDaBPQm14Qb2ElrIlfMEzDwQAiciaKGhFvAOgD9MFLwptYefsNpjwp1CLE/640?wx_fmt=png&from=appmsg)

好几个人说页面像 Codex / Claude 批量生成的「AI slop」：大 hero、stat box、衬线斜体标题、移动端代码示例打字动画把正文顶来顶去，读一半内容往下跳。有人直接说：这工具第一个该修的就是自己的官网。

作者 Alifatisk 在评论里回复过质疑 DeepSeek 模型能力的人，态度挺平和，说可以试试 Qwen、Sonnet 3.5，不一定非要 SOTA。但页面 UX 这块确实拖后腿，第一次印象会打折扣。

## 我还留意到的几个点

**语言和运行时。**  要 Node 22，npx 拉起一整套 JS 生态。评论区有人喊：能不能别又是 npm supply chain，给个 Rust / Go 单文件二进制？有人推 charmbracelet 的 crush（Go 写的，内存大约 1/5）。Reasonix 选 TypeScript + Ink，开发和迭代快，但「终端原生」和「轻量二进制」不是一回事。

**和 Claude Code 的关系。**  有人 Claude $200/月 订阅，最近 IDE 用法收紧，开始看 DeepSeek；也有人 Claude Code 接 DeepSeek API，24M cache hit、170k miss，觉得够用了。Reasonix FAQ 写得很硬：不做 IDE 插件，终端 first，桌面只是 CLI 伴侣。这和 Cursor / Claude Code 是不同赛道。

**自托管 endpoint。** 0.30 起支持非标准 key prefix，改  `baseUrl`  指向内网 DeepSeek。OpenRouter 上也有人报 >95% cache hit，但 provider 路由会不会换 backend、client 能不能分辨，还有争议。

**安全。**  内置工具 sandbox 到启动目录，`/apply`  才落盘，`/plan`  只读。这套和主流 agent 类似，没有特别出格，也没有特别省心；代码仍要过 DeepSeek 的服务器，隐私敏感场景还是得自己掂量。

## 我会怎么用这件事

我把它当成一个有趣的工程实验，而不是「DeepSeek 官方 agent」或「Claude Code 杀手」。作者把 cache 当成 first-class invariant 来设计 loop，文档里 pillar 1 讲 byte-stable prefix，pillar 2/3 讲 reasoning harvest 和 tool-call repair，值得读 ARCHITECTURE.md，哪怕你不装 CLI。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlr3mbAqpW2eJfibpicNF5BSMwibtfpAnvkwqaRlZGQ98XelyCnVhzmc2dzMEF5tl86T1TyEp6a2ctePqKknbSTBDKURJW0YEoGBGw/640?wx_fmt=png&from=appmsg)

如果你已经在用 OpenCode + DeepSeek 且账单满意，没必要为了 94% vs 98% 折腾迁移。如果你长会话、多 tool call、对 cache miss 敏感，或者想找一个 MIT、可自托管、MCP/skills 都齐的 DeepSeek 专用 harness，可以  `npx reasonix code`  试一个下午，看 replay 里的 hit rate 和 spend 再决定。

我暂时不会换主力工具，但会盯着这个项目。side project 能把 cache 机制讲清楚、测试写到 2800+，说明作者真在啃 harness 这层硬骨头。AI coding agent 接下来拼的不只是模型智商，还有谁更懂 provider 的计费细节和 context 怎么少动。Reasonix 至少把这个问题摆到台面上来了。
