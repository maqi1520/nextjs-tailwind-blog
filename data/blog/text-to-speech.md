---
title: '文本转语音如此简单'
date: '2022/03/04'
lastmod: '2021/03/10'
tags: [JavaScript]
draft: false
summary: '哈喽，大家好，我是小马，这两天在研究文本转音的功能，有时候担心自己的普通话不标准，比方说要录制一个视频，即兴讲可能会卡壳，这个时候我们就可以先准备好文本，然后再利用人工智能来生成音频，下面就分享下我的研究成果吧！'
images:
  [
    https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9dd2c7b008ce4253abdae8d63f3f0474~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?,
  ]
authors: ['default']
layout: PostLayout
---

<audio controls>
  <source src="/static/text-to-voice/开头.mp3" type="audio/mpeg"/>
Your browser does not support the audio element.
</audio>

## 前言

哈喽，大家好，我是小马，这两天在研究文本转音的功能，有时候担心自己的普通话不标准，比方说要录制一个视频，即兴讲可能会卡壳，这个时候我们就可以先准备好文本，然后再利用人工智能来生成音频，下面就分享下我的研究成果吧！

## 语音合成 Text To Speech

文本转语言的软件有很多，但是大部分都是收费的，作为开发者一般会选择云服务厂商提供的接口，比如[阿里云的语音合成](https://ai.aliyun.com/nls/tts) 和[腾讯云的语音合成](https://cloud.tencent.com/product/tts)，但是最好用的莫过于[微软的 TTS](https://azure.microsoft.com/zh-cn/services/cognitive-services/text-to-speech/#overview)，它能使用 119 种语言和变体，超过 270 种神经语音来吸引全球观众，并且拥有逼真的合成语音和精细音频控制，反正是目前语音合成最好用的软件，这点很多开发者都知道。我也注册了，没想到就卡在第一步，注册需要 visa 卡，而我没有，正当我想去办卡时，有个想法涌入我的脑海中，能否用最近流行的 WebRTC_API 来录音呢？
![微软需要注册验证](/static/text-to-voice/s22432303042022.png)

## 实现原理

![微软官网demo](/static/text-to-voice/s22521603042022.png)
在微软 TTS 官网上有个基于 JavaScript 实现的文字转语音的 demo，其实阿里云和和腾讯云也有，那么我们可以利用官网的演示来录音了，实现原理就是在官网插入一个 JS 脚本，我使用油猴脚本来开发，这个脚本就是用 WebRTC_API 来实现录音的功能。
效果如下
![油猴脚本安装后的效果](/static/text-to-voice/s22540403042022.png)

## 使用

首先：需要安装 chrome 油猴扩展，然后再安装这个[油猴脚本](https://greasyfork.org/zh-CN/scripts/440926-%E5%BE%AE%E8%BD%AFtts-%E5%BD%95%E9%9F%B3%E6%8F%92%E4%BB%B6)；

第二步：开始录音的时候，在 chrome 上方要允许录音，mac 电脑若没录音过，还需要在设置权限中开启权限。

![允许浏览器录音](/static/text-to-voice/s23003003042022.png)

第三步：输入你想要的文本，先点击播放，然后在点击开始，就会录音，点停止录音，然后就可以下载了音频文件了。

## SSML 语法

在录制文本由此有个 Tab 标签， SSML 是语音合成标记语言，跟 HTML 一样是 XML，但却可以描述语音的改善合成，比如音节、发音、语速、音量。

### 使用多个语音

<audio controls>
  <source src="/static/text-to-voice/早上好.mp3" type="audio/mpeg"/>
Your browser does not support the audio element.
</audio>

比如下面的代码,就可以模拟 2 个人的对话

```xml
<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
<voice name="en-US-JennyNeural">Good morning!</voice>
<voice name="en-US-ChristopherNeural">Good morning to you too Jenny!</voice>
</speak>
```

### 调整讲话风格

可使用 `mstts:express-as` 元素来表达情感（例如愉悦、同情和冷静）。 也可以针对不同场景（例如客户服务、新闻广播和语音助理）优化语音。

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-US-AriaNeural">
        <mstts:express-as style="cheerful">
            That'd be just amazing!
        </mstts:express-as>
    </voice>
</speak>
```

### 调整讲话语言

通过 `<lang xml:lang="es-US">` 修改语言

<audio controls>
  <source src="/static/text-to-voice/关注.mp3" type="audio/mpeg"/>
Your browser does not support the audio element.
</audio>

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="zh-CN-XiaoxiaoNeural">
        欢迎关注微信公众号JS酷，英语是
        <lang xml:lang="es-US">
            Welcome to follow wechat public account JS cool
        </lang>
    </voice>
</speak>
```

### 风格强度

可调整讲话风格的强度，更好地适应你的使用场景。 可以使用 styledegree 属性指定更强或更柔和的风格，使语音更具表现力或更柔和。 中文（普通话，简体）神经语音支持讲话风格强度调整。

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
    <voice name="zh-CN-XiaoxiaoNeural">
        <mstts:express-as style="sad" styledegree="2">
            快走吧，路上一定要注意安全，早去早回。
        </mstts:express-as>
    </voice>
</speak>
```

### 添加暂停

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-JennyNeural">
        Welcome to Microsoft Cognitive Services <break time="100ms" /> Text-to-Speech API.
    </voice>
</speak>
```

## 指定段落和句子

p 和 s 元素分别用于表示段落和句子

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-JennyNeural">
        <p>
            <s>Introducing the sentence element.</s>
            <s>Used to mark individual sentences.</s>
        </p>
        <p>
            Another simple paragraph.
            Sentence structure in this paragraph is not explicitly marked.
        </p>
    </voice>
</speak>
```

更多内容大家可以参考[官方文档](https://docs.microsoft.com/zh-cn/azure/cognitive-services/speech-service/speech-synthesis-markup?tabs=csharp#specify-paragraphs-and-sentences)

## 应用例子

周末到了，学习的同时也该放松下，一起来欣赏一个视频吧

<video width="100%" controls>
  <source src="https://img.maqib.cn/img/%E9%95%BF%E6%B4%A5%E6%B9%96%E4%B9%8B%E6%B0%B4%E9%97%A8%E6%A1%A5.mp4" type="video/mp4"/>
Your browser does not support the video tag.
</video>

我是怎么做的？ 先在预告片网站下载一个预告片，然后是去找简介，转成音频后，然后再合成视频。

你是否明白了什么？抖音上很多视频都是靠搬运 ➕AI 配音就成了原创视频。

```xml
<speak
  version="1.0"
  xmlns="http://www.w3.org/2001/10/synthesis"
  xmlns:mstts="https://www.w3.org/2001/mstts"
  xml:lang="en-US"
>
  <voice name="zh-CN-XiaoxiaoNeural">
    <p>
      <w>长津湖之水门桥</w>是由陈凯歌、徐克、林超贤监制，<w>徐克</w>执导，吴京、易烊千玺领衔主演的战争电影。
    </p>
    <p>
      该片以抗美援朝战争第二次战役中的长津湖战役为背景，讲述在结束了新兴里和下碣隅里的战斗之后，七连战士们又接到了更艰巨的任务的故事
    </p>
    <p>
      <w>长津湖之水门桥</w
      >作为电影<w>长津湖</w>的续集，讲述了七连战士们在结束了新兴里和下碣隅里的战斗之后，又将面临更艰巨的挑战和更猛烈的火力，他们将在美陆战一师撤退路线上的咽喉之处——水门桥阻击敌军，任务会更加艰巨，战斗场面会更加激烈，为赢得胜利付出的巨大牺牲也会令人更加动容。
    </p>
  </voice>
</speak>
```

**音频**

<audio controls>
  <source src="/static/text-to-voice/长津湖之水门桥.mp3" type="audio/mpeg"/>
Your browser does not support the audio element.
</audio>

## 小结

1、目前由于 `navigator.mediaDevices.getDisplayMedia()` 还不能直接录制电脑的声音，必须电脑将声音外放，然后录音，所以录音需要找个安静的环境。

2、有时候网速不好可能会卡，需要找个好点的网络，我后面是用的手机热点，一点也没卡。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

[1]阿里云的语音合成: https://ai.aliyun.com/nls/tts

[2]腾讯云的语音合成: https://cloud.tencent.com/product/tts

[3]微软的 TTS: https://azure.microsoft.com/zh-cn/services/cognitive-services/text-to-speech/#overview

[4]官方文档: https://docs.microsoft.com/zh-cn/azure/cognitive-services/speech-service/speech-synthesis-markup?tabs=csharp#specify-paragraphs-and-sentences

[5]油猴脚本地址: https://greasyfork.org/zh-CN/scripts/440926-%E5%BE%AE%E8%BD%AFtts-%E5%BD%95%E9%9F%B3%E6%8F%92%E4%BB%B6
