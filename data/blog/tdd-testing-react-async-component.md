---
title: '[TDD] 如何测试 React 异步组件？'
date: '2021/12/28'
lastmod: '2021/12/28'
tags: [React.js, 测试]
draft: false
summary: '前言 本文承接上文 如何测试驱动开发 React 组件？，这次我将继续使用 @testing-library/react 来测试我们的 React 应用，并简要简要说明如何测试异步组件。'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/48b1226b3b9444a599ba2c186fbbafd2~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

本文承接上文[ 如何测试驱动开发 React 组件？](https://juejin.cn/post/7036318575165964325)，这次我将继续使用 [@testing-library/react](https://testing-library.com/) 来测试我们的 React 应用，并简要简要说明如何测试异步组件。

## 异步组件的测试内容

我们知道异步请求主要用于从服务器上获取数据，这个异步请求可能是主动触发的，也可能是（鼠标）事件响应，本文主要包含 2 方面内容：

1. 如何测试在 `componentDidMount` 生命周期中发出的异步请求 ？

2. 如何测试（鼠标）事件发出的异步请求 ？

---

对于异步组件，有两件步骤需要进行测试：

第一：测试异步方法本身有没有被调用，并且传了正确的参数。

第二：在调用之后，应用程序应该做出响应。

一起来看看代码中该如何实现？

假设你有一个用 React 编写的小型博客应用程序。有一个登录页面，还有有一个文章列表页面，内容就跟我的[博客](http://maqib.cn/)一样。

## 登录测试

先来实现登录页，先脑补一个效果图吧

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f693016862ef42ce8b92aaeb17861b7a~tplv-k3u1fbpfcp-watermark.image?)

我们先来写下测试用例

1.  界面包含账号和密码输入框
2.  接口请求包含 username 和 password
3.  防止登录重复点击
4.  登录成功跳转页面
5.  登录失败显示错误信息

### 测试渲染

代码未动，测试先行，先确保我们的组件可以渲染。

```js
import React from 'react'
import { render } from '@testing-library/react'
import Login from './index'

describe('Login component', () => {
  it('should render', () => {
    const { getByText } = render(<Login onSubmit={() => {}} />)
    expect(getByText(/账号/)).toBeInTheDocument()
    expect(getByText(/密码/)).toBeInTheDocument()
  })
})
```

### 登录组件实现

为了保证是一个纯组件，将提交方法`onSubmit`作为一个 `props` 传入，接下来我们实现下组件代码

```jsx
import React from 'react'

function Login({ onSubmit }) {
  function handleSubmit(event) {
    event.preventDefault()
    const { username, password } = event.target.elements

    onSubmit({
      username: username.value,
      password: password.value,
    })
  }
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username-field">账号：</label>
        <input id="username-field" name="username" type="text" />
      </div>
      <div>
        <label htmlFor="password-field">密码：</label>
        <input id="password-field" name="password" type="password" />
      </div>
      <div>
        <button type="submit">登录</button>
      </div>
    </form>
  )
}

export default Login
```

为了方便理解我们这边没有使用其他三方库，若在生产环境中，我推荐使用 [react-hook-form](https://react-hook-form.com/)

### 测试提交

接下来测试下 `onSubmit` 方法必须包含 `username` 和 `password`,

我们需要模拟用户输入，这个时候我们需要安装 `@test-library/user-event`

```jsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './index'

test('onSubmit calls  with username and password', () => {
  let submittedData
  const handleSubmit = (data) => (submittedData = data)
  render(<Login onSubmit={handleSubmit} />)
  const username = 'user'
  const password = 'password'

  userEvent.type(screen.getByPlaceholderText(/username/i), username)
  userEvent.type(screen.getByPlaceholderText(/password/i), password)
  userEvent.click(screen.getByRole('button', { name: /登录/ }))

  expect(submittedData).toEqual({
    username,
    password,
  })
})
```

我们可以选用 `@testing-library` 的 `get*By*` 函数获取 dom 中的元素， 这里使用 `getByPlaceholderText`

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8fd8363df2a47f8aac99f646a67b06c~tplv-k3u1fbpfcp-watermark.image?)

以上测试用例只测试了登录函数，但是我们并未写登录成功或者失败的逻辑，接下来来我们通过 jest 的 mock 函数功能来模拟登录。

### 测试登录成功

由于测试登录成功的例子已经包含了"测试提交"和"测试渲染"的功能，所以，可以将前面 2 个单元测试删除。登录后，按钮改成 loading 状态 disabled。

```jsx
const fakeData = {
  username: 'username',
  password: 'username',
}

test('onSubmit success', async () => {
  // mock 登录函数
  const login = jest.fn().mockResolvedValueOnce({ data: { success: true } })
  render(<Login onSubmit={login} />)

  userEvent.type(screen.getByPlaceholderText(/username/i), fakeData.username)
  userEvent.type(screen.getByPlaceholderText(/password/i), fakeData.password)
  userEvent.click(screen.getByRole('button', { name: /登录/ }))
  //登录后，按钮改成 loading 状态 disabled
  const button = screen.getByRole('button', { name: /loading/ })

  expect(button).toBeInTheDocument()
  expect(button).toBeDisabled()

  await waitFor(() => expect(login).toHaveBeenCalledWith(fakeData))

  expect(login).toHaveBeenCalledTimes(1)

  // 文档中没有 loading 按钮
  expect(screen.queryByRole('button', { name: 'loading' })).not.toBeInTheDocument()
})
```

接下来我们修改组件, 顺便把登录失败的逻辑也写了，登录失败在登录框下显示服务端返回信息。

```jsx
import React, { useState } from 'react'

function Login({ onSubmit }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  function handleSubmit(event) {
    event.preventDefault()
    const { username, password } = event.target.elements
    setLoading(true)

    onSubmit({
      username: username.value,
      password: password.value,
    })
      .then((res) => {
        setLoading(false)
      })
      .catch((res) => {
        setLoading(false)
        setMessage(res.data.message)
      })
  }
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username-field">账号：</label>
        <input id="username-field" name="username" placeholder="username" type="text" />
      </div>
      <div>
        <label htmlFor="password-field">密码：</label>
        <input id="password-field" name="password" placeholder="password" type="password" />
      </div>
      <div>
        <button disabled={loading} type="submit">
          {loading ? 'loading' : '登录'}
        </button>
      </div>
      <div>{message}</div>
    </form>
  )
}

export default Login
```

### 测试登录失败

我们直接复制成功的测试用例，修改失败的逻辑。测试用例：

- 失败后文档中显示服务端的消息
- 失败后按钮又显示登录并且可以点击

```jsx
test('onSubmit failures', async () => {
  const message = '账号或密码错误！'
  // mock 登录函数失败
  const login = jest.fn().mockRejectedValueOnce({
    data: { message },
  })
  render(<Login onSubmit={login} />)

  userEvent.type(screen.getByPlaceholderText(/username/i), fakeData.username)
  userEvent.type(screen.getByPlaceholderText(/password/i), fakeData.password)
  userEvent.click(screen.getByRole('button', { name: /登录/ }))

  const button = screen.getByRole('button', { name: /loading/ })

  expect(button).toBeInTheDocument()
  expect(button).toBeDisabled()

  await waitFor(() => expect(login).toHaveBeenCalledWith(fakeData))

  expect(login).toHaveBeenCalledTimes(1)

  // 确保文档中有服务端返回的消息
  expect(screen.getByText(message)).toBeInTheDocument()

  // 文档中没有 loading 按钮
  expect(screen.queryByRole('button', { name: 'loading' })).not.toBeInTheDocument()

  expect(screen.getByRole('button', { name: /登录/ })).not.toBeDisabled()
})
```

## 博客列表测试

相信经过登录的测试，我们在来写博客列表的测试已经不难了，我们先来写下测试用例：

- 接口请求中页面显示 loading
- 请求成功显示博客列表
- 列表为空显示暂无数据
- 请求失败显示服务端错误

### 博客列表代码

下面的代码中， 使用了 `react-use`，首先我们先要安装这个包

```jsx
import React from 'react'
import { fetchPosts } from './api/posts'
import { useAsync } from 'react-use'

export default function Posts() {
  const posts = useAsync(fetchPosts, [])

  if (posts.loading) return 'Loading...'
  if (posts.error) return '服务端错误'
  if (posts.value && posts.value.length === 0) return '暂无数据'

  return (
    <>
      <h1>My Posts</h1>
      <ul>
        {posts.value.map((post) => (
          <li key={post.id}>
            <a href={post.url}>{post.title}</a>
          </li>
        ))}
      </ul>
    </>
  )
}
```

当然我们也可以写 class 的实现方式，代码如下：

```jsx
import React from 'react'
import { fetchPosts } from './api/posts'

export default class Posts extends React.Component {
  state = { loading: true, error: null, posts: null }

  async componentDidMount() {
    try {
      this.setState({ loading: true })
      const posts = await fetchPosts()
      this.setState({ loading: false, posts })
    } catch (error) {
      this.setState({ loading: false, error })
    }
  }

  render() {
    if (this.state.loading) return 'Loading...'
    if (this.state.error) return '服务端错误'
    if (this.state.posts && this.state.posts.length === 0) return '暂无数据'

    return (
      <>
        <h1>My Posts</h1>
        <ul>
          {this.state.posts.map((post) => (
            <li key={post.id}>
              <a href={post.url}>{post.title}</a>
            </li>
          ))}
        </ul>
      </>
    )
  }
}
```

### Mock 接口

```js
jest.mock('./api/posts')
```

我们可以在官方文档中阅读关于 [jest.mock](https://jestjs.io/zh-Hans/docs/es6-class-mocks) 的更多信息。

它所做的就是告诉 Jest 替换`/api/posts` 模块。

现在我们已经有了 mock，让我们来渲染组件，并且界面显示 loading:

```js
import React from 'react'
import { render, screen } from '@testing-library/react'
import Post from './index'

jest.mock('./api/posts')

test('should show loading', () => {
  render(<Posts />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

这是第一步，现在我们需要确保我们的 `fetchPosts` 方法被正确调用:

```jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import Posts from './index'
import { fetchPosts } from './api/posts'

jest.mock('./api/posts')

test('should show a list of posts', () => {
  render(<Posts />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  expect(fetchPosts).toHaveBeenCalledTimes(1)
  expect(fetchPosts).toHaveBeenCalledWith()
})
```

通过 `toHaveBeenCalledTimes` 测试调用次数，通过 `toHaveBeenCalledWith` 测试调用方法的参数，虽然这边是空数据，但是我们也可以写，确保调用参数是空。

此时我们的测试代码会报错，因为我们没有 Mock `fetchPosts` 方法

```jsx
import React from 'react'
import { render, screen, wait } from '@testing-library/react'
import Posts from './index'
import { fetchPosts } from './api/posts'

jest.mock('./api/posts')

test('should show a list of posts', async () => {
  // mock 接口
  const posts = [{ id: 1, title: 'My post', url: '/1' }]
  fetchPosts.mockResolvedValueOnce(posts)

  render(<Posts />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  expect(fetchPosts).toHaveBeenCalledWith()
  expect(fetchPosts).toHaveBeenCalledTimes(1)

  //等待标题渲染
  await waitFor(() => screen.findByText('My Posts'))
  posts.forEach((post) => expect(screen.getByText(post.title)).toBeInTheDocument())
})
```

我们使用 `mockResolvedValueOnce` 返回一些假数据。然后，我们等待异步方法解析并等待 Posts 组件重新渲染。为此，我们使用 `waitFor` 方法，同时检查标题是否呈现，之后遍历检查，确保每一个标题在页面上。

### 测试接口错误

接下来我们要测试错误是否被正确呈现，那么只需要修改 mock:

```jsx
test('should show an error message on failures', async () => {
  fetchPosts.mockRejectedValueOnce('Error!')

  render(<Posts />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText('服务端错误')).toBeInTheDocument()
  })
  expect(fetchPosts).toHaveBeenCalledWith()
  expect(fetchPosts).toHaveBeenCalledTimes(1)
})
```

## 小结

以下是测试异步组件的步骤:

1.  通过 mock  使组件可以获取静态假数据;
1.  测试加载状态;
1.  测试异步方法是否被正确调用，并且带上了正确的参数;
1.  测试组件是否正确地渲染了数据
1.  测试异步方法错误时，组件是是否渲染了正确的状态

文中关于登录成功后页面跳转并未测试，那么如何测试 react 路由 ？请关注我，我会尽快出 React test 系列的下文。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
