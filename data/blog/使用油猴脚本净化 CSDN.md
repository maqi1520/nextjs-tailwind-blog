---
title: 使用油猴脚本净化 CSDN
date: 2022/9/3 14:33:01
lastmod: 2023/1/25 11:43:07
tags: [JavaScript]
draft: false
summary: CSDN 的百度搜索权重很高，比如我们搜索一个关键词， 输入`react 性能优化`，第一个就是 CSDN 的链接，打开 CSDN 的链接，里面有很多广告，我们可以通过油猴脚本来净化页面。
images: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12bd1cfd78fb49648c1a3de21ff7c2a2~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

我报名参加金石计划 1 期挑战——瓜分 10 万奖池，这是我的第 1 篇文章，[点击查看活动详情](https://s.juejin.cn/ds/jooSN7t 'https://s.juejin.cn/ds/jooSN7t')

[代码片段](https://code.juejin.cn/pen/7139029617238605838)

CSDN 的百度搜索权重很高，比如我们搜索一个关键词， 输入`react 性能优化`，第一个就是 CSDN 的链接，打开 CSDN 的链接，里面有很多广告，然后我们想复制里面的代码块，CSDN 会要求我们登录后才可以复制，直接用鼠标去选中文本是无法选中的。我们可以使用可以油猴脚本来完美解决，打开脚本，重新刷新页面，边上的广告消失了，一起来看代码块，“登录复制按钮”变成了“免登录复制”，也可以手动选中复制代码了。

下面我们来看下实现原理，打开 chrome dev tools 选中代码块，这里的 `code` 标签和 `pre` 标签 `user-select` 值是 `none`，所以鼠标是无法选中的。

```js
// ==UserScript==
// @name         CSDN 免登录复制
// @version      0.1
// @icon         https://blog.csdn.net/favicon.ico
// @description  CSDN 免登录复制，净化页面
// @namespace    https://github.com/maqi1520
// @match        *://*.csdn.net/*
// @license      MIT
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        GM_addStyle
// ==/UserScript==

;(function () {
  'use strict'

  GM_addStyle(
    `pre,
code {
  user-select: auto !important;
}
#blogExtensionBox,
.hide-article-box,
.insert-baidu-box,
.signin,
.wwads-horizontal,
.wwads-vertical,
.blog-top-banner,
.blog_container_aside,
.programmer1Box,
.recommend-box,
.recommend-nps-box,
.template-box,
.hide-preCode-box {
  display: none !important;
}
main {
  width: 100% !important;
}
#article_content,
main div.blog-content-box pre.set-code-hide {
  height: auto !important;
}
`
  )
  // 删除暗黑皮肤样式
  $('link').each((index, item) => {
    if ($(item).attr('href').indexOf('skin') > -1) {
      $(item).remove()
    }
  })

  // 免登录复制
  $('.hljs-button').removeClass('signin')
  $('.hljs-button').attr('data-title', '免登录复制')
  $('.hljs-button').attr(
    'onclick',
    "hljs.copyCode(event);setTimeout(function(){$('.hljs-button').attr('data-title', '免登录复制');},3500);"
  )
  // 去除剪贴板劫持
  $('code').attr('onclick', 'mdcp.copyCode(event)')
  try {
    Object.defineProperty(window, 'articleType', {
      value: 0,
      writable: false,
      configurable: false,
    })

    csdn.copyright.init('', '', '')
  } catch (err) {}
})()
```

我们来看下脚本代码，注入一段样式， `code` 标签和 `pre` 标签的`user-select` 值改为 `auto`, 以及其他一些标签和广告标签，样式改为 `display` `none`, 使用 `Jquery` 将复制按钮的登录样式去除。文本改成“免登录复制”，修改`onclick` 事件，搞定啦。

大家可以通过[这个地址下载](https://greasyfork.org/zh-CN/scripts/450504-csdn-%E5%85%8D%E7%99%BB%E5%BD%95%E5%A4%8D%E5%88%B6 'CSDN 免登录复制')安装， 若你也想尝试开发脚本，可以看我的另一篇文章[《油猴脚本开发教程》](https://juejin.cn/post/7138346293042085924 '油猴脚本开发教程')

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
