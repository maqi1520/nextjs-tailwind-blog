---
title: '一起来写 VS Code 插件：实现一个翻译插件'
date: '2021/11/18'
lastmod: '2021/11/19'
tags: [Visual Studio Code, JavaScript]
draft: false
summary: '本文将通过实现一个翻译插件实例的方式来熟悉 VS Code 插件'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/179abac4c4a84e5783147d8195c9ff9b~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

上一篇介绍了用 `code snippets` 的方式开发一个插件，本文将通过实现一个翻译插件实例的方式来熟悉 VS Code 插件开发的常见功能和方法。当然大家可以前往 VS Code [官网 API](https://code.visualstudio.com/api/get-started/your-first-extension) 和官方 [GitHub 示例](https://github.com/microsoft/vscode-extension-samples) 查看和学习。

## 需求

对应程序员来说，翻译是个很常见的需求，尤其像我这样一个英语不好的程序员。

1. 可以直接替换翻译中文为变量名
2. 划词翻译，用于源码中的注释翻译

## 开发

### 初始化项目

执行脚手架，初始化项目

```
yo code
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4aab780d47ba4cf693643a788cb7bb59~tplv-k3u1fbpfcp-watermark.image?)

### hello world

创建好目录后，我们可以到入口文件找到入口文件 `./src/extension.ts` 中有个 `active`方法

```js
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "vscode-fanyi" is now active!')
  let disposable = vscode.commands.registerCommand('vscode-fanyi.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from vscode-fanyi!')
  })
  context.subscriptions.push(disposable)
}
```

active 方法是插件的入口方法，注册了一个 `vscode-fanyi.helloWorld` 方法

```json
"activationEvents": [
    "onCommand:vscode-fanyi.helloWorld"
],
"contributes": {
    "commands": [
        {
            "command": "vscode-fanyi.helloWorld",
            "title": "Hello World"
        }
    ]
}
```

然后在 `package.json`中配置了激活的事件，和执行事件的标题是 `Hello World`

按 `F5` 调试, 就会自动打开一个新的 vscode 扩展调试窗口，执行命令就可以看下如下效果。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d6ca407529d4b86856c3ee34286d91e~tplv-k3u1fbpfcp-watermark.image?)

### 翻译 API

翻译 api 我这边选择使用 [有道智能云](https://ai.youdao.com/)，当然大家可以选择其他翻译 API，选择它的原因是因为：注册就有 100 元的免费体验金，对于个人使用完全足够了。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68c022ba9cb6469a80309e3e79a72178~tplv-k3u1fbpfcp-watermark.image?)

首先创建一个应用，选择服务为自然语言翻译服务，接入方式为 API

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b8ca22c346d4480bbaf85a633b283131~tplv-k3u1fbpfcp-watermark.image?)

创建完成后可以获得应用 ID 和秘钥。

根据官方 JS demo 改成 Nodejs 版本

```js
import CryptoJS from 'crypto-js'
import axios from 'axios'
import querystring from 'querystring'

function truncate(q: string): string {
  var len = q.length
  if (len <= 20) {
    return q
  }
  return q.substring(0, 10) + len + q.substring(len - 10, len)
}

async function youdao(query: string) {
  var appKey = '3dde97353116e9bf'
  var key = 'xxxxxxxxxx' //注意：暴露appSecret，有被盗用造成损失的风险
  var salt = new Date().getTime()
  var curtime = Math.round(new Date().getTime() / 1000)
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  var from = 'AUTO'
  var to = 'AUTO'
  var str1 = appKey + truncate(query) + salt + curtime + key

  var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex)

  const res = await axios.post(
    'http://openapi.youdao.com/api',
    querystring.stringify({
      q: query,
      appKey,
      salt,
      from,
      to,
      sign,
      signType: 'v3',
      curtime,
    })
  )
  return res.data
}
```

首先要安装这 3 个包，其中 `crypto-js` 生成签名，`axios` Nodejs 请求库。

**安装**

```bash
yarn add crypto-js axios querystring
```

**查询结果**

如果正确一定存在 translation 中

```json
{
  "errorCode": "0",
  "query": "good", //查询正确时，一定存在
  "translation": [
    //查询正确时一定存在
    "好"
  ],
  "basic": {
    // 有道词典-基本词典,查词时才有
    "phonetic": "gʊd",
    "uk-phonetic": "gʊd", //英式音标
    "us-phonetic": "ɡʊd", //美式音标
    "uk-speech": "XXXX", //英式发音
    "us-speech": "XXXX", //美式发音
    "explains": ["好处", "好的", "好"]
  }
}
```

然后更改注册事件为异步返回

```js
let disposable = vscode.commands.registerCommand('vscode-fanyi.helloWorld', async () => {
  const res = await youdao('Congratulations, your extension "vscode-fanyi" is now active!')
  vscode.window.showInformationMessage(res.translation[0])
})
context.subscriptions.push(disposable)
```

来看下调试结果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bada9cb6cfda43fc898d6a78251c73ab~tplv-k3u1fbpfcp-watermark.image?)

### 划词替换

先获取选择文本, 然后翻译，最后翻译完成后替换原来文本。

```js
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-fanyi.replace', async () => {
      let editor = vscode.window.activeTextEditor
      if (!editor) {
        return // No open text editor
      }
      let selection = editor.selection
      let text = editor.document.getText(selection) //选择文本

      //有选中翻译选中的词
      if (text.length) {
        const res = await youdao(text)
        //vscode.window.showInformationMessage(res.translation[0]);
        editor.edit((builder) => {
          builder.replace(selection, res.translation[0]) //替换选中文本
        })
      }
    })
  )
}
```

跟新下 package.json 中的配置

```js
"activationEvents": [
    "onCommand:vscode-fanyi.replace"
 ],
 "contributes": {
    "commands": [
      {
        "command": "vscode-fanyi.replace",
        "title": "翻译"
      }
    ],
    "keybindings": [
      {
        "command": "vscode-fanyi.replace",
        "key": "ctrl+t",
        "mac": "cmd+t",
        "when": "editorTextFocus"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "when": "editorTextFocus",
          "command": "vscode-fanyi.replace",
          "group": "vscode-fanyi"
        }
      ]
    }
  },
