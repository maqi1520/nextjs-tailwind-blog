---
title: '在 Webpack 5 中开启懒编译（Lazy Compilation）'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: '在 webpack 5 中推出了 experiments 配置，目的是为了给用户赋能去开启并试用一些实验的特性。Lazy Compilation 是只有在用户访问时才编译。'
images:
  [
    https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b786a15d8cd74839b7774c454d02d69b~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?,
  ]
authors: ['default']
layout: PostLayout
---

在 webpack 5 中推出了 experiments 配置，目的是为了给用户赋能去开启并试用一些实验的特性。

> 由于实验特性具有相对 宽松的语义版本，可能会有重大的变更，所以你需要将 webpack 的版本固定为小版本号，例如与其使用 webpack: ~5.4.3 不如使用 webpack: ^5.4.3 或者当使用 experiments 配置时将版本锁定。

## 懒编译（Lazy Compilation）是什么

Lazy Compilation 是只有在用户访问时才编译，包含 2 点，使用入口点和动态导入的代码，它适用 Web 或 Node.js。

webpack 多入口配置

```js
module.exports = {
  //...
  entry: {
    app: './app.js',
    home: './home.js',
    about: './about.js',
  },
}
```

**将代码改成动态导入**

```js
// 之前
import { add } from './math'
console.log(add(16, 26))
// 之后
import('./math').then((math) => {
  console.log(math.add(16, 26))
})
```

React 项目可以使用 `React.lazy` 动态导入

```jsx
// 之前
import OtherComponent from './OtherComponent'
// 之后
const OtherComponent = React.lazy(() => import('./OtherComponent'))
```

```js
module.exports = {
  //...
+  experiments: {
+    lazyCompilation: true,
+  },
};
```

lazyCompilation 的可配置参数

- boolean

开启为 true，包含入口和动态加载懒编译

- object

```js
{
// define a custom backend
backend?: ((
  compiler: Compiler,
  callback: (err?: Error, api?: BackendApi) => void
  ) => void)
  | ((compiler: Compiler) => Promise<BackendApi>)
  | {
    /**
     * A custom client.
    */
    client?: string;
    /**
     * Specify where to listen to from the server.
     */
    listen?: number | ListenOptions | ((server: typeof Server) => void);
    /**
     * Specify the protocol the client should use to connect to the server.
     */
    protocol?: "http" | "https";
    /**
     * Specify how to create the server handling the EventSource requests.
     */
    server?: ServerOptionsImport | ServerOptionsHttps | (() => typeof Server);
},
entries?: boolean,
imports?: boolean,
test?: string | RegExp | ((module: Module) => boolean)
}
```

- backend：配置修改自定义后端，默认是 webpack dev-server
- entries: 是否开启入口访问懒加载
- imports `5.20.0+`:是否开启动态导入的代码懒编译
- test `5.20.0+`: 指定哪些动态导入的模块需要懒编译

比如可以改成这样，将多入口改成懒编译，忽略动态导入的代码

```js
module.exports = {
  // …
  experiments: {
    lazyCompilation: {
      imports: false,
      entries: true,
    },
  },
}
```

## 效果

我的项目有 10w+ 代码量，可以在 2s 内启动
![启动效果](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e72f8f2614de43dca0fb85fe9d9d85c0~tplv-k3u1fbpfcp-watermark.image?)

然后当再次输入 url 时，会再次编译，速度比 vite 了，不同的是 vite 是将 node_modules 预构建的。

![输入url时再次编译](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1d0e2c099d2457ba85dbb967c8f1890~tplv-k3u1fbpfcp-watermark.image?)

若在开启 webpack5 的文件缓存，将会非常快，当出入 url 时候就编译好看，几乎不需要等候编译

```js
module.exports = {
  // …
  {
      type: 'filesystem',
      cacheDirectory: path.resolve('node_modules/.cache'),
      store: 'pack',
      ...
    }
};
```

## 小结

懒编译目前应该还在 beta，可能会有 BUG；next.js 其实就加过基于路由的懒编译，优点是能提速，缺点是跳转页面时需要等待，我认为懒编译在多页面项目必不可少，因为开发时候只是针对单个页面开发就够了。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
