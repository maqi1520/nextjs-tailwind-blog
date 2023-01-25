---
title: 使用 Vitest 和 React Testing Library 给 Next.js 应用单元测试
date: 2022/10/25 23:51:35
lastmod: 2023/1/25 11:42:53
tags: [前端, React.js]
draft: false
summary: 在本文中我们给 Next.js 应用配置了 vitest 和 React-testing-library 测试环境，这套配置同样适用于其他 react 项目，只需要依照步骤配置即可。
images: https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d17f81bec9424f6bbf2e808cebff6706~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

---

highlight: monokai
theme: vuepress

---

> 文章为稀土掘金技术社区首发签约文章，14 天内禁止转载，14 天后未获授权禁止转载，侵权必究！

## 前言

在前面的文章中我们使用了 Next.js、 Prisma 和 PostgreSQL 开发了一个最基础视频网站，今天我们来给这个网站添加单元测试，一谈到前端单元测试，你可能会有一个疑惑：测试代码写起来可能会花费你很多时间，甚至比你写业务代码的时间还要长，是否值得？这个问题我们可以反过来自问下，从软件使用者的角度，一个软件有单元测试和没有单元测试，给人的信心是不一样的；从开发者的角度，如果你要接手一个项目，如果这个项目没有单元测试，你可能会觉得在接手一座屎山。所以**单元测试是很有必要的，覆盖全面的测试可以让代码质量更有保证，也能帮助我们更方便地了解现有的功能细节，让我们更有信心地去重构代码**。

