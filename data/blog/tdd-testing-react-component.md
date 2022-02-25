---
title: '如何测试驱动开发 React 组件？'
date: '2021/11/30'
lastmod: '2022/1/16'
tags: [测试]
draft: false
summary: '什么是TDD（Test-driven development），就是测试驱动开发，是敏捷开发中的一项核心实践和技和技术。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa3943f055434bbca9d461401edba4ca~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 什么是 TDD

TDD（Test-driven development），就是**测试驱动开发**，是**敏捷开发**中的一项核心实践和技术，也是一种软件设计方法论。

它的原理就是**在编写代码之前先编写测试用例**，由测试来决定我们的代码。而且 TDD 更多地需要编写**独立**的测试用例，比如只测试一个组件的某个功能点，某个工具函数等。

## TDD 的过程

- 编写测试用例
- 运行测试，测试失败
- 修改代码
- 测试通过
- 重构/优化代码
- 新增功能，重复上述步骤

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4965a412a5674d2aa7b8c1d156639a31~tplv-k3u1fbpfcp-watermark.image?)

在某种程度上，它可能在初学者看来是单调乏味或者不切实际的，但是严格按照这个步骤来做这件事，让你自己决定测试用例是否对你的组件有帮助，会让测试用例变得有意义。

本文将以创建一个 `Confirmation` 组件来说明，如何在 React 中如何实现测试驱动开发。

## Confirmation 组件的特点:

- Confirmation 标题
- 确认描述 —— 接收外部程序想要确认的问题
- 一个确认的按钮，支持外部回调函数
- 一个取消的按钮，支持外部回调函数

这两个按钮都不知道点击时接下来要做什么事，因为它超出了组件的职责范围，但是组件应该接收这些点击按钮的回调事件。先找个设计图:

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc1b0313a9c74ece802a967e707ee27f~tplv-k3u1fbpfcp-watermark.image?)

那么，让我们开始吧。

## 测试组件

首先使用 create-react-app 初始化一个 react 项目。目前 cra 已经内置了
@testing-library/react 作为测试框架。

```bash
npx create-react-app my-react-app
```

我们先从测试文件开始。先创建了组件的目录`“Confirmation”` 并在其中添加一个`“index.test.js”`文件。

### 确保渲染测试

第一个测试相当抽象。仅仅需要检查组件是否展现(任何东西) ，以确保这个组件是存在。但是实际上，我将要测试的组件还不存在。

首先通过 getByRole 方法 查找 `role`属性等于`dialog`能否文档中找到。

> role 属性可能不太常用， 当现有的 HTML 标签不能充分表达语义性的时候，就可以借助 role 来说明. 例如点击的按钮，就是 role="button" ；会让这个元素可点击；也可以使用 role 属性告诉辅助设备（如屏幕阅读器）这个元素所扮演的角色。

```jsx
import React from 'react'
import { render } from '@testing-library/react'

describe('Confirmation component', () => {
  it('should render', () => {
    const { getByRole } = render(<Confirmation />)
    expect(getByRole('dialog')).toBeInTheDocument()
  })
})
```

运行测试并且监听

```bash
yarn test --watch
```

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fec3f233d91c4b519474a9b8bc9903b9~tplv-k3u1fbpfcp-watermark.image?)

用 “脚趾头” 思考都知道这肯定是不能通过测试的。接下来，让我们创建一个足够满足这个测试的组件:

```jsx
import React from 'react'

const Confirmation = () => {
  return <div role="dialog"></div>
}

export default Confirmation
```

然后把这个组件导入到测试中，它现在通过了。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e98ae8b6d9b42d2ac99c11951906c6e~tplv-k3u1fbpfcp-watermark.image?)

接下来，组件应该有一个动态标题。

### 动态标题测试

创建一个测试用例:

```jsx
it('should have a dynamic title', () => {
  const title = '标题'
  const { getByText } = render(<Confirmation title={title} />)
  expect(getByText(title)).toBeInTheDocument()
})
```

测试失败了，修改代码使它通过:

```jsx
import React from 'react'

const Confirmation = ({ title }) => {
  return (
    <div role="dialog">
      <h1>{title}</h1>
    </div>
  )
}

export default Confirmation
```

下一个特性，这个组件中存在一个`确认问题提示`。

### 动态问题测试

这个问题也是动态的，这样它就可以从组件外部传入。

```jsx
it('should have a dynamic confirmation question', () => {
  const question = 'Do you confirm?'
  const { getByText } = render(<Confirmation question={question} />)
  expect(getByText(question)).toBeInTheDocument()
})
```

测试再次失败，修改代码让它通过:

```jsx
import React from 'react'

const Confirmation = ({ title, question }) => {
  return (
    <div role="dialog">
      <h1>{title}</h1>
      <div>{question}</div>
    </div>
  )
}

export default Confirmation
```

### 确认按钮测试

接下来是确认按钮测试。我们首先要检查组件上是否有一个按钮，上面写着“确认”。

编写测试用例代码:

```jsx
it('should have an "OK" button', () => {
  const { getByRole } = render(<Confirmation />)
  expect(getByRole('button', { name: '确认' })).toBeInTheDocument()
})
```

在这里使用 `name` 选项，因为我们知道这个组件中至少还有一个按钮，需要更具体地说明查找断言的是哪个按钮

组件代码:

```jsx
import React from 'react'

const Confirmation = ({ title, question }) => {
  return (
    <div role="dialog">
      <h1>{title}</h1>
      <div>{question}</div>
      <button>确认</button>
    </div>
  )
}

export default Confirmation
```

