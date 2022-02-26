---
title: '一起来写 VS Code 插件：VS Code 版 CNode 已上线'
date: '2021/11/23'
lastmod: '2021/11/23'
tags: [前端, Visual Studio Code]
draft: false
summary: 'CNode 社区为国内最专业的 Node.js 开源技术社区，致力于 Node.js 的技术研究。本篇将通过实现 VS Code 版 CNode， 来带领大家一起熟悉 VSCode Webview。'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8445f5813cb041998924400c705fd6b3~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

本篇是 VS Code 插件开发实战系列第三篇，前面两篇是

1. [《一起来写 VS Code 插件：为你的团队提供常用代码片段》](https://juejin.cn/post/7030250953215311908)
1. [《一起来写 VS Code 插件：实现一个翻译插件》](https://juejin.cn/post/7031878482367873037)

**CNode**  社区为国内最专业的 Node.js 开源技术社区，致力于 Node.js 的技术研究。本篇将通过实现 VS Code 版 CNode， 来带领大家一起熟悉 VSCode Webview 强大的功能。在开始之前，我们先参考 [官网关于 webview](https://code.visualstudio.com/api/extension-guides/webview) 的介绍。Webview API 允许扩展在 visualstudio 代码中创建完全可定制的视图，可以将 webview 看作是 VS Code 中的 iframe。

我们可以通过网页将事件消息传递给我们的服务端(包括 NodeJS)， 服务端处理完后可以把消息数据传递给网页。因此我们能在 extensions 中开发出跟网页一样的内容，但实现远比网页更强大的功能。

## 效果

首先来看下实现的效果

![nn.gif.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a392349e6bf42b794853a2ec4c5c160~tplv-k3u1fbpfcp-watermark.image?)

主要分为 2 部分，左侧是主题列表，右侧是主题详情。

## 初始化项目

首先通过脚手架初始化一个 typescript + webpack 的工程

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de48d3e27a014f00b09f5a7449ae11f5~tplv-k3u1fbpfcp-watermark.image?)

## 配置左侧导航图标

```json
 "icon": "icon.png",
  "activationEvents": [
    "onView:vs-sidebar-view"
  ],
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "vs-sidebar-view",
          "title": "CNODE 社区",
          "icon": "media/cnode_icon_64.png"
        }
      ]
    },
    "views": {
      "vs-sidebar-view": [
        {
          "type": "webview",
          "id": "vs-sidebar-view",
          "name": "Topic 列表",
          "icon": "media/cnode_icon_64.png",
          "contextualTitle": "Topic 列表"
        }
      ]
    }
  },
  ...

```

views 是配置视图列表,activitybar 是定义下显示在侧边导航上的视图。

### 注册一个侧边栏

在 extension.ts 中注册一个 与 package.json 对应的 `vs-sidebar-view`侧边栏 ID

```js
import * as vscode from 'vscode'
import { SidebarProvider } from './SidebarProvider'

export function activate(context: vscode.ExtensionContext) {
  const sidebarPanel = new SidebarProvider(context.extensionUri)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vs-sidebar-view', sidebarPanel)
  )
}
```

### 实现侧边栏

```js
import * as vscode from "vscode";
import { getNonce } from "./getNonce";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // 在 webview 允许脚本
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "build", "static/js/main.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "build", "main.css")
    );

    // Use a nonce to 只允许特定脚本运行.
    const nonce = getNonce();

    return `<!DOCTYPE html>
		<html lang="en">
		<head>
		<meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="${styleMainUri}" rel="stylesheet">
                <script nonce="${nonce}">
                  const tsvscode = acquireVsCodeApi(); //内置函数，可以访问 VS Code API 对象
                  const apiBaseUrl = 'https://cnodejs.org/'
                </script>
                </head>
              <body>
                  <div id="root"></div>
                  <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
	</html>`;
  }
}
```

上述代码采用面向对象的方式实现一个 `SidebarProvider`类，根据 `vscode.WebviewViewProvider`，
其实实现所有的 `WebviewViewProvider` 都是是这段代码，其他代码都是相同的，因为关于 webview 中的 HTML 我们都可以使用 js 来生成，这不正是我们的单页面应用开发吗？

上述代码中， **Nonce**是一个在加密通信只能使用一次的数字。在认证协议中，它往往是一个随机或伪随机数，以避免重放攻击。Nonce 也用于流密码以确保安全。如果需要使用相同的密钥加密一个以上的消息，就需要 Nonce 来确保不同的消息与该密钥加密的密钥流不同。 所以我们直接拷贝[官方 demo](https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts) 中的代码。

```js
//  生成特定随机数
export function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
```

## 实现侧边视图

CNode 提供了允许跨域的 [API](https://cnodejs.org/api)，我们可以在 js 中直接调用，如果你也想开发类似的功能请在 HTTP headers 中加入

```
Access-Control-Allow-Origin: *
```

### 配置 webpack config

在原先 `webpack.config.js` 中加入打包 React 的没配置，webpack5 支持多份 config 配置。

```js
const viewConfig = {
  entry: './view/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'static/js/[name].js',
  },
  mode: 'production',
  plugins: [new miniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [miniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
}

module.exports = [extensionConfig, viewConfig]
```

然后启动调试的时候，webpack 就会自动打包了；

**注意** 这里的 `mode` 必须设置为 `production`，webpack `development` 模式会使用 `eval` 来执行代码，而 `eval` 在 VS Code webview 不允许执行。

### 配置 tailwindcss

为了方便,我这边使用了 tailwindcss，因为我可以使用 [tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography) 这个插件，帮我生成漂亮的文章类型排版。

```
yarn add tailwindcss @tailwindcss/typography autoprefixer
```

使用命令初始化 tailwindcss config

```
npx tailwindcss init
```

```js
module.exports = {
  mode: 'jit',
  purge: ['./view/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
```

mode `jit` 是及时编译模式 tailwindcss 2.1 版本加的，忽略掉我们不需要的 css 代码。

生成文章页面的样式

```css
.markdown-preview {
  @apply prose prose-lg max-w-full bg-white p-20;
}
```

### 使用 React 来实现主题列表

使用 react 实现一个列表的代码我这边就不叙述了，跟我们平常写业务没什么区别，最主要的是 **数据通信**，当我们点击主题列表，右边要打开一个新的 webview 页面

```jsx
const handleClick = (item: Topic) => {
  setCurrent(item.id)

  tsvscode.postMessage({ type: 'detail', value: item })
}
```

根据官方[例子](https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension)

![scripts-webview_to_extension.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf28024a81884adc91fd6620067f7459~tplv-k3u1fbpfcp-watermark.image?)

Webviews 还可以将消息传递回它们的扩展。这是通过在 webview 中的特殊 VS Code API 对象上使用 `postMessage` 函数来实现的。要访问 VS Code API 对象，就要在 webview 中调用 `acquireVsCodeApi`函数。

定义 TS 全局对象

```js
import * as _vscode from "vscode";

declare global {
  const tsvscode: {
    postMessage: ({ type: string, value: any }) => void;
    getState: () => any;
    setState: (state: any) => void;
  };
  const apiBaseUrl: string;
}
```

接着就可以在 `vs-sidebar-view` 接收数据了

```js
webviewView.webview.onDidReceiveMessage(async (data) => {
  switch (data.type) {
    case 'detail':
      createPreviewPanel(this._extensionUri, data.value)
      break

    default:
      break
  }
})
```

实收到数据后可以就可以打开一个预览页面了

## 预览页面实现

```js
function createPreviewPanel(topic: Topic) {
  // 创建一个新的 panel.
  const panel = vscode.window.createWebviewPanel(
    'cnode-preview',
    'CNODE 技术社区',
    column || vscode.ViewColumn.One,
    {
      // 在 webview 允许脚本
      enableScripts: true,

      // 限制 从 media 文件夹加载资源
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'build')],
    }
  )

  panel.webview.html = _getHtmlForWebview(panel.webview, topic)
}
```

可以使用 内置方法 `vscode.window.createWebviewPanel` 创建一个新的面板，并且接收主题数据。 `_getHtmlForWebview` 与 SidebarProvider 中的 `_getHtmlForWebview` 一致，返回 HTML 即可。

## 避免重复创建预览页

当然也可以通过 postMessage 传递属性

**extension 端**

```
panel.webview.postMessage({text: 'hello'});
```

**webview 端**

```
window.addEventListener('message', event => {
    const message = event.data;
    console.log('Webview接收到的消息：', message);
}
```

## 主题适配

VS Code 将主题分为三类，并在 body 元素中添加一个 class 来指示当前主题:

```css
body.vscode-light {
  color: black;
}

body.vscode-dark {
  color: white;
}

body.vscode-high-contrast {
  color: red;
}
```

Webviews 还可以使用 CSS 变量访问 VS Code [主题颜色](https://code.visualstudio.com/api/references/theme-color)。这些变量名以 vscode 作为前缀，并用-替换.。例如 editor.foreground 变为 var (--vscode-editor-foreground)。

查看可用主题变量的[主题颜色参考](https://code.visualstudio.com/api/references/theme-color)。还有一个[扩展](https://marketplace.visualstudio.com/items?itemName=connor4312.css-theme-completions)可以为变量提供智能建议。

## 调试

要调试 Webview 不能直接把 VSCode 的开发者工具打开，直接打开你只能看到一个`<webview></webview>`标签，看不到代码，要看代码需要按下`Ctrl+Shift+P`然后执行`打开Webview开发工具`，英文版应该是`Open Webview Developer Tools`：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3c22a746497f4ef28318f9fd04c5e82d~tplv-k3u1fbpfcp-watermark.image?)

从上图也可以看的 在 html 标签上注入了当前皮肤的 css 变量。

## 状态保持

与浏览器标签不一样的是，当 webview 移动到后台又再次显示时，webview 中的任何状态都将丢失。因为 webview 是基于 iframe 实现的。

解决此问题的最佳方法是使你的 webview 无状态，通过消息传递来保存 webview 的状态。

###  state

在 webview 的 js 中我们可以使用`vscode.getState()`和`vscode.setState()`方法来保存和恢复 JSON 可序列化状态对象。当 webview 被隐藏时，即使 webview 内容本身被破坏，这些状态仍然会保存。当然了，当 webview 被销毁时，状态将被销毁。

### 序列化

通过注册`WebviewPanelSerializer`可以实现在`VScode`重启后自动恢复你的`webview`，当然，序列化其实也是建立在`getState`和`setState`之上的。

注册方法：`vscode.window.registerWebviewPanelSerializer`

###  retainContextWhenHidden

对于具有非常复杂的 UI 或状态且无法快速保存和恢复的`webview`，我们可以直接使用`retainContextWhenHidden`选项。设置`retainContextWhenHidden: true`后即使 webview 被隐藏到后台其状态也不会丢失。

尽管`retainContextWhenHidden`很有吸引力，但它需要很高的内存开销，一般建议在实在没办法的时候才启用。

`getState`和`setState`是持久化的首选方式，因为它们的性能开销要比`retainContextWhenHidden`低得多。

## 发布

关于发布可以看我的上一篇 [一起来写 VS Code 插件:为你的团队提供常用代码片段](http://juejin.cn/post/7030250953215311908)

## 小结

本篇通过实现 VS Code 版 CNode 来帮我们熟悉 webview 的 api，当然还可以增加评论系统，创建主题，基于用户系统可以实现点赞收藏等。

开发更复杂的功能，只缺你的想象力。例如：

1.  [韭菜盒子，做最好用的股票和基金插件](https://zhuanlan.zhihu.com/p/166683895)

1.  [create-app 可视化 CLI 工具](https://marketplace.visualstudio.com/items?itemName=Thinker.create-app&ssr=false#overview)

**最后**

附上本插件的[下载地址](https://marketplace.visualstudio.com/items?itemName=maqi1520.CNODE)和[源码](https://github.com/maqi1520/vscode-extension-cnode)

同时 vscode extensions 开发门槛不高，欢迎大家尝试，或者将有意思的 extensions 推荐在评论区。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