Next.js 是一个生产可用的 React 框架，但是关于单元测试部分，却没有集成到框架中，需要开发者去手动填补。现在我们来给项目中添加 [Vitest](https://vitest.dev/ 'Vitest')，并且配合 React Testing Library 来测试 React 组件，这套组合也同样适用于其他 React 项目。

> 文中涉及代码全部托管在 [GitHub 仓库](https://github.com/maqi1520/next-prisma-video-app 'GitHub 仓库代码')中。

## Vitest

[Vitest](https://vitest.dev/) 是由 [Vite](https://vitejs.dev/ 'Vite') 提供支持的极速单元测试框架，近期获得了 6w 多的 star，可以说非常火热，主要因为 Vitest 的以下特点：

- 开箱即用的 TypeScript / JSX 支持
- ESM 优先，支持模块顶级 await
- 兼容 jest 的 api
- 支持测试 Vue、React 等框架中的组件。

## 配置测试环境

### 安装

首先在我们的项目中安装 vitest

```bash
yarn add vitest -D
```

然后在 package.json 中添加测试脚本

```json
{
  ...
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "lint": "next lint"
  },
  ...
}
```

我们先在项目中随便创建一个 `__test__`文件来测试下，是否可以运行

```js
import { describe, it, expect } from 'vitest'

describe('something truthy and falsy', () => {
  it('true to be true', () => {
    expect(true).toBe(true)
  })

  it('false to be false', () => {
    expect(false).toBe(false)
  })
})
```

这里的断言方法`expect().toBe()`与 jest 完全一致，唯一的区别是 `describe, it, expect` 需要从 vitest 导入。

然后运行 `yarn test` 看看是否能够运行成功。

![vitest 测试成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/498218c736934d3e9befb3c96a9b04d1~tplv-k3u1fbpfcp-zoom-1.image)

### 配置 React Testing Library

接下来我们安装 React testing library 相关包

```bash
yarn add @testing-library/react @vitejs/plugin-react jsdom -D
```

@vitejs/plugin-react 是为了让 Vitest 支持 React

jsdom 可以让 Node.js 环境中模拟真实的 dom api ，比如下面代码就是依赖 jsdom， 在 nodejs 环境中有了 `document.querySelector` 这个 api.

```js
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
console.log(dom.window.document.querySelector('p').textContent) //
```

紧接着，需要让 Vitest 支持 jsdom 和 react，我们需要添加一个配置文件

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
```

### 测试 React 组件

现在我们来试试，是否可以测试 React 组件代码。

首先我们随便新建一个文件`app.test.tsx` 文件，输入以下代码

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

function App() {
  return <div>app</div>
}

describe('App', () => {
  it('it should be render', () => {
    render(<App />)
    expect(screen.getByText('app')).toBeInTheDocument()
  })
})
```

运行 `yarn test`

![无法找到断言方法 toBeInTheDocument](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00bd2ac08b2f4af8b08d893f8d5ae155~tplv-k3u1fbpfcp-zoom-1.image)

这时在控制台报错，vitest 默认没有 `toBeInTheDocument` 方法， toBeInTheDocument 是 testing library 中的断言方法，vitest 默认不包含，因此我们需要配置一下初始化文件，继承 testing library 断言库，新建一个 `vitest-setup.ts` 文件

```ts
import { vi, expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers, { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}
// 继承 testing-library 的扩展 except
expect.extend(matchers)
// 全局设置清理函数，避免每个测试文件手动清理
afterEach(() => {
  cleanup()
})
```

上面代码中，`cleanup()` 是为了在每次 `render` 后清理 react dom 树，若不清理可能会导致内存泄漏和非“幂等”测试（这可能导致测试中难以调试的错误），详情请看[官方文档](https://testing-library.com/docs/react-testing-library/api#cleanup)

然后在 vitest.config.ts 中设置 `setupFiles` 文件路径

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
 +   setupFiles: "./vitest-setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

保存后，再次运行 `yarn test`

![测试成功](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d2e9d7c11e64495b59026bbcdb18a8f~tplv-k3u1fbpfcp-zoom-1.image)

可以看到我们 app 组件测试通过了，如果修改测试代码，保存文件后，测试便会自动运行，

如果有测试用例为没有通过，vitest 会将测试结果和报错的位置直接提示在命令行中，也就是 vitest 默认就是 watch 模式，这对开发极为友好。

![app 与 App 不一致，测试失败](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65260eb1d4ab4466be202ba0d19a42da~tplv-k3u1fbpfcp-zoom-1.image)

如果我们的测试代码中使用了 别名`@/`路径， 就会在命令行中有提示错误

![无法找到组件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8becead69a3143c0986ffd5926a1f010~tplv-k3u1fbpfcp-zoom-1.image)

我们需要在`vitest.config.ts`中配置别名，这一点同 vite 一致；

好了，配完成了，现在我们可以愉快地使用 testing-library-react 测试我们的 React 组件了。

## TDD

TDD (Test-Driven Development 测试驱动开发）简单地说就是先根据需求写测试用例，然后实现代码，通过后再接着写下一个测试和实现，循环直到全部功能和重构完成。基本思路就是通过测试来推动整个开发的进行。

在前面的文章中我们开发了首页的视频列表和个人中心页面的视频列表，如下图

![2个视频列表页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2eb2d99e72cb4c14acf19c56efb4936b~tplv-k3u1fbpfcp-zoom-1.image)

其中有很到一部分代码是相同的，因此我们可以提取相同的代码为一个公共组件 `VideoList`。

现在我们就根据 TDD 测试方法论来测试开发 `VideoList` 组件。

1. 首先新建一个 `video-list.test.tsx` 测试文件，先写一个 `snapshot` 测试，此时保存测试肯定会报错，因为我们的组件还没建立；

2. 根据页面功能需求，写组件测试用例，可以先使用 `skip` 代替真实用例，也可以直接使用中文描述；

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import VideoList from '@/components/video-list'

describe('VideoList', () => {
  it('it should be render', () => {
    const { container } = render(<VideoList data={[]} />)
    expect(container).toMatchSnapshot()
  })

  it('it should be render with data', () => {})

  it.skip('it should be render with className', () => {})

  it.skip('it should be editable with editable props', () => {})

  it.skip('it should not be editable without editable props', () => {})
})
```

1）渲染必须有数据
2）渲染必须带 className
3）渲染可以通过 editable 控制状态

3. 建立 VideoList 组件文件，根据首页编写组件代码;

```tsx
type Props = {
  className?: string
  editable?: boolean
  horizontal?: boolean
  data: (Video & {
    author: User
  })[]
}

export default function VideoList({ data, editable, className, horizontal }: Props) {
  return (
    <div className={className}>
      {data.map((item) => {
        return <VideoItem key={item.id} editable={editable} horizontal={horizontal} item={item} />
      })}
    </div>
  )
}
```

下面是 VideoItem 组件代码

```tsx
type ItemProps = {
  editable?: boolean
  horizontal?: boolean
  item: Video & {
    author: User
  }
}

function VideoItem({ item, horizontal, editable }: ItemProps) {
  return (
    <div className="flex flex-col justify-center bg-white p-2 ring-1 ring-gray-200" key={item.id}>
      <div
        className={`flex gap-3 ${
          horizontal ? 'test-horizontal flex-row' : 'test-vertical flex-col'
        }`}
      >
        <Link href={`/video/${item.id}`}>
          <a className="flex gap-2">
            <Image src={item.pic} width={160} height={90} alt={item.title} />
          </a>
        </Link>
        <Link href={`/video/${item.id}`}>
          <a>
            <div className="mt-2">{item.title}</div>
            <div className="mt-2">{item.author.name}</div>
          </a>
        </Link>
      </div>

      {editable && (
        <div className="flex justify-end space-x-3">
          <button
            role="edit"
            className="rounded border border-blue-600 bg-blue-600 px-3 py-2 text-white"
          >
            编辑
          </button>
          <button
            role="delete"
            className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
          >
            删除
          </button>
        </div>
      )}
    </div>
  )
}
```

4. 替换组件中的数据为 mock 数据，确保 mock 数据在页面中显示，并且显示数据 count 与 mock 数据一致

```tsx
it('it should be editable with editable props', () => {
  const { container } = render(<VideoList data={mockData} editable />)

  expect(screen.queryAllByRole('edit')).toHaveLength(mockData.length)
  expect(screen.queryAllByRole('delete')).toHaveLength(mockData.length)
})
```

5. 测试 className、 editable 等其他 props，根据测试用例修改组件代码，直至组件全部测试通过

6. 查看测试跑完的测试覆盖率报告看看是否覆盖全面了，防止有遗漏

```bash
yarn text --coverage
```

此时 vitest 会帮我我们自动安装 `@vitest/coverage-c8` 安装完成后，我们便可以查看测试报告了

![测试覆盖率](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45e16eb755de4a19ae5ac10dd9a53bee~tplv-k3u1fbpfcp-zoom-1.image)

可以看到 branch 下覆盖率并非 100，说明代码中有没有测试到的条件。在项目根目录中会生成一个 coverage 目录，只有浏览器代开 coverage 下的 `index.html`，我们可以看到没有测试到的代码

![每次测试到的代码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e97437b8f0a4fd6adbe1508052ef801~tplv-k3u1fbpfcp-zoom-1.image)

没有测试到的代码会高亮，继续补全测试用例即可。

随着编写组件代码和测试熟练度的增加，个人可以调整写组件和测试用例的先后顺序，或者 2 者同步进行，但是最终提交的时候，组件的测试代码和测试用例是同步提交在一个 commit 中，并不是等组件开发完成后再来补测试用例，以上便上 TDD 的过程。

## 测试自定义 Hooks

还有一些同学会问，“有些东西不知道怎么 mock，比如时间，浏览器全局变量？”，接下来我们测试下之前写的自定义 hooks useOnScreen，通过它来实际解决下这个问题。

```ts
import { useState, useEffect, MutableRefObject } from 'react'

export default function useOnScreen<T extends Element>(
  ref: MutableRefObject<T>,
  rootMargin: string = '0px'
): boolean {
  // 元素是否可见
  const [isIntersecting, setIntersecting] = useState<boolean>(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        //更新返回数据
        setIntersecting(entry.isIntersecting)
      },
      {
        rootMargin,
      }
    )
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => {
      observer.unobserve(ref.current)
    }
  }, []) //只在挂载的时候监听一次
  return isIntersecting
}
```

IntersectionObserver API，可以自动"观察"元素是否可见，Chrome 51+ 已经支持。由于可见（visible）的本质是，目标元素与视口产生一个交叉区，所以这个 API 叫做"交叉观察器"，我们用它来实现无限滚动加载。

1.  这个 api，是浏览器特有的，Node 环境中不存在这个 api，因此我们需要 mock 一下这个 api

```ts
import { vi } from 'vitest'

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}))

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
```

我们通过使用 `vi.stubGlobal` 来模拟 `jsdom` 或 `node` 中不存在的全局变量。它将把全局变量的值放入 `globalThis` 对象，现在我们可以在测试环境中通过 `IntersectionObserver` 或 `window.IntersectionObserver` 访问。

接下来新建一个测试文件，由于 useOnScreen 必须配合一个 domRef 值，所以我们必须重新写一个组件来配合测试：

```jsx
function App() {
  const ref = useRef()
  const visible = useOnScreen(ref)
  return (
    <div role="test" ref={ref}>
      {visible ? 'true' : 'false'}
    </div>
  )
}
```

紧接着的是测试代码：

```ts
describe('useOnScreen', () => {
  it('default value is false，After tigger function should be true', async () => {
    render(<App />)
    expect(screen.getByRole('test')).toHaveTextContent('false')
  })
})
```

默认值返回 false，当触发交叉观察器的时候会返回 true。

再次运行测试

![测试覆盖率88%](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c259c84990d64cca9a56a41a6bfc6cde~tplv-k3u1fbpfcp-zoom-1.image)

覆盖率已经是 88% ，我们来看下测试覆盖率报告， 看看还有哪行代码没有执行到？

![没有测试到的代码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/930bf6b6149b4517b92d098bcb60f28f~tplv-k3u1fbpfcp-zoom-1.image)

我们可以看到， IntersectionObserver 构造函数的回调方法没有主动执行，但是这一步在浏览器中是主动触发的，因此我们需要手动触发 mock 函数的回调方法, 最终测试代码如下：

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import useOnScreen from '@/hooks/useOnScreen'
import { useRef } from 'react'
// 模拟 IntersectionObserver
const IntersectionObserverMock = vi.fn((a) => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}))

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

function App() {
  const ref = useRef()
  const visible = useOnScreen(ref)
  return (
    <div role="test" ref={ref}>
      {visible ? 'true' : 'false'}
    </div>
  )
}

describe('useOnScreen', () => {
  it('default value is false，After callback value should be true', async () => {
    render(<App />)
    //  获得 mock 函数调用的参数
    const callback = IntersectionObserverMock.mock.calls[0][0]

    expect(screen.getByRole('test')).toHaveTextContent('false')

    act(() => {
      callback([{ isIntersecting: true }])
    })
    expect(screen.getByRole('test')).toHaveTextContent('true')
  })
})
```

