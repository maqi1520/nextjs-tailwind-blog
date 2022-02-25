---
title: '如何测试 React 路由 ？'
date: '2022/1/19'
lastmod: '2022/1/20'
tags: [React.js, 测试]
draft: false
summary: '本文承接上文 如何测试 React 异步组件？，这次我将继续使用 @testing-library/react 来测试我们的 React 应用，并简要简要说明如何测试路由系统。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c8605a0b17b427a93d2cae9770a4479~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

本文承接上文[ 如何测试 React 异步组件？](https://juejin.cn/post/7046686808377131039)，这次我将继续使用 [@testing-library/react](https://testing-library.com/) 来测试我们的 React 应用，并简要简要说明如何测试路由系统。

## 基本示例

> 以下代码使用 react-router V6 版本， V5 使用 Switch 包裹组件

通常我们的程序会写下如下代码：

首先我们有 2 个页面

- `src/routes/home.jsx` 主页

```jsx
export default function Home() {
  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>这是主页</h2>
    </main>
  )
}
```

- `src/routes/about.jsx` 关于页面

```jsx
export default function Home() {
  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>这是关于页</h2>
    </main>
  )
}
```

然后使用 `HashRouter` 或者 `BrowserRouter` 包裹，形成我们的程序的主入口`index.jsx`

- `src/index.jsx` 程序入口

```jsx
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './routes/home'
import About from './routes/about'

const NoMatch = () => <div>No Found</div>

function App() {
  return (
    <HashRouter>
      <div>
        <Link to="/">主页</Link>
        <Link to="/about">关于</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </HashRouter>
  )
}

export default App
```

因为我们的页面足够简单，所以页面不会报错，那如果当页面变量的复杂，页面下的其中一个组件报错，就会引起白屏

例如 现在在 `about` 页面下添加一个错误组件

```jsx
import React from 'react'

function AboutContent() {
  throw new Error('抛出一个测试错误')
}

export default function About() {
  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>这是关于页</h2>
      <AboutContent />
    </main>
  )
}
```

此时页面就会报错，但如果我们没有点击 about 页面，我们的程序任然正常运行，所以我们需要对路由进行测试。

## 测试方法

我们知道 `@testing-library/react` 是运行在 node 环境中的，但浏览器中并没有 `HashRouter` 或者 `BrowserRouter` ，所以我们需要一个用到 `MemoryRouter`

此时我们需要将原先的 `index.jsx` 拆分到 `app.jsx`

- `src/index.jsx` 入口

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { HashRouter } from 'react-router-dom'

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
```

- `src/app.jsx`

```jsx
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './routes/home'
import About from './routes/about'

const NoMatch = () => <div>No Found</div>

function App() {
  return (
    <HashRouter>
      <div>
        <Link to="/">主页</Link>
        <Link to="/about">关于</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </HashRouter>
  )
}

export default App
```

此时我们可以添加单元测试

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'
import App from './App'

test('测试整个路由系统', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByText(/这是主页/i)).toBeInTheDocument()

  userEvent.click(screen.getByText(/关于/i))
  expect(screen.getByText(/这是关于页/i)).toBeInTheDocument()
})
```

[MemoryRouter](https://reactrouter.com/docs/en/v6/api#memoryrouter) 有 2 个参数

- 第一个参数 `initialEntries={["/users/mjackson"]}` 配置初始化路由
- 第二个参数 `initialIndex` 默认是 `initialEntries` 中的最后一个值

测试 404 页面

```jsx
test('测试路由未匹配', () => {
  render(
    <MemoryRouter initialEntries={['/some/bad/route']}>
      <App />
    </MemoryRouter>
  )

  expect(screen.getByText(/Not Found/i)).toBeInTheDocument()
})
```

## 通用测试

当页面有多个的时候，我们可以添加一个通用组件来确保每个页面都没有错误

```jsx
import { useLocation } from 'react-router-dom'

export const LocationDisplay = ({ children }) => {
  const location = useLocation()

  return (
    <>
      <div data-testid="location-display">{location.pathname}</div>
      {children}
    </>
  )
}
```

将 url 显示在页面上, 通过遍历确保每个页面可以正确渲染。

```jsx
let routes = ['/', '/about']

routes.forEach((route) => {
  test(`确保${route} 的 url 可以正确显示`, () => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <LocationDisplay>
          <App />
        </LocationDisplay>
      </MemoryRouter>
    )

    expect(screen.getByText(new RegExp(route))).toBeInTheDocument()
  })
})
```

## 小结

以下是路由测试的步骤:

1.  将程序和使用什么路由分开;
1.  使用 MemoryRouter 来测试;
1.  通过 [userEvent.click](url) 点击确保页面可以正确渲染;
1.  提供一个公共包裹组件，通过遍历来测试每个页面，确保渲染

以上就是本文的全部内容，那么如何测试 react hooks ？请关注我，我会尽快出 React test 系列的下文。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
