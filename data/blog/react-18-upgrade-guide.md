---
title: '如何升级到 React 18发布候选版 '
date: '2022/3/15'
lastmod: '2022/3/15'
tags: [前端, React.js]
draft: false
summary: '上周 react 官网 发布了react@rc 版本，该版本是候选版本(Release Candidate)，这意味API已经基本稳定，跟最终版本不会有太大差别，官网也发布博客《如何升级到 react18 RC 版本》，鼓励大家尝试升级，所以我们可以在项目组中使用了！下面内容来自是官方文档的翻译。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5ca9595ccd1479f86d71903184a4d0b~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc}  toHeading={2} />

上周 react 官网 发布了 react@rc 版本，该版本是候选版本(Release Candidate)，这意味 API 已经基本稳定，跟最终版本不会有太大差别，官网也发布博客[《如何升级到 react18 RC 版本》](https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html)，鼓励大家尝试升级，所以我们可以在项目组中使用了！下面内容来自是官方文档的翻译。

正文开始

---

如果您想帮助我们测试 React 18，请按照本升级指南中的步骤并报告您遇到的任何问题，以便我们能够在稳定版发布之前修复这些问题。

注意: React Native 用户: React 18 将发布在 React Native with the New React Native Architecture。更多信息，请参见 _[React Conf keynote here](https://www.youtube.com/watch?v=FZ0cG47msEk&t=1530s)._

## 安装

安装最新的 `React 18 RC` 版本使用@rc 这个 tag

```bash
npm install react@rc react-dom@rc
```

或是使用 yarn

```bash
yarn add react@rc react-dom@rc
```

## 客户端渲染 API 的更新

### 1. 替换 render 函数为 createRoot

如果你是第一次安装 `React 18` ，会在控制台看到如下一个警告：

> Use createRoot instead. Until you switch to the new API, your app will behave as if it’s running React 17. Learn more: https://reactjs.org/link/switch-to-createroot

这是因为用了 `ReactDOM.render` 调用的现有 API。这将创建一个在“遗留”模式下运行的 root，其工作原理与 React 17 完全相同。在发布之前，React 给这个 API 添加一个警告，指示它已被弃用，并切换到新的 `Root API`。

`React 18` 中引入了一个新的 `Root API`，它支持了并发渲染的能力(concurrent renderer) ，你可以自己决定是否启用并发渲染的能力。

```js
// 以前
import { render } from 'react-dom'
const container = document.getElementById('app')
render(<App tab="home" />, container)

// 现在
import { createRoot } from 'react-dom/client'
const container = document.getElementById('app')
const root = createRoot(container)

// 初始渲染将节点渲染到跟节点上
root.render(<App tab="home" />)

// 之后更新，就没必要传递dom 节点了
root.render(<App tab="profile" />)
```

React 更改这个 API 有以下几个原因。

首先，这修复了 API 在运行更新时的一些工程学问题。如上所示，在 Legacy API 中，你需要多次将容器元素传递给 `render`，即使它从未更改过。这也意味着我们不需要将根元素存储在 DOM 节点上，尽管我们今天仍然这样做。

其次，这一变化允许让我们可以移除 `hydrate` 方法并替换为 root 上的一个选项；删除渲染回调，这些回调在部分 hydration 中是没有意义的。

销毁 dom 的 api 也修改了，`unmountComponentAtNode` 也改为了 `root.unmount`：

```js
// 以前
unmountComponentAtNode(container)

// 现在
root.unmount()
```

与此同时， `render` 函数的回调函数也没有了，因为通常在使用了 `Suspense` api 后没有达到预期的效果：

```js
// 以前
const container = document.getElementById('app')
ReactDOM.render(<App tab="Home" />, container, () => {
  console.log('rendered')
})

// 现在需要 重新定义一个 函数 通过 useEffect 来回调
function AppWithCallbackAfterRender() {
  useEffect(() => {
    console.log('rendered')
  })

  return <App tab="Home" />
}

const container = document.getElementById('app')
const root = ReactDOM.createRoot(container)
root.render(<AppWithCallbackAfterRender />)
```

### hydrate 升级到 hydrateRoot

> hydrate 是 ReactDOM 复用 ReactDOMServer 服务端渲染的内容时尽可能保留结构，并补充事件绑定等 Client 特有内容的过程。

将把 `hydrate` 函数移到了 `hydrateRoot` API 上。

以前：

```js
import * as ReactDOM from 'react-dom'
import App from 'App'

const container = document.getElementById('app')

// Render with hydration.
ReactDOM.hydrate(<App tab="home" />, container)
```

现在：

```js
import * as ReactDOM from 'react-dom'

import App from 'App'

const container = document.getElementById('app')

// Create *and* render a root with hydration.
const root = ReactDOM.hydrateRoot(container, <App tab="home" />)
// 与createRoot不同，这里不需要单独的 root.ender()调用
```

注意，与 createRoot 不同，hydrateRoot 接受原生 JSX 作为第二个参数。这是因为初始客户端渲染是特殊的，需要与服务器树匹配。

如果你想在 hydration 后再次更新 root，你可以将它保存到一个变量中，就像使用 createRoot 一样，然后调用 root.render()：

```js
import * as ReactDOM from 'react-dom'
import App from 'App'

const container = document.getElementById('app')

// Create *and* render a root with hydration.
const root = ReactDOM.hydrateRoot(container, <App tab="home" />)

// You can later update it.
root.render(<App tab="profile" />)
```

## 服务端渲染 API 的更新

在这个版本中，`React` 为了完全支持服务端的 `Suspense` 和流式 SSR，改进了 `react-dom/server` 的 `API`，不支持 Suspense 的 `Node.js` 流式 `API` 将会被完全弃用：

- `renderToNodeStream` 弃用 ⛔️️
- 相反，对于 Node 环境中的流媒体，使用:`renderToPipeableStream`。

还引入了一个新的 API `renderToReadableStream`，用于支持流式 SSR 和 Suspense，并为现代边缘运行环境提供支持，比如 Deno 和 Cloudflare workers:

`renderToString、renderToStaticMarkup` 这两个 API 还可以继续用，但是对 `Suspense` 支持就不那么友好了。

最后，`renderToStaticNodeStream`这个 API 将继续使用，拥于渲染电子邮件

> 想了解更多，可以看 [working group discussion here](https://github.com/reactwg/react-18/discussions/5).

## 自动批处理 (Automatic Batching)

`React` 中的批处理简单来说就是将多个状态更新合并为一次重新渲染，由于设计问题，在 `React 18` 之前，`React` 只能在组件的生命周期函数或者合成事件函数中进行批处理。默认情况下，`Promise、setTimeout` 以及其他异步回调是无法享受批处理的优化的。

批处理是指 React 将多个状态更新合并到一个重新渲染中，以此来获得更好的性能。在 React 18 之前，react 会将一个事件中的多个 setState 合并为一个，在 promises、 setTimeout、和其他异步事件的更新没有合并。

```js
// React 18 之前

function handleClick() {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // 在合成事件中，享受批处理优化，只会重新渲染一次
}

setTimeout(() => {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // 不会进行批处理，会触发两次重新渲染
}, 1000)
```

从 `React 18` 开始，如果你使用了 `createRoot`，所有的更新都会享受批处理的优化，包括`Promise、setTimeout` 以及其他异步回调函数中。

```js
// React 18

function handleClick() {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // 只会重新渲染一次
}

setTimeout(() => {
  setCount((c) => c + 1)
  setFlag((f) => !f)
  // 只会重新渲染一次
}, 1000)
```

如果你有特殊的渲染需求，不想进行批处理，也可以使用 `flushSync` 异步更新：

```js
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCounter((c) => c + 1)
  })
  // 更新 DOM
  flushSync(() => {
    setFlag((f) => !f)
  })
  // 更新 DOM
}
```

> 想了解更多可以看 [Automatic batching deep dive](https://github.com/reactwg/react-18/discussions/21)

## 用于第三方库的 API

React18 工作组合一些库的维护人员创建了新的 api，比如样式 外部存储和可访问性等方面需要用到并发渲染，一些库可能切换到以下 api 之一

- `useId` 是一个新的 `Hook`，用于在客户端和服务端生成唯一 id，同时避免 `hydration` 的不兼容，这可以解决 `React 17` 以及更低版本的问题。
- `useSyncExternalStore` 是一个新的 `Hook`，允许外部存储通过强制同步更新来支持并发读取。这个新的 API 推荐用于任何与 React 外部状态集成的库。有关更多信息，请参见 useSyncExternalStore 概述文章和 useSyncExternalStore API 详细信息。
- `useInsertionEffect` 是一个新的 `Hook`，它可以解决 `CSS-in-JS` 库在渲染中动态注入样式的性能问题。

React 18 还为并发渲染引入了新的 api，例如 `startTransition` 和 `useDeferredValue`，将在即将发布的稳定版本中分享更多相关内容。

## 更新严格模式 (Strict Mode)

在未来，React 希望添加一个特性，允许 React 添加和删除 UI 的部分，同时保留状态。例如，当用户选项卡远离屏幕并返回时，React 应该能够立即显示前一个屏幕。为此，React 将使用与前面相同的组件状态卸载和重新挂载树。

这个特性将使 React 具有更好的开箱即用性能，但是需要组件对多次挂载和销毁的效果具有弹性。大多数效果不需要任何改变就可以工作，但是有些效果假设它们只被安装或者销毁一次。

为了帮助表面这些问题，react 18 引入了一个新的开发-只检查严格模式。每当一个组件第一次挂载时，这个新的检查将自动卸载和重新挂载每个组件，恢复第二次挂载时以前的状态。

## 配置你的测试环境

当您第一次更新，使用了 createRoot 时，您可能会在控制台中看到这个警告:

> **The current testing environment is not configured to support act(…)**

要解决这个问题，请在运行测试之前将 `globalThis.IS react act act environment` 设置为 `true`:

```js
globalThis.IS_REACT_ACT_ENVIRONMENT = true
```

标志的作用是告诉 React 它在类似于单元测试的环境中运行。如果你忘记用 `act` 包裹更新，则响应将记录有用的警告信息。

您还可以将标志设置为 `false` 来告诉 React `act` 是不必要的。这对于模拟完整浏览器环境的端到端测试非常有用。

最终，我们希望测试库能够自动为您配置这个功能。例如，下一个版本的 React Testing Library 内置了对 React 18 的支持，而不需要任何额外的配置。

> `act` 名称来自 [Arrange-Act-Assert](http://wiki.c2.com/?ArrangeActAssert) 模式。

## 不再支持 IE 浏览器

在这个版本中，React 放弃了对 Internet Explorer 的支持，它将在 2022 年 6 月 15 日失去支持。React 做出这个改变，是因为在 React 18 中引入的新特性是使用现代浏览器的特性构建的，比如微任务，这些特性在 IE 中无法充分填充（polyfilled）。

## 其他变化

- [更新以删除“setState on unmounted component” 警告](https://github.com/reactwg/react-18/discussions/82)
- [Suspense 不再需要`fallback`prop 来捕捉](https://github.com/reactwg/react-18/discussions/72)
- [组件现在可以渲染 undefined](https://github.com/reactwg/react-18/discussions/75)
- [弃用 renderSubtreeIntoContainer](https://github.com/facebook/react/pull/23355)
- [StrictMode 更新为默认情况下不会静默双重日志记录](https://github.com/reactwg/react-18/discussions/96)

如果大家想了解更多内容，欢迎查看 `React` 官方博客：https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/react-18-upgrade-guide")
