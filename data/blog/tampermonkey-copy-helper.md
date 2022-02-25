---
title: '[油猴脚本]文章拷贝助手，文章一键拷贝到微信公众平台'
date: '2022-2-9'
lastmod: '2022-2-9'
tags: [JavaScript]
draft: false
summary: '为什么要写这个脚本 最近开了个前端公众号，需要推送一些优质的文章，但由于时间的关系，原创内容太少，常规的做法是转载一些优秀的文章到自己的公众号。'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f64568e1fa049fa948442def158b138~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

> 文章拷贝助手,文章一键拷贝到微信公众平台、知乎 下载 markdown

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f1e838aaab74cb6b7225da6fe0f2e27~tplv-k3u1fbpfcp-watermark.image?)

## 为什么要写这个脚本

最近开了个前端公众号，需要推送一些优质的文章，但由于时间的关系，原创内容太少，常规的做法是转载一些优秀的文章到自己的公众号。

### 流程

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dfe441fddf414f5a879df3ad41855ecd~tplv-k3u1fbpfcp-watermark.image?)

### 使用脚本流程

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/834b742b0a814286b040942f2548d011~tplv-k3u1fbpfcp-watermark.image?)

### HTML 转 markdown

https://www.bejson.com/convert/html2markdown/

https://devtool.tech/html-md

https://github.com/mixmark-io/turndown

## 使用

- 第一步： [安装 chrome 油猴扩展](https://chrome.pictureknow.com/extension?id=4d999497b75d4eb6acf4d0db3053f1af '安装 chrome 油猴扩展')
- 第二步： [安装文章拷贝助手](https://greasyfork.org/zh-CN/scripts/439663-copy-helper '安装文章拷贝助手')

## 实现代码

大部分代码来自 [markdown-nice](https://github.com/mdnice/markdown-nice 'markdown-nice')

javascript 实现下载 markdown 文件， 掘金是使用 NUXT.js 来实现的 ssr， 所以 会将全部的数据保存在全局对象中 **NUXT**，

`__NUXT__.state.view.column.entry.article_info.mark_content` 这样就可以直接取到 markdown 文件内容了，

但是有用户写文章的时候不是用 markdown 写的， 是用富文本编辑器来写的，这个时候就没有 mark_content 数据了，这个时候就要涉及到 HTML 转 markdown

我们可以使用 turndown 这个库来实现。

下载文件 js

```js
export const downLoad = (filename, code) => {
  // 下载的文件名
  var file = new File([code], filename, {
    type: 'text/markdown',
  })
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a')
  eleLink.download = filename
  eleLink.style.display = 'none'
  // 下载内容转变成blob地址
  eleLink.href = URL.createObjectURL(file)
  // 触发点击
  document.body.appendChild(eleLink)
  eleLink.click()
  // 然后移除
  document.body.removeChild(eleLink)
}
```

## 复制实现

使用剪切板 api `event.clipboardData.setData()` 这个是现代浏览器都支持的 api

简单示例

```js
document.addEventListener('copy', function (e) {
  e.clipboardData.setData('text/plain', 'foo')
  e.preventDefault() // 阻止浏览器默认事件
})
```

通过以上代码就可以用 JavaScript 来修改剪切板的内容了，需要注意的是**阻止浏览器默认事件**

```js
document.getElementById('copyBtn').onclick = function () {
  document.execCommand('copy')
}
```

然后需要触发复制

最终代码

```js
export const copySafari = (text) => {
  // 获取 input
  let input = document.getElementById('copy-input')
  if (!input) {
    // input 不能用 CSS 隐藏，必须在页面内存在。
    input = document.createElement('input')
    input.id = 'copy-input'
    input.style.position = 'absolute'
    input.style.left = '-1000px'
    input.style.zIndex = '-1000'
    document.body.appendChild(input)
  }
  // 让 input 选中一个字符，无所谓那个字符
  input.value = 'NOTHING'
  input.setSelectionRange(0, 1)
  input.focus()

  // 复制触发
  document.addEventListener('copy', function copyCall(e) {
    e.preventDefault()
    e.clipboardData.setData('text/html', text)
    e.clipboardData.setData('text/plain', text)
    document.removeEventListener('copy', copyCall)
  })
  document.execCommand('copy')
}
```

## TODO

未来需要兼容更多平台

- [ ] 简书
- [ ] 思否
- [ ] CSDN

## Github

[tampermonkey-copy-helper](https://github.com/maqi1520/tampermonkey-copy-helper 'tampermonkey-copy-helper')

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
