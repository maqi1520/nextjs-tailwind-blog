---
title: '前端妹子问我 position fixed  失效问题该如何解决？'
date: '2022/5/25'
lastmod: '2022/5/25'
tags: [JavaScript, React.js, CSS]
draft: false
summary: '这两天公司一位妹子问我，“我这边调试的时候本地显示没问题，到手机端就有问题，该怎么办呢？” 测试环境没问题到线上就有问题了？对此我也很纳闷。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81d913acfca842c8af67299bba4d7a7a~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 背景

这两天公司一位妹子问我，“我这边调试的时候本地显示没问题，到手机端就有问题，该怎么办呢？”
测试环境没问题到线上就有问题了？对此我也很纳闷。
下图是复现的效果图， 这个是一个用户选择组件，当点击按钮的时候，弹窗框可以选择用户，当点击按钮后蒙层并没有覆盖全屏。
![选择用户按钮](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29b93ae4656f431f9ff016fab4d31ff1~tplv-k3u1fbpfcp-zoom-1.image)

![点击按钮后](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa1a058e04f94676a7b491fc3f8635ce~tplv-k3u1fbpfcp-zoom-1.image)

## 问题分析

组件代码

```jsx
import React, { useState } from 'react'

export default function App({ children }) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <span onClick={() => setVisivle(true)}>{children}</span>
      {visible ? <div className="fixed">...</div> : null}
    </>
  )
}
```

我们知道，`position:fixed` 在日常的页面布局中非常常用，在许多布局中起到了关键的作用。它的作用是：

`position:fixed` 的元素将相对于屏幕视口（viewport）的位置来指定其位置。并且元素的位置在屏幕滚动时不会改变。

但是在某些特定场景下，指定了 position:fixed 的元素却无法相对于屏幕视口进行定位。

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position 'mdn position') 中有句话对这些特定场景做了解释：

> 当元素祖先的 `transform`, `perspective` 或 `filter` 属性非 none 时，容器由视口改为该祖先。

其实并不是本地不能复现，只不过这个表单是用户创建的，只有当该选择组件在 Tab 组件内部的时候 100% 复现。
在上面代码中，就是因为在 Tab 中使用了 `transform:translate3d(0, 0, 0)` 属性，所以会在该场景下失效。

## 失效的 position:fixed

比如下面一个最简单的代码

```html
<div id="app">
  <div class="fixed"></dix>
</div>
```

```css
#app {
  width: 100px;
  height: 100px;
  transform: scale(1);
}
.fixed {
  position: fixed;
  background: blue;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
```

![失效的 position:fixed](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93f7eee6d4ad42e38b05f18e03e9b83b~tplv-k3u1fbpfcp-zoom-1.image)

本来应该全屏的`div`,消失了，上述代码中 `transform: scale(1);`也会导致 `position:fixed` 失效，那么，为什么会发生这种情况呢？

这就涉及到了 Stacking Context ，也就是堆叠上下文的概念了。解释上面的问题分为两步：

1. 任何非 `none` 的 `transform` 值都会导致一个堆叠上下文（Stacking Context）和包含块（Containing Block）的创建。

2. 由于堆叠上下文的创建，该元素会影响其子元素的固定定位。设置了 `position:fixed` 的子元素将不会基于 `viewport` 定位，而是基于这个父元素。

## 解决办法

那么要如何解决呢？ 我开发的是一个公共组件，总不能要求使用组件的父元素都不使用 `transform`, `perspective` 或 `filter` 这些属性吧？

是不是直接将弹窗插入到 `body` 下就可以了呢?

在 React 中提供了 createPortal 方法， 该方法可以将子节点渲染到存在于父组件以外的 DOM 节点中

所以我们可以改一下组件代码：

```jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function App({ children }) {
  const [visivle, setVisivle] = useState(false);

  const node = useRef();

  useEffect(() => {
    node.current = document.createElement("div");

    document.body.appendChild(node.current);
    return () => {
      if (node.current) {
        node.current.remove();
      }
    };
  }, []);
  return (
    <>
      <span onClick={() => setVisivle(true)}>{children}</span>
      {visivle && node.current
        ? createPortal(<div className="fixed">...</div>，node.current)
        : null}
    </>
  );
}
```

这样就可以解决 `position:fixed` 失效的问题，当然，因为在 `body`元素下，可以使用 `position:absolute` 代替 。

## position:fixed 的其他问题

`position: fixed` 还有一些其他问题，比如在在移动端实现头部、底部模块定位。或者是在 `position: fixed` 中使用了 input 也会存在一些问题，可以看下这篇文章：[移动端 web 页面使用 position:fixed 问题总结](https://github.com/maxzhang/maxzhang.github.com/issues/2 '移动端web页面使用position:fixed问题总结')

借用了[前端胖头鱼](https://juejin.cn/user/3438928099549352)的首图。
以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
