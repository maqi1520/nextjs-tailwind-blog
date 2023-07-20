---
title: 基于 Tauri， 我写了一个 Markdown 桌面 App
date: 2023/7/13 18:23:59
lastmod: 2023/7/20 09:10:14
tags: [JavaScript]
draft: false
summary: 本文视频地址 前言 大家好，我是小马。 去年，我开发了一款微信排版编辑器 MDX Editor。它可以自定义组件、样式，生成二维码，代码 Diff 高亮，并支持导出 Markdown 和 PDF 等功
images: https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/213c0d296112436cae85c4c9c88d6f59~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

## 前言

大家好，我是小马。

去年，我开发了一款微信排版编辑器 MDX Editor。它可以自定义组件、样式，生成二维码，代码 Diff 高亮，并支持导出 Markdown 和 PDF 等功能。然而，作为一个微信排版编辑器，它的受众面比较有限，并不适用于每个人。因此，我基于该编辑器开发了 MDX Editor 桌面版，它支持 Mac、Windows 和 Linux，并且非常轻量，整个应用的大小只有 7M。现在，MDX Editor 桌面版已经成为我的创作工具。如果你对它感兴趣，可以在文末获取。

## 演示

<Video src="//player.bilibili.com/player.html?aid=315719909&bvid=BV1fP411C7YC&cid=1190726045&page=1" />

## 技术选型

开发 MDX Editor 桌面 App，我使用了如下核心技术栈:

- React (Next.js)

- Tauri —— 构建跨平台桌面应用的开发框架

- Tailwind CSS —— 原子类样式框架，支持深色皮肤

- Ant Design v5 —— 使用"Tree"组件管理文档树

## 功能与实现

### 1. MDX 自定义组件

MDX 结合了 Markdown 和 JSX 的优点，它让你可以在 Markdown 文档中直接使用 React 组件，构建复杂的交互式文档。如果你熟悉 React，你可以在 "Config" 标签页中自定义你的组件；如果你不是一个程序员，你也可以基于现有模板进行创作。例如，模板中的 "Gallery" 组件实际上就是一个 "flex" 布局。

**代码**

```jsx
function Gallery({ children }) {
  return <div className="gallery flex">{children}</div>
}
```

![文档写作](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c6958e9a8ae4fb48ded70e24b40e890~tplv-k3u1fbpfcp-zoom-1.image)

![预览效果](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdebc5184753460684c755a106f3f6bc~tplv-k3u1fbpfcp-zoom-1.image)

### 2. 深色皮肤

对于笔记软件来说，深色皮肤已经成为一个不可或缺的部分。MDX Editor 使用 `Tailwind CSS` 实现了深色皮肤。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61bac318e79d4e698c96b98424625590~tplv-k3u1fbpfcp-zoom-1.image)

### 3. 多主题

编辑器内置了 10+个文档主题和代码主题，你可以点击右上方的设置按钮进行切换。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c26b16c40b9a4a6ebf8847e25f1c1dcd~tplv-k3u1fbpfcp-zoom-1.image)

### 4. 本地文件管理

桌面 App 还支持管理本地文件。你可以选择一个目录，或者将你的文档工作目录拖入编辑器，便能够实时地在编辑器中管理文档。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/830e28ae574e4a44bd53d03654b8f099~tplv-k3u1fbpfcp-zoom-1.image)

当我在开发这个功能之前，我曾担心自己不熟悉 Rust，无法完成这个功能。但是，熟悉了 Tauri 文档之后，我发现其实很简单。Tauri 提供了文件操作的 API，使得我们不需要编写 Rust 代码，只需要调用 Tauri API 就能完成文件管理。

```js
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'

// 读取路径为 `$APPCONFIG/app.conf` 的文本文件

const contents = await readTextFile('app.conf', { dir: BaseDirectory.AppConfig })
```

文档目录树采用了 Ant Design 的 Tree 组件实现，通过自定义样式使其与整体皮肤风格保持一致，这大大减少了编码工作量。

### 5. 文档格式化

在文档写作的过程中，格式往往会打断你的创作思路。虽然 Markdown 已经完全舍弃了格式操作，但有时你仍然需要注意中英文之间的空格、段落之间的空行等细节。MDX Editor 使用了 [prettier](https://prettier.io/ 'prettier') 来格式化文档，只需按下 `command+s` 就能自动格式化文档。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/333d527b57194ebda5d246e15cc54ab1~tplv-k3u1fbpfcp-zoom-1.image)

## 最后

如果你对这个编辑器感兴趣，可以在 [Github](https://github.com/maqi1520/mdx-editor 'Github') 下载桌面版体验。如果你对实现过程感兴趣，也可以直接查看源码。如果您有任何好的建议，可以在上面提出 Issues，或者关注微信公众号 "JS 酷" 并留言反馈。
