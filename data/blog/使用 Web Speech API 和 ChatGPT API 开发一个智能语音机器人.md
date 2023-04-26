---
title: 使用 Web Speech API 和 ChatGPT API 开发一个智能语音机器人
date: 2023/4/21 18:03:16
lastmod: 2023/4/26 21:37:54
tags: [JavaScript, 掘金·金石计划]
draft: false
summary: 随着 AI 的不断发展，我们前端工程师也可以开发出一个智能语音机器人，下面是我开发的一个简单示例，大家可以访问这个视频地址查看效果。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b77c80cf2d1a4549bdf5235cf873c19c~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

随着 AI 的不断发展，我们前端工程师也可以开发出一个智能语音机器人，下面是我开发的一个简单示例，大家可以访问这个[视频地址](https://www.bilibili.com/video/BV16k4y1Y7Vy/)查看效果。

## 原理

首先说一下这个 demo 的实现原理和步骤

1. 我们使用 Web Speech API 获得输入的文本
2. 将获得的文本作文 ChatGPT API 的 prompt 的输入
3. 使用语音合成或者 微软的文字转语音服务，将文字作为语音输入

语音识别的功能在百度搜索页面就有，使用的是 Web Speech API

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6865232805944b99311b1abd577a576~tplv-k3u1fbpfcp-zoom-1.image)

我们可以在 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/SpeechRecognition) 中查看这个 API 的使用

下面代码是一个简单示例

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Web Speech API Demo</title>
  </head>
  <body>
    <h1>Web Speech API Demo</h1>
    <p>请说出一些文字：</p>
    <textarea id="input" cols="50" rows="5"></textarea>
    <br />
    <button id="speakBtn">语言合成</button>
    <button id="transcribeBtn">语音识别</button>
    <br />
    <p id="transcription"></p>

    <script>
      const recognition = new webkitSpeechRecognition() // 实例化语音识别对象
      recognition.continuous = true // 连续识别，直到 stop() 被调用

      const transcribeBtn = document.getElementById('transcribeBtn')
      transcribeBtn.addEventListener('click', function () {
        recognition.start() // 开始语音识别
      })

      recognition.onresult = function (event) {
        let result = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          result += event.results[i][0].transcript
        }
        const transcript = document.getElementById('transcription')
        transcript.innerHTML = result // 显示语音识别结果
      }

      const speakBtn = document.getElementById('speakBtn')
      speakBtn.addEventListener('click', function () {
        const text = document.getElementById('input').value // 获取文本框中的文本
        const msg = new SpeechSynthesisUtterance(text) // 实例化语音合成对象
        window.speechSynthesis.speak(msg) // 开始语音合成
      })
    </script>
  </body>
</html>
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6303b118d5445bcb41bf05c929893fd~tplv-k3u1fbpfcp-zoom-1.image)

这个例子很简单，点击语音识别可以将文字识别再文本框中。输入文字，电脑可以合成语音， 但是电脑合成的声音比较机械，不够逼真，因此我们可以使用微软的语音合成，大家可以访问这个地址体验。

https://speech.microsoft.com/audiocontentcreation

如果没有登录的话，只能试听，注册登录后就可以免费使用官方的 api 了

注册的话，大家只需要按照步骤注册就可以了，并且需要准备一张境外使用信用卡，注册后每月可以免费 50w 字的使用权限。

创建资源的时候选择 F0，创建完成后，就会有一个秘钥。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5806a3648dac4d45a415a63c6573fb7b~tplv-k3u1fbpfcp-zoom-1.image)

有了秘钥我们就可以将 chatGPT 返回的文字转成真人语音了，在 Github 上有代码示例

## 完整代码

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Web Speech API Demo</title>
  </head>
  <body>
    <h1>Web Speech API + ChatGPT API</h1>
    <button id="transcribeBtn">按住说话</button>
    <br />
    <p id="transcription"></p>
    <script src="https://aka.ms/csspeech/jsbrowserpackageraw"></script>

    <script>
      async function requestOpenAI(content) {
        const BASE_URL = ``
        const OPENAI_API_KEY = 'sk-xxxxx'
        const messages = [
          {
            role: 'system',
            content: 'You are a helpful assistant',
          },
          { role: 'user', content },
        ]
        const res = await fetch(`${BASE_URL || 'https://api.openai.com'}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          }),
        })
        const response = await res.json()

        const result = response.choices[0].message.content
        console.log(result)
        return result
      }
      // 下载 mp3 文件
      function download(result) {
        const blob = new Blob([result.audioData])
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'filename.mp3' // set the filename here
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      function synthesizeSpeech(text) {
        const sdk = SpeechSDK
        const speechConfig = sdk.SpeechConfig.fromSubscription('TTS_KEY', 'TTS_REGION')
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()

        const speechSynthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)
        // 可以更改 Ssml 来改变声音
        speechSynthesizer.speakSsmlAsync(
          `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="zh-CN"><voice name="zh-CN-XiaoxiaoNeural">${text}</voice></speak>`,
          (result) => {
            if (result) {
              speechSynthesizer.close()

              return result.audioData
            }
          },
          (error) => {
            console.log(error)
            speechSynthesizer.close()
          }
        )
      }

      const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition

      const recognition = new SpeechRecognition() // 实例化语音识别对象
      recognition.continuous = true // 连续识别，直到 stop() 被调用
      recognition.lang = 'cmn-Hans-CN' // 普通话 (中国大陆)

      const transcribeBtn = document.getElementById('transcribeBtn')

      let record = false
      transcribeBtn.addEventListener('mousedown', function () {
        record = true
        recognition.start() // 开始语音识别
        console.log('开始语音识别')
        transcribeBtn.textContent = '正在录音...'
      })
      transcribeBtn.addEventListener('mouseup', function () {
        transcribeBtn.textContent = '按住说话'
        record = false

        recognition.stop()
      })
      recognition.onend = () => {
        console.log('停止语音识别')
        transcribeBtn.textContent = '开始'
        record = false
      }

      recognition.onerror = function (event) {
        console.log(event.error)
      }

      recognition.onresult = function (event) {
        console.log(event)
        let result = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          result += event.results[i][0].transcript
        }
        console.log(result)
        const transcript = document.getElementById('transcription')
        const p = document.createElement('p')
        p.textContent = result
        transcript.appendChild(p) // 显示语音识别结果
        requestOpenAI(result).then((res) => {
          const p = document.createElement('p')
          p.textContent = res
          transcript.appendChild(p)
          synthesizeSpeech(res)
        })
      }
    </script>
  </body>
</html>
```

上面代码中

- 需要修改 `OPENAI_API_KEY` , 在 https://platform.openai.com/account/api-keys 获取
- 修改 `TTS_KEY`' 和 `TTS_REGION`， 在 https://speech.microsoft.com/portal 获取

以上就是本文的全部内容，如果对你有帮助，记得给个三连，感谢你的阅读。

**_本文正在参加[「金石计划」](https://juejin.cn/post/7207698564641996856/ 'https://juejin.cn/post/7207698564641996856/')_**