### 取消按钮测试

同样对“取消”按钮做同样的事情:

测试:

```jsx
it('should have an "取消" button', () => {
  const { getByRole } = render(<Confirmation />)
  expect(getByRole('button', { name: '取消' })).toBeInTheDocument()
})
```

组件代码:

```jsx
import React from 'react'

const Confirmation = ({ title, question }) => {
  return (
    <div role="dialog">
      <h1>{title}</h1>
      <div>{question}</div>
      <button>确认</button>
      <button>取消</button>
    </div>
  )
}

export default Confirmation
```

好了。现在我们得到了我们想要的组件渲染的 HTML ，现在我想要确保我可以从外部传递这个组件的按钮的回调函数，并确保它们在单击按钮时被调用。

那么我将从“确认”按钮的测试开始:

```jsx
it('should be able to receive a handler for the "确认" button and execute it upon click', () => {
  const onOk = jest.fn()
  const { getByRole } = render(<Confirmation onOk={onOk} />)
  const okButton = getByRole('button', { name: '确认' })

  fireEvent.click(okButton)

  expect(onOk).toHaveBeenCalled()
})
```

先用 `jest.fn` 创建一个模拟函数，将其作为“onOk”处理函数传递给组件，模拟单击“确认”按钮，并断言函数已被调用。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e58c45e40324bbaba0730026058b91b~tplv-k3u1fbpfcp-watermark.image?)

这个测试显然失败了，下面是补充代码:

```jsx
import React from 'react'

const Confirmation = ({ title, question, onOk }) => {
  return (
    <div role="dialog">
      <h1>{title}</h1>
      <div>{question}</div>
      <button onClick={onOk}>确认</button>
      <button>取消</button>
    </div>
  )
}

export default Confirmation
```

最后，让我们对“取消”按钮做同样的事情:

测试:

```jsx
it('should be able to receive a handler for the "取消" button and execute it upon click', () => {
  const onCancel = jest.fn()
  const { getByRole } = render(<Confirmation onCancel={onCancel} />)
  const okButton = getByRole('button', { name: '取消' })

  fireEvent.click(okButton)

  expect(onCancel).toHaveBeenCalled()
})
```

组件:

```jsx
import React from 'react'

const Confirmation = ({ title, question, onOk, onCancel }) => {
  return (
    <div role="dialog">
      <h1>{title}</h1>
      <div>{question}</div>
      <button onClick={onOk}>确认</button>
      <button onClick={onCancel}>取消</button>
    </div>
  )
}

export default Confirmation
```

下面是完整的测试文件:

```jsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Confirmation from './index'

describe('Confirmation component', () => {
  it('should render', () => {
    const { getByRole } = render(<Confirmation />)
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('should have a dynamic title', () => {
    const title = '标题'
    const { getByText } = render(<Confirmation title={title} />)
    expect(getByText(title)).toBeInTheDocument()
  })

  it('should have a dynamic confirmation question', () => {
    const question = 'Do you confirm?'
    const { getByText } = render(<Confirmation question={question} />)
    expect(getByText(question)).toBeInTheDocument()
  })

  it('should have an "确认" button', () => {
    const { getByRole } = render(<Confirmation />)
    expect(getByRole('button', { name: '确认' })).toBeInTheDocument()
  })

  it('should have an "取消" button', () => {
    const { getByRole } = render(<Confirmation />)
    expect(getByRole('button', { name: '取消' })).toBeInTheDocument()
  })

  it('should be able to receive a handler for the "确认" button and execute it upon click', () => {
    const onOk = jest.fn()
    const { getByRole } = render(<Confirmation onOk={onOk} />)
    const okButton = getByRole('button', { name: '确认' })

    fireEvent.click(okButton)

    expect(onOk).toHaveBeenCalled()
  })

  it('should be able to receive a handler for the "取消" button and execute it upon click', () => {
    const onCancel = jest.fn()
    const { getByRole } = render(<Confirmation onCancel={onCancel} />)
    const okButton = getByRole('button', { name: '取消' })

    fireEvent.click(okButton)

    expect(onCancel).toHaveBeenCalled()
  })
})
```

虽然这个组件没有样式，或者说我们还可以优化，添加跟多的功能，以上步骤已经充分展示了测试驱动开发的逻辑。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3ec1ef1c6cc498ea7fe24f6b429ee86~tplv-k3u1fbpfcp-watermark.image?)

TDD 一步一步地引导完成组件特性的规范，确保我们在组件重构或者他人修改代码的时候能够遵循现有开发的逻辑。这这是 TDD 的优势。

## 调试

我们可以使用 `debug` 打印渲染的 html 结构

代码

```jsx
it('should be able to receive a handler for the "取消" button and execute it upon click', () => {
  const onCancel = jest.fn()
  const { getByRole, debug } = render(<Confirmation onCancel={onCancel} />)

  debug()
})
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3fea1ba152fe46efaf7b6c1618ce2b9b~tplv-k3u1fbpfcp-watermark.image?)

这样可以方便我们查找 dom。

## 小结

当然 `@testing-library/react` 还有很多方便的 [api](https://testing-library.com/docs/react-testing-library/cheatsheet)。大家可以自行查阅。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1064e4310214421c8738607ce775f0e0~tplv-k3u1fbpfcp-watermark.image?)

未来可能会出一些文章关于测试的文章。例如：

如何出测试 react hooks ？

如何测试 react 路由？

如何测试接口？

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
