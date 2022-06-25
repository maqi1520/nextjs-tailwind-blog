---
title: '打字机效果的实现与应用'
date: '2022/6/25'
lastmod: '2022/6/25'
tags: [前端, javaScript, React.js]
draft: false
summary: '在 web 应用中，模拟编辑器的输入效果，往往能够吸引人们的眼球，让用户的注意力聚焦在输入的内容上，其实使用的是 web 动画模拟打字机效果，本文将和大家探讨打字机效果的实现方式以及应用。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac3da8d3b8d847aaaa4b2d525487e55a~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

在 web 应用中，模拟编辑器或者模拟输入框中文字啪啦啪啦输入的效果，往往能够吸引人们的眼球，让用户的注意力聚焦在输入的内容上，其实使用的是 web 动画模拟打字机效果，本文将和大家探讨打字机效果的实现方式以及应用。

## 纯 css 实现

最简单的方式是莫过于直接使用 CSS 。大概思路是借助 CSS3 的 `@keyframe` 动画来不断改变包含文字的容器的宽度，超出容器部分的文字隐藏不展示。

![css 打字机效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5902a16d44ca4c799d4f8c7d77e82775~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

```html
<style>
  .typing {
    font-size: 20px;
    /* 初始宽度为0 */
    width: 0;
    height: 30px;
    border-right: 1px solid darkgray;
    animation: write 4s steps(14) forwards, blink 0.5s steps(1) infinite;
    overflow: hidden;
  }

  @keyframes write {
    0% {
      width: 0;
    }
    100% {
      width: 240px;
    }
  }

  @keyframes blink {
    50% {
      /* transparent是全透明黑色(black)的速记法，即一个类似rgba(0,0,0,0)这样的值。 */
      border-color: transparent; /* #00000000 */
    }
  }
</style>

<body>
  <div class="typing">自在，轻盈，我本不想停留</div>
</body>
```

`Steps(<number_of_steps>，<direction>)`

animation steps 可以让动画断断续续，而非连续执行。接收两个参数：

第一个参数指定动画分割的段数；

第二个参数可选，接受 start 和 end 两个值，指定在每个间隔的起点或是终点发生阶跃变化，默认为 end。

可以看到其实现原理很简单，打字效果其实就是改变容器的宽度实现的。 初始文字是全部在页面上的，只是容器的宽度为 0，设置文字超出部分隐藏，然后不断改变容器的宽度； 设置 `border-right`，并在关键帧上改变 `border-color` 为 `transparent`，右边框就像闪烁的光标了。

优点是简单，缺点也是有的，首先我们要先获得文本的宽度，上面的截图就是因为宽度写错了，导致光标在文字后面，然后只支持 1 行。若想要支持多行，就得使用 JavaScript 了。

## js 实现

### setInterval 实现

```html
<style>
  /* 产生光标闪烁的效果 */
  #content::after {
    content: '|';
    color: #000;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
<div id="content"></div>
<script>
  ;(function () {
    // 获取容器
    const container = document.getElementById('content')
    // 把需要展示的全部文字进行切割
    const data = '自在，轻盈，我本不想停留'.split('')
    // 需要追加到容器中的文字下标
    let index = 0
    let timer = null
    function writing() {
      if (index < data.length) {
        // 追加文字
        container.innerHTML += data[index++]
        // 也可以使用，clearTimeout取消setInterval的执行
        // index === 4 && clearTimeout(timer)
      } else {
        clearInterval(timer)
      }
      console.log(timer) // 这里会打印出 1 1 1 1 1 ...
    }
    // 使用 setInterval 时，结束后不要忘记进行 clearInterval
    timer = setInterval(writing, 200)
  })()
</script>
```

setInterval 版本的实现也很简单，只需把要展示的文本进行切割，使用定时器不断向 DOM 元素里追加文字即可，同时使用`::after` 伪元素在 DOM 元素后面产生光标闪烁的效果。代码和效果图如下：

### setTimeout 实现

和 setInterval 一样，setTimeout 也可以实现

```html
<style>
  /* 产生光标闪烁的效果 */
  #content::after {
    content: '|';
    color: #000;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
<div id="content"></div>
<script>
  ;(function () {
    // 获取容器
    const container = document.getElementById('content')
    // 把需要展示的全部文字进行切割
    const data = '自在，轻盈，我本不想停留'.split('')
    // 需要追加到容器中的文字下标
    let index = 0
    function writing() {
      if (index < data.length) {
        // 追加文字
        container.innerHTML += data[index++]
        let timer = setTimeout(writing, 200)
      }
    }
    writing()
  })()
</script>
```

需要强调一点：定时器指定的时间间隔，表示的是何时将定时器的代码添加到消息队列，而不是何时执行代码，所以真正何时执行代码的时间是不能保证的，取决于何时被主线程的事件循环取到，并执行。

那如果想要实现暂停和播放，那就必须使用 `clearTimeout()` 方法来终止，

```html
<div id="content"></div>
<button id="pause">暂停</button>
<script>
  // 获取容器
  const container = document.getElementById('content')
  // 把需要展示的全部文字进行切割
  const data = '最简单的打字机效果实现'.split('')
  // 需要追加到容器中的文字下标
  let index = 0
  let timer

  document.querySelector('#pause').addEventListener('click', () => {
    clearTimeout(timer)
  })

  function writing() {
    if (index < data.length) {
      // 追加文字
      container.innerHTML += data[index++]
      timer = setTimeout(writing, 200)
    }
  }
  writing()
</script>
```

但除了暂停，还有回退，修改等操作，需要修改光标位置等，我们可以使用一个 npm 库来搞定。

### Typeit 实现

![Typeit 官网效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66b6eeca052f4545874684910d63c819~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?) 首先需要引如 cdn script

```html
<script src="https://unpkg.com/typeit@8.6.0/dist/index.umd.js"></script>
```

或是使用 npm 安装这个包

```bash
npm install typeit
```

官网首页 demo 代码

```js
new TypeIt('#hero', {
  speed: 50,
  startDelay: 900,
})
  .type('the mot versti', { delay: 100 })
  .move(-8, { delay: 100 })
  .type('s', { delay: 400 })
  .move(null, { to: 'START', instant: true, delay: 300 })
  .move(1, { delay: 200 })
  .delete(1)
  .type('T', { delay: 225 })
  .pause(200)
  .move(2, { instant: true })
  .pause(200)
  .move(5, { instant: true })
  .move(5, { delay: 200 })
  .type('a', { delay: 350 })
  .move(null, { to: 'END' })
  .type('le typing utlity')
  .move(-4, { delay: 150 })
  .type('i')
  .move(null, { to: 'END' })
  .type(' on the <span class="place">internet</span>', { delay: 400 })
  .delete('.place', { delay: 800, instant: true })
  .type('<em><strong class="font-semibold">planet.</strong></em>', {
    speed: 100,
  })
  .go()
```

代码一目了然，支持暂停、删除，移动、而且还支持 html。

需要**注意**的是 TypeIt 在商用项目上是收费的, 在个人或者开源项目上是免费的。商用项目需要支付 $19,那么有没有免费的呢？

### typed.js 实现

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/48c800c43744455ba8696e4d36d860c5~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

那如果想在商用项目上免费使用，可以使用 typed.js ，采用 MIT 开源协议，与 TypeIt 类似的 api

```html
<script>
  var typed = new Typed('#typed', {
    stringsElement: '#typed-strings',
  })
</script>
<div id="typed-strings">
  <p>Typed.js is a <strong>JavaScript</strong> library.</p>
  <p>It <em>types</em> out sentences.</p>
</div>
<span id="typed"></span>
```

对 seo 非常友好，它是在从页面上的 HTML 元素读取，再通过 js 动态插入。

## 打字机效果应用

程序讲究的输入和输出，虽然我们在页面上实现了动态输入的效果，若能够同步实现输出，岂不是实现了编译器的效果？

### Sildev 使用 markdown 写 PPT

之前分享的 [Sildev](https://cn.sli.dev/ 'https://cn.sli.dev/')，就完美地将输入和输出效果展现在页面上

![Sildev 输入和输出](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f44d99ce481a4eb59de4602d82c41f3c~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

源码在[这里](https://github.com/slidevjs/docs-cn/blob/main/.vitepress/theme/components/demo/Demo.vue 'https://github.com/slidevjs/docs-cn/blob/main/.vitepress/theme/components/demo/Demo.vue')

```js
new TypeIt(block.value, {
    speed: 50,
    startDelay: 900,
    afterStep: () => {
      code.value = JSON.parse(JSON.stringify(block.value!.innerText.replace('|', '')))
    },
  })
    .type('<br><span class="token title"># 欢迎使用 Slidev!</span><br><br>', { delay: 400 })
    .type('为开发者打造的演示文稿工具', { delay: 400 })
```

其主要原理是通过 `afterStep` 回调函数 将页面上的输入值，设置到 state 中，然后再使用 vue 中的 watch，监听输入值的变化，将 markdown 解析成 HTML 插入到页面中。

```js
import { ref, onMounted, watch } from 'vue'
import { parse } from '@slidev/parser'

...
watch([code, paused], () => {
  if (paused.value)
    return
  try {
    info.value = parse(code.value)
  }
  catch (e) {
  }
})
...

```

实现方式简单，但却让用户一目了然，让用户不用看文档就可以学会使用 markdown 写 PPT。

### 动态简历

之前在知乎上看到@方应杭用 vue 写了一个[会动的简历](https://zhuanlan.zhihu.com/p/25541520 'https://zhuanlan.zhihu.com/p/25541520')，也是运用了打字机效果，将输入和输出完美的展现在浏览器里，若不了解其原理会觉得很高大上，但实现代码却很简单，源码在[这里](https://github.com/jirengu-inc/animating-resume 'https://github.com/jirengu-inc/animating-resume')

![会动的简历](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/706f8e389e9946f9b6ab241c4bf5eaf2~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

## 学以致用

我之前使用 MDX 写了一个微信排版编辑器 [MDX Editor](https://editor.runjs.cool/ 'https://editor.runjs.cool/')，正好少了一个首页，能否加上打字机效果呢？

![mdx-editor](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d5a02e1e5574d0382ebed74f23c2c2a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

可自定义组件、样式、生成二维码、代码 diff 高亮，一键拷贝到微信，可导出 markdown 和 PDF。 关于代码和原理就就不贴了，大致和 Sildev 差不多，只不过我使用的是 react 来实现，代码已经[开源](https://github.com/maqi1520/mdx-editor 'https://github.com/maqi1520/mdx-editor')，若对你有帮助， 可以点个 star，感谢您的支持！

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
