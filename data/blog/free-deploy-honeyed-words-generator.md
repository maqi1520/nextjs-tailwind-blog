---
title: '免费部署一个“土味情话”生成网站'
date: '2022/2/15'
lastmod: '2022/03/21'
tags: [JavaScript, GitHub]
draft: false
summary: '首先在“知乎” “微信” 等平台搜索“土味情话”，然后利用抓包工具将一些回答都保存到一个 JSON 中。然后利用随机数就可以随机生成了。'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0164da5033af4710895493f25d023ecb~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

“你喜欢什么面？”——“你的心里面”

“来者何人” ——“你的人”

像上面的这种听起来又肉麻又害羞又有点儿乡土感觉的小情话，就是土味情话啦。
作为程序员肯定想不出这些肉麻的话，如不做个土味情话生成器，关键时候说不定有用哦！！

## 实现

首先在“知乎” “微信” 等平台搜索“土味情话”，然后利用抓包工具将一些回答都保存到一个 JSON 中。然后利用随机数就可以随机生成了。

```json
[
  {
    "id": "495e1a80-fb5a-4c21-9c89-a5c2237f1619",
    "content": "想试试我的草莓味唇膏吗？",
    "likeCount": 24,
    "dislikeCount": 3,
    "type": "默认分类"
  },
  {
    "id": "9eb93075-ffd4-458c-8b4e-301e219359b8",
    "content": "我喜欢你，在于颜值，喜欢他，忠于人品",
    "likeCount": 4,
    "dislikeCount": 11,
    "type": "默认分类"
  },
  {
    "id": "4621a013-a79b-4e1d-908b-fea4cb8b8cb4",
    "content": "不管我本人多么平庸，我总觉得对你的爱很美。",
    "likeCount": 13,
    "dislikeCount": 6,
    "type": "默认分类"
  },
  {
    "id": "35515ddf-7220-4b41-9046-5b4fe55c10e4",
    "content": "被你赞过的朋友圈，叫甜甜圈。",
    "likeCount": 11,
    "dislikeCount": 10,
    "type": "默认分类"
  }
]
```

## 预览地址

https://honeyed-words-generator.vercel.app/

## github 地址

https://github.com/maqi1520/honeyed-words-generator

## 技术栈

- `typescript`
- `tailwind`
- `nextjs`
- `animejs`

使用 animejs 来生成动画！

## 开始开发

我使用**山月**的 next 模板快速创建应用

```bash
$ git clone git@github.com:shfshanyue/next-app.git
```

在项目创建早期尽可能对 package 进行升级，这里使用了 `npm-check-updates`

```bash
$ npm run ncu
```

在测试环境中进行开发

```bash
$ npm run dev
```

打包

```bash
$ npm run build
```

### 文件结构

```bash
.
├── node_modules/
├── pages/                  # 所有的 pages
├── utils/
├── package.json
├── package-lock.json
├── README.md
└── serverless.yaml
```

## Deoploy

### Vercel

```bash
$ vercel
```

## 小结

该程序实现起来一点也不难，主要是开始创作的想法。当然还可以加上很多功能，比如用户系统，点赞，吐槽评论等，说不定以后会发展成一个在线交友平台，哈哈。
有时候，当有了一个想法，我们就要付诸实践，或者将这件事作为一个代办事项，如没有开始，哪来的优秀作品呢？

再次贴下我的个性签名:

> 你不一定要很厲害，才能開始；但你要開始，才能很厲害

## 最后

祝福各位情人节快乐，有情人终成眷属

---

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/free-deploy-honeyed-words-generator)