```

新增一个右键菜单，绑定键盘快捷键.

下图是 vscode 官方菜单分组，将分组放在修改代码部分

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee427d51e50b4ef08ce24f90901a74c3~tplv-k3u1fbpfcp-watermark.image?)

一起来看下效果

![2021-11-18 15-46-25.2021-11-18 15_48_02.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87d3fab39246472ba33838488dca1189~tplv-k3u1fbpfcp-watermark.image?)

### 划词翻译

VS code 提供一个 provideHover 当鼠标移动在上面的时候就可以根据当前的单词做一些具体操作，但是这个翻译的场景下，单个单词不够，所以要根据选中的词来翻译。一起来看下代码吧。

```js
vscode.languages.registerHoverProvider('*', {
  async provideHover(document, position, token) {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return // No open text editor
    }

    const selection = editor.selection
    const text = document.getText(selection)

    const res = await youdao(text)

    const markdownString = new vscode.MarkdownString()

    markdownString.appendMarkdown(`#### 翻译 \n\n ${res.translation[0]} \n\n`)
    if (res.basic) {
      markdownString.appendMarkdown(
        `**美** ${res.basic['us-phonetic']}　　　　**英** ${res.basic['uk-phonetic']}　\n\n`
      )

      if (res.basic.explains) {
        res.basic.explains.forEach((w: string) => {
          markdownString.appendMarkdown(`${w} \n\n`)
        })
      }
    }
    if (res.web) {
      markdownString.appendMarkdown(`#### 网络释义 \n\n`)
      res.web.forEach((w: Word) => {
        markdownString.appendMarkdown(`**${w.key}:** ${String(w.value).toString()} \n\n`)
      })
    }
    markdownString.supportHtml = true
    markdownString.isTrusted = true

    return new vscode.Hover(markdownString)
  },
})
```

本来想 MarkdownString 如果支持 html 的话， 可以把翻译结果的音频也放到里面，奈何不支持，不知道有没有小伙伴做过类似的功能，可以在评论区交流。

最关键的一步,需要在 `package.json` 中更改 `activationEvents` 为 `"=onStartupFinished`，这一点可以在[文档](https://code.visualstudio.com/api/references/activation-events)中找到.

> 此激活事件将被发出，并且相关扩展将在 VS 代码启动后的某个时间被激活。这类似于*激活事件，但不会降低 VS 代码启动的速度。当前，此事件在所有*激活的扩展完成激活后发出。

```
"activationEvents": [
    "onStartupFinished"
  ],
```

**效果**

![2021-11-18 18-32-22.2021-11-18 18_33_04.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d995e26a828461e967db756a7d7079a~tplv-k3u1fbpfcp-watermark.image?)

### 驼峰转换

如果是变量是驼峰命名，可能无法翻译，需要转换下成空格

```js
function changeWord(text: string): string {
  if (!text.includes(' ') && text.match(/[A-Z]/)) {
    const str = text.replace(/([A-Z])/g, ' $1')
    let value = str.substr(0, 1).toUpperCase() + str.substr(1)
    return value
  }
  return text
}
```

### 自定义配置

将有道 appKey 和 appSecret 改成用户扩展配置, 在下 `package.json` 中的配置 `contributes` 添加 `configuration`配置

```json
"configuration": {
		"title": "Vscode  fanyi",
		"type": "object",
		"properties": {
		  "vscodeFanyi.youdaoApiname": {
			"type": "string",
			"description": "youdao appKey"
		  },
		  "vscodeFanyi.youdaoApikey": {
			"type": "string",
			"description": "youdao appSecret"
		  },
		}
	}
```

就可以在扩展下方填入配置了

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e5f0f41d00f04e44b1c577ffd5271a06~tplv-k3u1fbpfcp-watermark.image?)

然后在代码中 获得配置，并传入到原先的翻译函数中就可以了

```js
const config = vscode.workspace.getConfiguration("vscodeFanyi");
const appKey = config.get("youdaoAppkey") as string;
const appSecret = config.get("youdaoAppSecret") as string;
```

## 发布

关于发布可以看我的上一篇 [一起来写 VS Code 插件:为你的团队提供常用代码片段](http://juejin.cn/post/7030250953215311908)

## 小结

本插件与 [comment-translate](https://marketplace.visualstudio.com/items?itemName=intellsmi.comment-translate) 对比

1. API 不同

   1. 本插件目前只支持有道，用完免费相当于是付费

   2. comment-translate 支持百度谷歌和必应，是免费 API

1. 实现方式不同

   1. 本插件是利用 provideHover 划词翻译，实现起来比较简单

   1. comment-translate 是 hover 翻译，使用 [Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide) 实现起来比较复杂

   最后附上[链接](https://marketplace.visualstudio.com/items?itemName=maqi1520.vscode-fanyi)和[github](https://github.com/maqi1520/vscode-fanyi.git)

vscode 使用范围在扩大，从 extensions market 市场上也可以发现，各种功能的插件基本都很齐全。本篇只介绍了其功能的冰山一角，同时 vscode extensions 开发门槛不高，欢迎大家尝试，或者将有意思的 extensions 推荐在评论区。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
