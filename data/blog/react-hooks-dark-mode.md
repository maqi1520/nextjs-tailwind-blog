---
title: '使用 React hooks 监听系统的暗黑模式'
date: '2022/2/10'
lastmod: '2022/2/12'
tags: [React.js, JavaScript]
draft: false
summary: '现在大部分网站也加入了暗黑模式，包括 Tailwindcss、antd design 等都支持了暗黑模式，因此我们的网站也要适配系统皮肤。'
images: ['']
authors: ['default']
layout: PostLayout
---

## 前言

苹果的“暗黑模式”带来了全然一新的外观，它能使您的眼睛放松，并有助于您专心工作。暗黑*模式*使用一种较深的配色方案，这种配色作用于整个系统，现在大部分网站也加入了暗黑模式，包括 Tailwindcss、antd design 等都支持了暗黑模式，因此我们的网站也要适配系统皮肤。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c3b170d5f134f31b0a5273b380eb2d8~tplv-k3u1fbpfcp-watermark.image?)

## css 实现

暗模式传统上是通过使用 `prefers-color-scheme` 媒体查询来实现的，当暗黑模式被激活时，它可以重新应用一套样式。

```css
body {
  color: black;
  background: white;
}
@media (prefers-color-scheme: dark) {
  body {
    color: white;
    background: black;
  }
}
```

## React hooks 实现

前端页面中除了使用 css 实现外，还有很大部分是使用 JavaScript 实现的，比如 echart 图表等，这时就需要使用 JavaScript， 可以使用[window.matchMedia](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/matchMedia) 来获取皮肤颜色。我们可以把这个逻辑写成一个自定义 hooks

```js
import { useEffect, useState } from 'react'

export type ThemeName = 'light' | 'dark'

function useTheme() {
  const [themeName, setThemeName] = useState < ThemeName > 'light'
  useEffect(() => {
    // 设置初始皮肤
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeName('dark')
    } else {
      setThemeName('light')
    }
    // 监听系统颜色切换
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (event.matches) {
        setThemeName('dark')
      } else {
        setThemeName('light')
      }
    })
  }, [])
  return {
    themeName,
    isDarkMode: themeName === 'dark',
    isLightMode: themeName === 'light',
  }
}

export default useTheme
```

## 使用

下面代码是配合 echart 使用

```js
import './styles.css'
import React, { useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import useTheme from './hooks/useTheme'

export default function App() {
  const domRef = useRef(null)
  const { isDarkMode } = useTheme()
  useEffect(() => {
    var myChart = echarts.init(domRef.current, isDarkMode ? 'dark' : 'light')
    var option = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true,
        },
      ],
    }

    myChart.setOption(option)
    return () => {
      myChart.dispose()
    }
  }, [isDarkMode])
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <div ref={domRef} style={{ height: 500 }}></div>
    </div>
  )
}
```

## 效果

![2022-02-10 15-28-54.2022-02-10 15_30_49.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fda7478dee514ab78de357f1e6e90450~tplv-k3u1fbpfcp-watermark.image?)

## 代码示例

[codesandbox](https://codesandbox.io/s/usetheme-jcm9n?file=/src/hooks/useTheme.js)

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

## 相关文章

- [使用 CSS variables 和 Tailwind css 实现主题换肤](https://juejin.cn/post/6971708936734900254)
- [使用 PostCSS 插件让你的网站支持暗黑模式](https://juejin.cn/post/7019580413110648863)
