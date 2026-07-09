---
title: MD2Card 支持移动端访问啦
date: '2025/3/10'
lastmod: '2025/3/10'
tags: [独立开发, 创作工具]
draft: false
summary: '在V2EX 社区发了帖子推广，V2EX的氛围很不错，发帖半小时就有 70 的在线访问量，那是相当的不错了，可能大家对我提到的哪些是 AI 实现的比较感兴趣。'
images:
  [
    https://mmbiz.qpic.cn/sz_mmbiz_jpg/e4YNLngAJ86ZIRp0PvNOp3OGyLhubZ8NnumcBiaGwTq8764nhdkux203exKLJuT9WD3yeTugDeK5M0Ox7d5Z9BQ/0?wx_fmt=jpeg,
  ]
authors: ['default']
layout: PostLayout
slug: md2card-支持移动端访问啦
---

在 V2EX 社区发了帖子推广，V2EX 的氛围很不错，发帖半小时就有 70 的在线访问量，那是相当的不错了，可能大家对我提到的哪些是 AI 实现的比较感兴趣。

1\. 网站首页是基于 shadcn-landing-page 改的，写好 README 后，让它基于模板直接生成 landing page。这样生成的效果还可以，替换一些 demo 图片就可以了。如果没有模板大致会生成 bootstrap 风格的页面。

2\. md2card 的卡片样式，也是让 cursor 来直接生成的，我提供的 html 结构，cursor 生成的样式，效率实在是太高了，claude 3.7 的审美也很在线。

3\. I18n 直接让 cursor 提取文案到 json 文件中，这一步使用 claude 3.5 就可以。

![图1](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e4YNLngAJ86ZIRp0PvNOp3OGyLhubZ8NnumcBiaGwTq8764nhdkux203exKLJuT9WD3yeTugDeK5M0Ox7d5Z9BQ/0?wx_fmt=jpeg)

图 1

![图2](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e4YNLngAJ86ZIRp0PvNOp3OGyLhubZ8NWvUIwYbj3G4Hw9n0g1xyRiaia5Wkuibawx7IjibbOMfCicjOiccBfDIfbXsw/0?wx_fmt=jpeg)

图 2

![图3](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e4YNLngAJ86ZIRp0PvNOp3OGyLhubZ8NBJvY7ljx5wAk8C3Ez6alzFr7DTbGhtl1JULicHAudQGr7WUHT2iatQFw/0?wx_fmt=jpeg)

图 3
