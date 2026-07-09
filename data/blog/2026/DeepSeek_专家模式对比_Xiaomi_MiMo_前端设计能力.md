---
title: DeepSeek 专家模式对比 Xiaomi MiMo 前端设计能力
date: '2026/4/8'
lastmod: '2026/4/8'
tags: [AI 编程]
draft: false
summary: '我一直在找一个前端设计能力出色的国产大模型，想在产品中代替 gemini 3 模型，今天我们来的对比 Xiaomi MiMo-V2-Pro 和 DeepSeek 专家模式，简直让我惊呆了，其他能力暂且不论，就论前端设计能力，已经超出了我的心理预期，下面开始测评。'
images:
  [
    https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlpMnibon2x4I6KALT22zc5ur1Qn5uW7pkicImrFm7LYXabwh3OfLtDxiaO2Qo2m9DoNp6UEGYoaIuT0YgX4IjVIVyp2UraN7Gqm1s/640?wx_fmt=png&from=appmsg,
  ]
authors: ['default']
layout: PostLayout
slug: deepseek-专家模式对比-xiaomi-mimo-前端设计能力
---

我一直在找一个前端设计能力出色的国产大模型，想在产品中代替 gemini 3 模型，今天我们来的对比 Xiaomi MiMo-V2-Pro 和 DeepSeek 专家模式，简直让我惊呆了，其他能力暂且不论，就论前端设计能力，已经超出了我的心理预期，下面开始测评。

## Xiaomi MiMo-V2-Pro

我是直接在官网`https://aistudio.xiaomimimo.com`测试的，提示词就一句话

    请使用 tailwindcss 和 lucide icon cdn 做一张小红书海报使用波普艺术风格：# openClaw 线下交流会时间：2026-03-26地址：杭州西湖文化广场人员：小马、Ray

这个是效果。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlpMnibon2x4I6KALT22zc5ur1Qn5uW7pkicImrFm7LYXabwh3OfLtDxiaO2Qo2m9DoNp6UEGYoaIuT0YgX4IjVIVyp2UraN7Gqm1s/640?wx_fmt=png&from=appmsg)

    改成新粗野风格增加人物头像

虽然排版上有些问题，但是整体风格很出色，只需要经过微调，完全媲美设计师的作品了。尤其是 svg 人物眼神炯炯有神。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlr2rK41AMHKyet1f8ohwuLulKHAPAP1XdKm7P2hOmdqzuCB8icjIqVowzXh8ic1aNOicMt2ciabibn5g1lKEXpxzibEwIghjLicpE61dU/640?wx_fmt=png&from=appmsg)

虽然说还没有达到直接可以用的地步，但是我们可以手动调整，这一步我们可以在 figma 中做调整，我是通过我自己开发的 figama 插件转换的。

换一个风格试试`改成手绘涂鸦 Doodle 风格`

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlphP3ViaqOibp97tSaAt7X2OdeXRTzEvuQgAB5RLpbCLAETkWuXApgv19QvIgZaHjGiarJuxOVx9RURjhjTPAGvrMaCpB5NqvuDyI/640?wx_fmt=png&from=appmsg)

虽然说对齐上面有点问题，但这已经超出了我的心理预期

再来看看`报纸杂志 (Editorial) 风格`

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrzeDHPPLxIUGr0sMIIR05BaeNz5W9Ng1bPxKnbhP2OibFEETrjao8N3jBIcXWCiarwK8Hz9rcjPY7A21xCclxtricY29UABXk7uQ/640?wx_fmt=png&from=appmsg)

这个杂志风格也很好看，后续只需要调整一下图片高度就行了

我们再来看下其他平台的效果

## DeepSeek

今天发布官网的**专家模式**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlpsKOgPOtv8jK7xN7ysvsibGkG6KiabsC46wwzKIoyAzlm150GDDXsa7rq4r2299bwFMvSy1iaAJ2ygIPdtfUiaugp9Le0ic1CyWL78/640?wx_fmt=png&from=appmsg)

DeepSeekV3.2

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloM5q1ayHLjMuHlWpLSbyicyUjlRujc1IwZt3kLtr5icgsOZ5ZSpO41B70dCtiazuBnlKrnI2h0s0vSfgaR9uOJZcEJoKGH0VxVUA/640?wx_fmt=png&from=appmsg)

这个的风格还是中规中矩，AI 味很重

**GLM 4.6**

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlpEVsOBg2ZOjTb0UiaOOTyiamDDtAjWqVAB52w7PlueHGZHfL0aDKt6gnOctT3glE9tslWllJQyfYAiaXpFzazG5cZic0XBRT5cKxE/640?wx_fmt=png&from=appmsg)

为什么是 GM4.6，这个是之前的，最新 GLM 5.1 在官网卡了半天没出来。

MiniMax 4.7

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlqJql1RYcfcXStcsPBITSHIHeibNLWqtJrcVy9nfNQV8S6ykY12DQQZDSAXAfq4iaWktZJgIVmI8BNq7kU0Yc6PicHenqL5s5XW7A/640?wx_fmt=png&from=appmsg)

MiniMax4.7 的 AI 味也很重

最后 gemini-3.1-pro-preview

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZlrQibkicu1XClt6tscUueGo1aWqrWrib5HlJncNIlTbjbElrSKn9JaEhZvQLZicvA9uJPWeQkpxyJMZG0mRia14gVsVias2ZuHEv79EM/640?wx_fmt=png&from=appmsg)

gemini 的风格也没达到我心里的预期。

测试了这么多模型，没有一个可以使用的。 是的，现在模型能力无法做到一步到位，但是我们可以在 figma 中微调，模型帮我完成 80%， 剩下的的 20% 我们手动调整。

最后推荐下我自己的产品

这个我开发的 figma 插件的集成能力，可以瞬间将 AI 提示词和 HTML 代码转换为可编辑的体感设计稿。

第一部分 Chat 是直接在插件中生成设计稿

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloicbaD8NFwjLPV4v7wC9NEvAnib3EI50qfKLoQDBGF0of1icrbiaYjRq2siaTdeDCnSBpyo0uKRhmEzdfQ07LqU3NjCKfPEN6LMicsA/640?wx_fmt=png&from=appmsg)

第二个 tab HTML： 你可以通过复制大模型产出的 html 和 css 生成。这个模块是免费的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/NX8ZoYnTZlrHLctLI6C4SWtZIa7TFCOLUaLzsicI6tqMLGN7PkI1F4pW41I4c7oG6kXAibOrD6ibABsFrTjW2b57vgA1nFxScibjW8HGXicic5vXY/640?wx_fmt=png&from=appmsg)

第三个 Tab 可以直接通过一个 url 来复刻一个网页。

![](https://mmbiz.qpic.cn/mmbiz_png/NX8ZoYnTZloSicn19T6ibfKcXBDFQzy3icbQKiaN3HXMibv1iak8OwK96xOWDMc3LGfcHNUz6lr7ISI0YXPnTYQ4I38ragWb0wOtiaWgHhYUCa73ng/640?wx_fmt=png&from=appmsg)

欢迎大家来体验，有问题也可以加我微信：maqi1520 与我交流。

`https://vibe2design.com/zh`
