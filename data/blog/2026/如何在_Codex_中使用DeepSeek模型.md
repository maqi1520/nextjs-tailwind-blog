---
title: 如何在 Codex 中使用DeepSeek模型
date: '2026/5/28'
lastmod: '2026/5/28'
tags: [公众号]
draft: false
summary: 'Codex token 限额之后，大家怎么办？等下一个 5 小时，还是升级 token plan？'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloqUpPn07MLJ5spKcu64AvQE8w5EFcIdBuF4aF10V6mHXabeiciaqPT0txZejMIsIJG5wxOCx3kicSXRfFtYGZ9EV5cDFKovckF4I/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: 如何在-codex-中使用deepseek模型
---

Codex token 限额之后，大家怎么办？等下一个 5 小时，还是升级 token plan？

我现在用 DeepSeek 来代替，下面说一下我的实现方式。

Codex + DeepSeek + Moon Bridge + CC Switch

Codex 走第三方 API，端点需要兼容 OpenAI Responses 格式，DeepSeek 默认 API 不支持，所以要用 Moon Bridge 做桥接。CC Switch 是可视化的第三方模型切换代理工具，方便在 OpenAI 订阅和 DeepSeek 之间切换。

我现在任务规划用 GPT 5.5，主要借助 superpowers 做头脑风暴和编写 Plan，执行交给 DeepSeek V4 Flash。整个工具工作流都在 Codex 里完成，以免干等下一个 5 小时。

> Moon Bridge 是一个用 Go 编写的协议转换与模型路由代理。对外暴露 OpenAI Responses API（/v1/responses），对内支持 Anthropic Messages、Google Gemini（GenAI）、OpenAI Chat Completions 等多种上游协议。客户端指定不同模型别名时，自动将请求路由到对应上游 Provider 并在协议间自动转换。

## 如何在本地部署运行 Moon Bridge？

克隆 Moon Bridge 并创建本地配置文件：

```shell
git clone
https://github.com/ZhiYi-R/moon-bridge.git
cd moon-bridge
```

创建 `config.yml`，并填入 DeepSeek API Key：

```yaml
mode: 'Transform'

server:
  addr: '127.0.0.1:38440'

models:
  deepseek-v4-pro:
    context_window: 1000000
    max_output_tokens: 384000
    default_reasoning_level: 'high'
    supported_reasoning_levels:
      - effort: 'high'
        description: 'High reasoning effort'
      - effort: 'xhigh'
        description: 'Extra high reasoning effort'
    supports_reasoning_summaries: true
    default_reasoning_summary: 'auto'
    extensions:
      deepseek_v4:
        enabled: true
  deepseek-v4-flash:
    context_window: 1000000
    max_output_tokens: 384000
    default_reasoning_level: 'high'
    supported_reasoning_levels:
      - effort: 'high'
        description: 'High reasoning effort'
      - effort: 'xhigh'
        description: 'Extra high reasoning effort'
    supports_reasoning_summaries: true
    default_reasoning_summary: 'auto'
    extensions:
      deepseek_v4:
        enabled: true

providers:
  deepseek:
    base_url: 'https://api.deepseek.com/anthropic'
    api_key: 'sk-your-deepseek-api-key'
    offers:
      - model: deepseek-v4-pro
      - model: deepseek-v4-flash

routes:
  moonbridge:
    model: deepseek-v4-pro
    provider: deepseek

defaults:
  model: moonbridge
  max_tokens: 65536
```

这是 Moon Bridge 的最小配置，启用 DeepSeek V4 Pro / Flash、Codex 模型元数据和 DeepSeek V4 兼容扩展。**如果需要图片输入、Web Search 或多 Provider 路由**，可以再参考 Moon Bridge 的 `config.example.yml` 扩展配置。

#### 启动 Moon Bridge

```shell
go run ./cmd/moonbridge --config config.yml
```

保持这个终端运行。默认情况下，Moon Bridge 监听 `127.0.0.1:38440`，并提供 OpenAI Responses 兼容接口：

```text
http://127.0.0.1:38440/v1/responses
```

#### 验证

查看可用模型：

```shell
curl http://127.0.0.1:38440/v1/models
```

发送一条 Responses 测试请求：

```shell
curl http://127.0.0.1:38440/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonbridge",
    "input": "请用一句话打个招呼。",
    "max_output_tokens": 1024
  }'
```

## 如何配置 CC Switch

直接在官网下载 CC Switch 对应版本`https://ccswitch.io/zh/`。

添加一个供应商，API Key 随便填，请求地址填 `http://127.0.0.1:38440/v1`，保存即可。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloqUpPn07MLJ5spKcu64AvQE8w5EFcIdBuF4aF10V6mHXabeiciaqPT0txZejMIsIJG5wxOCx3kicSXRfFtYGZ9EV5cDFKovckF4I/640?wx_fmt=png&from=appmsg)

## 配置完成

配置完成后重启 Codex，你会看到已经是 API 模式，模型显示 Custom。问它是什么模型，回答还是 GPT 5.5，实际调用的是 DeepSeek Flash，接下来让它按 plan 执行就行。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlp3cdOC3A0uTeVXicicV3EiaicvBEicKGyqTJ5cdAICr1iaFBZkyYJzkFNNicmvezQUaicBpSMHPTN6dWcrLBHTCwMzLc9yZ3QFDzzyetw/640?wx_fmt=png&from=appmsg)

---

Codex token 见底的时候，我现在的做法是不等，也不急着升级 plan。规划还是 GPT 5.5 + superpowers，执行切 DeepSeek Flash，CC Switch 点一下来回换。工作流还在 Codex 里，只是干活的模型换了，成本下来，5 小时窗口也没那么烦。你要是也卡在限额，按上面步骤搭一遍就能试。
