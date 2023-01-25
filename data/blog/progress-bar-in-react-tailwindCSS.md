---
title: '使用 React 和 Tailwind 创建阅读进度条'
date: '2022/3/1'
lastmod: '2022/3/1'
tags: [前端, React.js]
draft: false
summary: '我们在上网的时候经常会看到一些优秀的博客顶部有个进度条，这个进度条有助于读者衡量阅读进度，我认为这个功能可以带来良好的用户体验，所以，应该将其添加到我个人博客上的文章中。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5ca9595ccd1479f86d71903184a4d0b~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc}  toHeading={2} />

## 前言

我们在上网的时候经常会看到一些优秀的博客顶部有个进度条，这个进度条有助于读者衡量阅读进度，我认为这个功能可以带来良好的用户体验，所以，应该将其添加到我个人博客上的文章中。那么，一起来实现吧。

## 实现逻辑

1. 获取页面可以滚动的高度.
2. 获取页面已经滚动的高度.
3. 阅读进度=已经滚动的高度/页面可以滚动的高度

## 代码

单独定义一个 react hook 来活动当前的阅读进度

```jsx
import { useEffect, useState } from 'react'

export function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function updateScroll() {
      // 已经滚动的高度
      const currentScrollY = window.scrollY
      // 可以滚动的高度
      let scrollHeight = document.body.scrollHeight - window.innerHeight
      if (scrollHeight) {
        setProgress(Number((currentScrollY / scrollHeight).toFixed(2)) * 100)
      }
    }
    // 添加全局滚动事件的监听
    window.addEventListener('scroll', updateScroll)

    // 移除监听
    return () => {
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])
  return progress
}
```

剩下的工作是将进度显示在页面上，为此，我在顶部的导航栏上显示一个进度条。

## 样式

我的博客使用了 TailwindCSS，用它制作进度条非常容易

```jsx
export default function ProgressBar() {
  const progress = useReadingProgress()
  return (
    <div
      style={{
        transform: `translateX(${progress - 100}%)`,
      }}
      className="fixed top-0 left-0 h-1 w-full bg-primary-500 backdrop-blur-3xl transition-transform duration-150"
    />
  )
}
```

我在这里使用 transform 和 translate 属性来制作进度条.

进度为 0 向左偏移 100% ，进度为 100 偏移 0，所以使用 `translateX(${progress - 100}%)`

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
