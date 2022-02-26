---
title: '【译】你真的应该使用useMemo吗? 让我们一起来看看'
date: '2021/6/4'
lastmod: '2022/1/6'
tags: [React.js]
draft: false
summary: '- 当处理量很大时，应该使用 useMemo - 从什么时候 useMemo 变得有用以避免额外处理，阈值在很大程度上取决于您的应用程序 - 数据在处理非常低的情况下使用 useMemo'
images: ['']
authors: ['default']
layout: PostLayout
---

> 原文：https://medium.com/swlh/should-you-use-usememo-in-react-a-benchmarked-analysis-159faf6609b7

一些开发人员最近提出了一个问题，什么时候应该在 React 中使用 useMemo？这是一个非常好的问题。在本文中，我将使用一种科学的方法，先定义一个假设，并在 React 中对其进行测试。

请继续阅读，了解 useMemo 对性能的影响。

## 什么是 useMemo？

useMemo 是 React 提供的一个 hook 函数。这个钩子允许开发人员缓存变量的值和依赖列表。如果此依赖项列表中的任何变量发生更改，React 将重新运行此函数去处理并重新缓存它。如果依赖项列表中的变量值没有改版，则 React 将从缓存中获取值。

useMemo 主要是对组件的重新渲染有影响。一旦组件重新渲染，它将从缓存中提取值，而不必一次又一次地循环数组或着处理数据。

## react 官方是怎么介绍 useMemo 的？

我们咋一看一下 的 React 文档，关于 useMemo，它在应该什么时候使用并没有被提及。只是简单地提到它的作用和使用方法。

> You may rely on useMemo as a performance optimization

> 您可以依赖 useMemo 作为性能优化工具

这里的探讨关于 useMemo 的使用问题将非常有趣！

那么使用 useMemo 的性能优势之前，数据应该有多复杂或大？开发者应该什么时候使用 useMemo？

## 实验

在我们开始实验之前，让我们先定义一个假设。

让我们首先定义要执行的对象和处理的复杂性为 n。如果 n = 100，那么我们需要循环遍历 100 条数据，以获得 memo-ed 变量的最终值。

然后，我们还需要分开两个操作：

- 第一是组件的初始渲染

  在这种情况下，如果一个变量使用 useMemo 或不使用 useMemo，它们都必须计算初始值。

- 二是使用 useMemo 重新渲染

  可以从缓存中检索值，其中的性能优势应该与非 useMemo 版本相比。

在这 2 中情况下，我预计在初始渲染会有大约 5-10% 的开销。当 n < 1000 时，我预计使用 useMemo 的性能下降。对于 n > 1000，使用 useMemo 我预计重新渲染有更好的性能，但初始渲染应该仍然略慢，因为需要额外的缓存算法。

那么你的猜测是什么？

### 基准测试设置

我们设置了一个小的 React 组件如下，它将生成一个复杂度为 n 的对象，复杂度定义在 props level 。

- BenchmarkNormal.jsx

```jsx
import React from 'react';
const BenchmarkNormal = ({level}) => {
    const complexObject = {
        values: []
    };
    for (let i = 0; i <= level; i++) {
        complexObject.values.push({ 'mytest' });
    }
    return ( <div>Benchmark level: {level}</div>);
};
export default BenchmarkNormal;
```

这是我们正常的基准组件，我们还将为 useMemo 做一个基准组件 BenchmarkMemo。

- BenchmarkMemo.jsx

```jsx
import React, {useMemo} from 'react';
const BenchmarkMemo = ({level}) => {
    const complexObject = useMemo(() => {
        const result = {
            values: []
        };

        for (let i = 0; i <= level; i++) {
            result.values.push({'mytest'});
        };
        return result;
    }, [level]);
    return (<div>Benchmark with memo level: {level}</div>);
};
export default BenchmarkMemo;
```

然后，我们在 App.js 中添加这些组件，当按下按钮时显示。我们还使用 React 的 `<Profiler>` 来计算渲染时间。

```js
function onRenderCallback(
  id, // 发生提交的 Profiler 树的 “id”
  phase, // "mount" （如果组件树刚加载） 或者 "update" （如果它重渲染了）之一
  actualDuration, // 本次更新 committed 花费的渲染时间
  baseDuration, // 估计不使用 memoization 的情况下渲染整颗子树需要的时间
  startTime, // 本次更新中 React 开始渲染的时间
  commitTime, // 本次更新中 React committed 的时间
  interactions // 属于本次更新的 interactions 的集合
) {
  // 合计或记录渲染时间。。。
}
```

Profiler 的回调函数