上面代码中，我们可以使用 `IntersectionObserverMock.mock.calls` 来获得 mock 函数调用的参数，然后使用 `act` 方法 模拟浏览器真实操作，保存代码后，测试自动运行，我们可以看到测试成功，并且覆盖率 100%。

![测试覆盖率100%](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0acdb6e9445742b08d8c50c6f6a78ec0~tplv-k3u1fbpfcp-zoom-1.image)

虽然是这一行代码解决了我的问题，但是我在写这个单元测试的过程中，也花费了我不少时间。

## 小结

在本文中我们：

1. 给 Next.js 应用配置了 vitest 和 React Testing Library 测试环境，这套配置同样适用于其他 react 项目，只需要依照步骤配置即可。vitest 的配置比 jest 更加简单，速度更快，我相信未来也会更加流行。

2. 介绍了 TDD 开发模式，并且从 VideoList 组件着手，依次讲解了 TDD 开发步骤

3. 测试了一个自定义组件 useOnScreen，使用 mock 函数来代替浏览器原生 api，相对于不熟悉的小伙伴（包括我自己）可能需要花费不少时间

**思考**

对于前端单元测试，我觉得不要过多地去追求 100%测试覆盖率，也不要为了单侧而单侧，而是需要根据功能和场景来写单侧，在成本和信心值中间找到一个平衡，应用一些好的实践去降低写单测的成本，提升写测试带来的回报，让我们的项目质量越来越高。

## 后续

接下来我将继续分享 Next.js 相关的实战文章，欢迎各位关注我的《Next.js 全栈开发实战》 专栏。

- Next.js 应用 集成测试
- 使用 Playwright 给 Next.js 应用端到端测试
- 使用 React query 给 Next.js 应用全局状态管理
- 使用 i18next 实现 Next.js 应用国际化
- 使用 Github actions 给 Next.js 应用创建 CI/CD
- 使用 Docker 部署 Next.js 应用
- 将 Next.js 应用部署到腾讯云 serverless

你对哪块内容比较感兴趣呢？欢迎在评论区留言，感谢您的阅读。
