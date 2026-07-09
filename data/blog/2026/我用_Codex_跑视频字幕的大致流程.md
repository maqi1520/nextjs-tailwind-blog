---
title: 我用 Codex 跑视频字幕的大致流程
date: '2026/6/1'
lastmod: '2026/6/1'
tags: [公众号]
draft: false
summary: '这套流程做的事很简单：给一段视频和一段配音，先用本地工具识别字幕，再修掉明显错字，最后把带样式的硬字幕烧进视频。需要的话，还可以从字幕里提炼封面标题，把封面插到视频开头。'
images:
  [
    https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlqG1buE9LbWT53APKamv4ib2gWzsWgbeIWc0wuD23szrkROUmm6iaty3GHZcAgoJxFV6w6ib1EB47mibHabgfNnnqTk7SYuepyzaO0/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: 我用-codex-跑视频字幕的大致流程
---

最近在研究如何使用 codex 自动剪辑视频，现在终于了这套流程。先来看下效果

这套流程做的事很简单：给一段视频和一段配音，先用本地工具识别字幕，再修掉明显错字，最后把带样式的硬字幕烧进视频。需要的话，还可以从字幕里提炼封面标题，把封面插到视频开头。

核心链路是：

```text
音频 -> SRT -> 修字幕 -> ASS
--> 烧录到视频 -> 抽帧检查
```

## 安装前提

我在 Mac 上跑，主要依赖两样：

```bash
brew install ffmpeg
brew install whisper-cpp
```

FFmpeg 负责音视频处理，包括合并音视频、转换字幕、烧录字幕、抽帧检查。whisper.cpp 负责本地语音识别，不需要把音频传到云端。

还需要准备一个 Whisper 模型文件，比如：

```text
ggml-small.bin
```

模型可以从这里下载：

```text
https://huggingface.co/ggerganov/whisper.cpp/tree/main
```

我现在用 small 模型。它体积和速度比较平衡，普通中文口播、教程录屏、少量中英文混排基本够用。遇到专有名词多的内容，再交给大模型做一轮字幕修复。

## 生成 SRT 字幕

最原始的识别命令大概是这样：

```bash
whisper-cli \
  -m ./ggml-small.bin \
  -f speech_1779677983686.mp3 \
  -l zh \
  -ng \
  -osrt \
  -of speech_1779677983686
```

跑完会得到：

```text
speech_1779677983686.srt
```

SRT 里保存的是序号、时间范围和字幕文本：

```srt
1
00:00:01,000 --> 00:00:03,200
大家好，今天我们聊一下 Codex 怎么做视频字幕。
```

这一步只解决“听出来什么”和“什么时候显示”。它不负责样式，也不保证所有专有名词都识别正确。

## 修复字幕文本

whisper.cpp 容易把技术词听错，比如：

```text
我们需要把 s 二 t 转成 ass 字幕
```

应该修成：

```text
我们需要把 SRT 转成 ASS 字幕
```

这里可以让大模型处理，但要限制得很死：

```text
只修复错别字、标点和专有名词。
不要改变句子原意。
不要合并或拆分字幕条目。
不要修改时间戳。
保持 SRT 格式不变。
```

字幕是跟音频对齐的，不能让模型把口播重写成另一种表达。它只负责清理文本，时间线仍然以 whisper 输出为准。

## 控制字幕长度

字幕不是普通文案，显示时长和阅读速度很重要。我的经验规则是：

- 一条字幕不要太长，中文大概控制在 12 到 20 个字。
- 显示时间不要太短，低于 0.8 秒通常很难读完。
- 显示时间也不要太久，超过 5 秒会显得拖。
- 长句优先按标点、语义停顿和呼吸点拆开。

脚本适合处理字数、时长、格式这些硬规则；大模型适合判断哪里断句更自然。

## 转成 ASS 并套样式

SRT 适合保存字幕内容和时间线，ASS 适合控制字幕样式，比如字体、字号、颜色、描边、背景框、边距和位置。

常用流程是先生成 SRT，再转成 ASS，然后写入统一样式。短视频或教程视频里，我常用的是：

```text
白字
半透明黑底
底部居中
按视频真实分辨率设置字号和边距
```

ASS 的颜色格式是：

```text
&HAABBGGRR
```

其中 `AA` 是透明度，`00` 表示完全不透明，`FF` 表示完全透明。比如不透明白色是：

```text
&H00FFFFFF
```

半透明黑底可以用：

```text
&H80000000
```

如果用 `BorderStyle=3` 做黑底字幕，最好让 `OutlineColour` 和 `BackColour` 保持一致。libass 渲染 box subtitle 时，背景框的可见颜色和 `OutlineColour` 也有关，只改 `BackColour` 可能会出现不符合预期的黑框。

脚本还会用 `ffprobe` 读取视频真实宽高，再写入 ASS：

```text
PlayResX: 1920
PlayResY: 1080
```

这样字号和边距才是按真实视频像素计算的。

## 烧录字幕

硬字幕会直接变成视频画面的一部分，上传到短视频平台更稳，不依赖播放器加载外挂字幕。

最简单的 FFmpeg 命令是：

```bash
ffmpeg -i input.mp4 -vf "ass=subtitle.ass" output.mp4
```

如果视频和音频是分开的，就先合并视频流和音频流，再应用字幕滤镜。实际使用时可以直接跑脚本：

```zsh
./burn_subbed_video.zsh \
  -v cursorful-video-1779676088604.mp4 \
  -a speech_1779677983686.mp3 \
  -s speech_1779677983686.srt \
  -o output_merged_subbed.mp4
```

烧完后抽一帧检查效果：

```bash
ffmpeg -y -ss 00:00:03 -i output_merged_subbed.mp4 -frames:v 1 subtitle_check.jpg
```

这一步能快速发现字幕是不是太大、底部距离是不是太近、黑底是不是过深、有没有挡住画面重点。

## 顺手生成封面

字幕本身就是视频内容摘要，可以拿来提炼封面标题。比如从字幕里提取关键词：

```text
Codex
语音识别
SRT
ASS
字幕烧录
FFmpeg
```

再让大模型生成几组封面文案：

```text
Codex 自动加字幕
语音识别、ASS 样式、FFmpeg 烧录
```

如果要把封面插到视频开头，可以先把封面图转成一小段视频，再和正文拼接：

```text
cover.jpg -> cover.mp4
cover.mp4 + main.mp4 -> final.mp4
```

教程视频里，我更倾向于让封面停留 1 到 2 秒，再进入正文。这样平台预览和用户点开后的第一眼都更稳定。

## Codex 的作用

Codex 在这里不是剪辑软件，而是把本地工具串起来的工程助手：

- whisper.cpp 负责语音识别。
- 大模型负责修错字、提关键词、生成封面文案。
- 脚本负责 SRT、ASS、时间线和样式参数。
- FFmpeg 负责合成音视频、烧录字幕、抽帧检查、拼接封面。
- 人负责最后判断效果。

这套流程的好处是可重复、可检查、可替换。识别不准就换模型或修提示词，样式不好就改 ASS 参数，烧录效果不对就抽帧看具体是哪一项出了问题。

后续还可以把这套流程整理成一个 Codex skill，用在更通用的视频剪辑和字幕处理场景里。