```jsx
function App() {
  const [showBenchmarkNormal, setShowBenchmarkNormal] = useState(false)

  const timesToRender = 10000

  const renderProfiler = (type) => {
    return (...args) => {
      // 存储args[3]
      //放到数组中然后计算平均值
    }
  }
  return (
    <p>
      {' '}
      {showBenchmarkNormal &&
        [...Array(timesToRender)].map((index) => {
          return (
            <Profiler id={`normal-${index}`} onRender={renderProfiler('normal')}>
              <BenchmarkNormal level={1} />
            </Profiler>
          )
        })}
    </p>
  )
}
```

如您所见，我们渲染组件 10000 次，并获取这些组件的平均渲染时间。

### 重新渲染触发机制

为了保持结果的清晰，我们总是在开始测试之前从一个新的浏览器页面开始(除了重新渲染) ，来排除任何可能浏览器缓存。

## 结果

### 复杂度 n = 1 的结果

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53fd3f899ffc4564bbb3f39555ccd5c2~tplv-k3u1fbpfcp-watermark.image)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/46bb80811b804b45985ce9de50a27802~tplv-k3u1fbpfcp-watermark.image)

复杂度在左列显示第一个行初始渲染，第二行是第一次重新渲染，最后一行是第二次重新渲染。
第二列显示了普通基准测试的结果，不包括 useMemo。
最后一列显示了使用 useMemo 的基准测试的结果。

当使用 useMemo 时，初始渲染会慢 19% ，这比预期的 5-10% 要高得多。随后的渲染仍然很慢，因为通过 useMemo 缓存的开销比重新计算实际的开销更大。

总之，对于复杂度 n = 1，不使用 useMemo 总是更快，因为缓存计算总是比性能增益更昂贵。

### 复杂度 n = 100 的结果

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/682c807200bf4dee8805e7f087bad7d5~tplv-k3u1fbpfcp-watermark.image)

在复杂度为 100 的情况下，使用 useMemo 的初始渲染变慢了 62% ，而随后的重新渲染速度差不多，最多只是稍微快一点。在这一点上，useMemo 似乎还没有起到作用。

### 复杂度 n = 1000 的结果

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00fd811185414b86b1ebf18e8e8c01bc~tplv-k3u1fbpfcp-watermark.image)

由于复杂度为 1000，使用 useMemo 的初始渲染变慢了 183% ，后续渲染大约快 37% ！

在这一点上，我们可以看到重新渲染的一些性能提高，但它并不是没有成本。最初的渲染速度要慢得多，损失了 183% 的时间，然而，二次渲染速度要快 37% ，这是否有用将在很大程度上取决于您的用例。

### 复杂度 n = 5000 的结果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/44885dea1ba34e3491e98ccd61f99dc4~tplv-k3u1fbpfcp-watermark.image)

在复杂度为 5000 的情况下，我们注意到 useMemo 的初始渲染速度要慢 545%，看起来数据和处理的复杂度越高，初始渲染的速度就越慢。

有趣的是二次渲染和重新渲染，在这里，我们注意到在每个后续渲染中 useMemo 的性能提高了 437% 和 609% 。

总之，使用 useMemo 的初始渲染更加昂贵，但是随后的重新渲染会有更大的性能提升。如果您的应用程序的数据/处理复杂度大于 5000 并且有一些重新渲染，我们可以看到使用 useMemo 的好处。

### 结果说明

友好的读者社区已经指出了一些可能的原因，比如为什么初始渲染会慢很多，比如运行生产模式等等。我们重新测试了所有的实验，发现结果是相似的。这些比率相似，但实际值可能更低。最终结论都是一样的。

## 总结

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a7da26becc4493caa84b24313cd2573~tplv-k3u1fbpfcp-watermark.image)

是否应该使用 useMemo 将在很大程度上取决于您的用例，如果复杂度小于 100，useMemo 似乎没什么意思。

值得注意的是，useMemo 最初的渲染在性能方面遭受了相当大的开销。我们预计初始性能损失大约为 5-10% ，但结果发现甚至可能导致 500% 的性能损失（这在很大程度上取决于数据/处理的复杂性），这比预期的性能损失多 100 倍。

## 关键点

我们都同意，通过保持变量的相同对象引用，useMemo 可以有效地避免不必要的重复渲染。

对于使用 useMemo 缓存的作用，其主要目标不是避免在子组件中重新渲染:

- 当处理量很大时，应该使用 useMemo
- 从什么时候 useMemo 来避免额外处理，阈值在很大程度上取决于您的应用程序
- 数据在处理非常低的情况下使用 useMemo，可能会有额外的使用开销

那么你什么时候使用 useMemo？
以上统计会改变你何时使用 useMemo 的想法吗？请在评论中告诉我！
