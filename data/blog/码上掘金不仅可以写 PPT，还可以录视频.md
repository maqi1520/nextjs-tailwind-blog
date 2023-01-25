---
title: 码上掘金不仅可以写 PPT，还可以录视频
date: 2022/9/9 00:05:45
lastmod: 2023/1/25 11:43:05
tags: [JavaScript, React.js]
draft: false
summary: 本文基于我之前写的一篇文章《Markdown 写 PPT 是如何实现的？》，我们要在此之上实现视频录制的功能。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fda8c8dd9e8844ce956bb6838aa2e2a1~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

我正在参加「码上掘金挑战赛」详情请看：[码上掘金挑战赛来了！](https://juejin.cn/post/7139728821862793223 'https://juejin.cn/post/7139728821862793223')

## 前言

短视频作为新时代的产物，到现在才发展了几年的时间，创作者们看到了短视频的红利，有不少人已经通过视频录制和知识付费的方式实现了流量的变现，当然这只是一少部分人，还有成千上万的热涌向这个风口，他们在干什么？他们正在学习视频录制、视频剪辑的路上。

短视频的入门门槛虽然很低，但想要获得流量还是有一定门槛的，我今年的 flag 之一就是学习视频制作剪辑，前段时间剪了一个视频总共 1 分 20 秒，就花了我一整天的时间，那么我在想，作为前端工程师能不能开发一款产品，让短视频创作更低，后来我看到了一款贴合程序员的产品 [Slidev](https://cn.sli.dev/)，可以让我们使用 markdown 写 PPT，并且可以录制视频。

## 前端实现视频录制

好了，正文开始，本文基于我之前写的一篇文章[《Markdown 写 PPT 是如何实现的？》](https://juejin.cn/post/7129385772561465358)，我们要在此之上实现视频录制的功能。

使用 WebRTC 的 API 可以实现了一个录音、录像、录屏工具

- [MediaDevices.getUserMedia()](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia 'getUserMedia') 可用于获取麦克风以及摄像头的流
- [MediaDevices.getDisplayMedia()](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getDisplayMedia 'getDisplayMedia') 提示用户去选择和授权捕获展示的内容或部分内容，返回 MediaStream
- [MediaRecorder()](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder/MediaRecorder 'MediaRecorder') 构造函数会创建一个对指定的 `MediaStream` 进行录制，还提供了开始、结束、暂停、恢复等多个与 Record 相关的接口。

我们先使用 React 写一个录制的组件

```tsx
import React, { useState, useRef } from 'react'
import ReactDom from 'react-dom'

const App = () => {
  const [videoUrl, setVideoUrl] = useState<string>('')

  // 结束
  const stopRecord = async () => {}

  // 开始
  const startRecord = async () => {}

  const pauseRecord = async () => {}

  const resumeRecord = async () => {}

  return (
    <div>
      <h1>React 录屏</h1>
      <video className="video" src={videoUrl} controls />
      <h2>
        <button onClick={startRecord}>开始</button>
        <button onClick={pauseRecord}>暂停</button>
        <button onClick={resumeRecord}>恢复</button>
        <button onClick={stopRecord}>停止</button>
      </h2>
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('app'))
```

上面有一个 `video` 标签，以及 开始、停止、暂停、恢复、几个按钮用于控制屏幕的录制。

```tsx
const mediaStream = useRef<MediaStream>()
const audioStream = useRef<MediaStream>()
const recorder = useRef<MediaRecorder>()
const mediaBlobs = useRef<Blob[]>([])
```

我们使用 `useRef` 来存放数据，mediaStream 存放视频流， `audioStream` 存放音频流，`recorder` 存放视频录制对象，`mediaBlobs` 将流转化为 `Blob` 对象。

下面代码是开始录制和结束录制的逻辑:

```tsx
// 结束
const stopRecord = async () => {
  recorder.current?.stop()
  // 不仅让 MediaRecorder 停止，还要让所有轨道停止
  mediaStream.current?.getTracks().forEach((track) => track.stop())
}

// 开始
const startRecord = async () => {
  // 录屏接口
  mediaStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true })
  // 主动停止录制
  mediaStream.current?.getTracks()[0].addEventListener('ended', () => {
    stopRecord()
  })
  // 录音接口
  audioStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
  // 往视频流中加入音频流
  audioStream.current
    ?.getAudioTracks()
    .forEach((audioTrack) => mediaStream.current?.addTrack(audioTrack))
  // 录制视频流
  recorder.current = new MediaRecorder(mediaStream.current)

  // 将 stream 转成 blob 来存放
  recorder.current.ondataavailable = (blobEvent) => {
    mediaBlobs.current.push(blobEvent.data)
  }
  // 停止时生成预览的 blob url
  recorder.current.onstop = () => {
    const blob = new Blob(mediaBlobs.current, { type: 'video/mp4' })
    //来生成预览链接
    const mediaUrl = URL.createObjectURL(blob)
    setVideoUrl(mediaUrl)
  }

  recorder.current?.start()
}
```

上述代码先通过 `navigator.mediaDevices.getDisplayMedia` 获取用户选中的录屏流，接着通过 `navigator.mediaDevices.getUserMedia({ audio: true })`获取音频流，然后通过 `mediaStream.current?.addTrack(audioTrack)` 将所有音频流加入到视频流中。再通过 `MediaRecorder` 录制视频流，通过 `ondataavailable` 来存放当前流中的 `Blob` 数据。
最后一步，调用 `URL.createObjectURL` 来生成预览链接。

下面是暂停和恢复的实现代码，是 `MediaRecorder` 提供的方法

```tsx
const pauseRecord = async () => {
  recorder.current?.pause()
}

const resumeRecord = async () => {
  recorder.current?.resume()
}
```

这样就实现了一个在线录屏的 Demo，一起在“码上掘金”中看看效果吧。

[代码片段](https://code.juejin.cn/pen/7140845249294762017)

## 实现幻灯片演讲录制

接下来我们将视频录制的功能集成到之前的幻灯片中，只需要将上面的 `App` 组件改成 `RecordView` 组件，并且通过 `position: fixed;` 属性将操作按钮定位到幻灯片之上。

录制完成后，通过创建一个 `a` 标签，就可以实现自动下载。

下面是自动下载的代码：

```js
export function downloadBlob(blob, filename) {
  let element = document.createElement('a')
  element.setAttribute('href', blob)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
```

同样我们在“码上掘金”中看看效果吧。
[代码片段](https://code.juejin.cn/pen/7140939415622418468)
鼠标移动到左下角会显示操作按钮，我们还可以点击编辑按钮对幻灯片进行实时编辑，这么简单就实现了想要的效果，简直不可思议。

## 竖屏录制

目前短视频都是竖屏的，我们那么能否录制竖屏版的视频呢？答案是可以的，但是在“码上掘金”中不能，因为“码上掘金”是一个代码编辑器，在移动端无法访问，因此我还将这个应用部署到了 [vercel](https://vercel.com/ 'vercel') 上，大家可以通过这个地址访问 :

http://ppt.runjs.cool/

打开 Chrome devtools 选择手机调试模式，选中一个合适的型号，便可以开始录制了，录制的时候选中当前网页就可以了。

![竖屏录制](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87006ca991e0446db8f494e219f26f17~tplv-k3u1fbpfcp-watermark.image?)

这样保存下来的视频便是竖屏的。

最后，我将这个工程的源码上传到了 GitHub：https://github.com/maqi1520/vitejs-md-ppt

目前还比较粗糙，经过精雕细琢后可能会成为一个好产品，先占个坑吧！

## 小结

本文用 WebRTC 的 API 简单地实现了一个录屏工具，并且可以结合 markdown 写 PPT 实现录制幻灯片的功能，我们一起来梳理下录屏的实现逻辑

- 使用 `getUserMedia` 可获取麦克风以及摄像头的流；
- 使用 `getDisplayMedia` 可获取屏幕的视频、音频流；
- 使用 `MediaRecorder` 可监听 `stream`， 从而获取 `Blob` 数据；
- 最后使用 `URL.createObjectURL` 将 `Blob` 转为下载链接；

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
