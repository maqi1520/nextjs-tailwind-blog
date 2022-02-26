---
title: '情人节，让百度首页帮你告白'
date: '2022/2/14'
lastmod: '2022/2/15'
tags: [JavaScript, 前端]
draft: false
summary: '转眼又是到了2月14日，今天不单单是情人节，我做了一个JS相册，并嵌入大屏了百度首页中，偷偷给对象装个油猴脚本，百度都会帮你告白。'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a2123cbc9984de898a771213d7b0f62~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

转眼又是到了 2 月 14 日，今天不单单是情人节，而且也是笔者的结婚纪念日，当初选择这天开玩笑说，可以少过一个节日，可现在选择过节的日子也越来越少，一方面今天是工作日，是大家都忙了，没腾出空去过节，另一方面，选择今天去外面吃饭，总是要排长长的队伍，如果要到后面来补充，不缺又少了过节的气氛。所以我想写一个程序，写一个前端工程师能做的程序，一个在线相册，记录下，这些年的难忘的回忆。

前段时间写了 2 个油猴脚本，都是针对公众号运营者的，今天我想把这个在线相册也写出一个油猴脚本，说不定她会惊喜，也说不定适用各位读者，偷偷给对象装个油猴脚本，百度都会帮你告白。

## 构思

- 打开百度首页，将百度 LOGO 替换成我们的照片
- 点击 logo 动画出现键入动画
- 画一个 ❤️
- 动画缩小，逐个弹窗一屏 ❤️
- 淡入相册
- 点击右上角可关闭

## 演示视频

掘金无法上传视频，可以关注我的微信公众号“JS 酷”查看效果。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4bba0df8ed4471596bd72a33ed85dab~tplv-k3u1fbpfcp-zoom-1.image)

## 使用到的技术

- jquery
- animejs JavaScript 动画库

## 使用 css 画一个爱心

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c78bba42cbfa4dc4a96a59df99fbe136~tplv-k3u1fbpfcp-zoom-1.image)

```css
.heart {
  position: relative;
  width: 100px;
  height: 100px;
  border: solid 1px #a00;
  transform: rotate(-45deg);
}
.heart:before {
  content: '';
  position: absolute;
  top: -50%;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: solid 1px #a00;
}
.heart:after {
  content: '';
  position: absolute;
  top: 0;
  right: -50%;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: solid 1px #a00;
}
```

使用 css 画一个爱心，其实就是一个 div 搞定，一个矩形加 2 个圆形偏移下位置，然后再旋转 45 度就可以搞定了

## svg 路径动画

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b274f854a434188b0e5b502ccc4fd92~tplv-k3u1fbpfcp-zoom-1.image)

我们可以先通过 https://www.figma.com/ 画一个爱心，然后直接拷贝为 svg，然后通过 sag 的虚线偏移位置 `strokeDashoffset` ，初始化为这条 svg path 的长度，然后逐渐变为 0，在 anime 中可以直接使用 anime.setDashoffset 设置路径偏移量。实现代码如下

```js
await anime({
  targets: '.svg-heart path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'linear',
  duration: 3000,
}).finished
```

是不是很简单

## 实现爱心子弹

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c8bebb73b4674cca9e46744aa8c8313b~tplv-k3u1fbpfcp-zoom-1.image)

在这里我在画布中插入了 100 个 ❤️，然后后重置在后面，在通过 anime 动画随机往画布中插入，实现代码如下

```js
await anime({
  targets: '.heart',
  translateX: function () {
    const w = window.innerWidth
    return anime.random(-w / 2, w / 2)
  },
  translateY: function () {
    const h = window.innerHeight
    return anime.random(-h / 2, h / 2)
  },
  scale: function () {
    return anime.random(1, 5)
  },
  duration: 2000,
  delay: function (el, i) {
    return i * 50
  },
}).finished
```

有了 anime JavaScript 动画一切变得简单了。

## 实现相册

其实我们试了很久，我想把交互效果写的好一些，但在最后总是感觉差一点，最后我直接使用了 [codepen](https://codepen.io/haja-ran/pen/mdEJzRd) 上的 demo。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d644805450d54d9488a82c61670dd9d0~tplv-k3u1fbpfcp-zoom-1.image)

然后将代码拷贝过来就可以实现了，其中每个动画依次出现，使用的是 Anime.js 的 timeline ；

```js
// 创建一个默认时间线
var tl = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750,
})
//依次添加子元素
tl.add({
  targets: '.basic-timeline-demo .el.square',
  translateX: 250,
}).add({
  targets: '.basic-timeline-demo .el.circle',
  translateX: 250,
})
```

上面的照片布局使用的是 css grid 栅格布局，并使用 ` grid-area: 1 / 1 / 7 / 5;` 将照片排布的错落有致，若长期没写 css 的的同学可以看下这个 demo

## 遇到问题

一开始我们想使用七牛云，作为我的相册存储，但是在开发油猴脚本过程中，发现百度是不允许外链图片的，必须要将照片传到百度域名下，此时就不知道怎么办才好，后来我在百度网盘中找到了[一刻相册](https://photo.baidu.com/), 然后又匆匆忙忙选择了几张照片。

## 小结

每个人都有自己的喜好，目前的效果肯定不是最好的，她也可能不一定喜欢，主要选照片公开到网上是一个大问题，本文主要提供一个思路，针对某些单身的读者，可以展开自己的联想，或者到 codepen 上找一个比较优秀的效果，可以使用这个小技巧，说不定能够告白成功。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
