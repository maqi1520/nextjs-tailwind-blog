---
title: 如何避免 React hooks 闭包陷阱？
date: 2022/11/28 07:57:37
lastmod: 2023/1/25 11:42:16
tags: [React.js, 掘金·金石计划]
draft: false
summary: 有时候我们使用了useMemo useCallback 来优化性能，这些函数与外围的 state 形成闭包，导致缓存函数中获取到的 state 不是最新的值，这就是闭包陷阱。
images: https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc9a2de7e4874d37ba6010fac897d212~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 什么是 React hooks 闭包陷阱？

在 react 中 提供了一些性能优化函数 `react.memo` 、`useMemo`、`useCallback`。

```js
const cachedValue = useMemo((fn) => calculateValue, dependencies)
```

**useMemo**：memoized 值，只有依赖项变更的时候才会重新计算

```js
const cachedFn = useCallback(fn, dependencies)
```

**useCallback**：memoized 函数，只有依赖项变更的时候才会重新更新

```js
const MemoizedComponent = memo(SomeComponent, arePropsEqual?)
```

**memo**：缓存组件，当 props 没变化的时候，不会执行 render。`arePropsEqual` 是一个可选函数，可以自定义对比新旧的 `props`, 返回 `true` 就会缓存，返回 `false`，就不会缓存。

```
const arePropsEqual=(oldProps: Props, newProps: Props) => boolean
```

有时候我们使用了这些函数来优化性能，这些函数与外围的 state 形成闭包，导致缓存函数中获取到的 state 不是最新的值，这就是闭包陷阱。

## 实例演示

比如下面代码，在项目中有一个计时器组件，还有一个 `Child` 组件, 点击 `Child` 组件需要返回 App 组件中的最新 `state` 值；

```tsx
import React, { useCallback, useEffect, useLayoutEffect } from 'react'
import 'antd/dist/antd.css'
import { Button, ButtonProps } from 'antd'

const Child = ({ onClick }: ButtonProps) => {
  console.log('render')
  return (
    <Button onClick={onClick} type="primary">
      Button
    </Button>
  )
}

const App: React.FC = () => {
  const [count, setCount] = React.useState(0)

  useEffect(() => {
    const time = setInterval(() => {
      setCount((count) => count + 1)
    }, 1000)
    return () => {
      clearInterval(time)
    }
  }, [])

  const handleClick = () => {
    console.log(count)
  }

  return (
    <>
      <h2>{count}</h2>
      <Child onClick={handleClick} />
    </>
  )
}

export default App
```

这样没什么问题，但是每次渲染的时候 `Child` 组件都会执行 render

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ffc82d64fd84254b2a988cb0f340bdd~tplv-k3u1fbpfcp-watermark.image?)

为了防止 App 组件在更新的时候，不重复渲染（render）子组件，我们使用 `React.memo` 包裹下 `Child` 组件， `handleClick` 也需要使用 `useCallback` 包裹，这样 `Child` 组件只会 render 一次。

```tsx
const Child = React.memo(({ onClick }: ButtonProps) => {
  console.log('render')
  return (
    <Button onClick={onClick} type="primary">
      Button
    </Button>
  )
})
```

```
const handleClick = useCallback(() => {
    console.log(count);
  }, []);
```

这样一来 `useCallback` 和 state 就形成了一个闭包，每次打印的 state 就是初始化的 state。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d18a20ad358d44a29ef944ca483489da~tplv-k3u1fbpfcp-watermark.image?)

为了获得最新的 state 值，必须将 count 参数写进 useCallback 的第二个参数。

```js
const handleClick = useCallback(() => {
  console.log(count)
}, [count])
```

但这样，又会导致 `Child` 组件更新。那么有什么好的解决办法呢？既能防止子组件的更新，又可以获取到最新的 `state` 值呢？

**方法：**

我们可以使用 `useRef` 来存一个函数，每次更新的时候设置 `ref.current` 的值，通过函数来获取最新的 `state` 值。

```
const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<VoidFunction>();

  useEffect(() => {
    const time = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
    return () => {
      clearInterval(time);
    };
  }, []);

  const fn = () => {
    console.log(count);
  };

  ref.current = fn;

  const handleClick = useCallback(() => {
    ref.current();
  }, []);

  return (
    <>
      <h2>{count}</h2>
      <Child onClick={handleClick} />
    </>
  );
};

```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36531d7c4f1f4c6d987991568df7a2dc~tplv-k3u1fbpfcp-watermark.image?)

[codesandbox 演示地址](https://codesandbox.io/s/an-niu-lei-xing-antd-4-24-2-forked-wv1w0q?file=/demo.tsx)

## 小结

解决闭包陷阱的方法

1. 当页面更新不频繁的时候，不使用 `useMemo`、`useCallback` 缓存函数来优化页面；

2. 将更新依赖的参数写进 `useCallback` 的第二个参数

3. 使用 `useRef` 来存在一个函数，用一个函数实时获取最新的 `state` 值

以上就是本文全部内容，如果对你有帮助，可以随手点个赞，这对我真的很重要，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

> 本文正在参加[「金石计划 . 瓜分 6 万现金大奖」](https://juejin.cn/post/7162096952883019783 'https://juejin.cn/post/7162096952883019783')
