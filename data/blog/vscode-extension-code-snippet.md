---
title: '一起来写 VS Code 插件:为你的团队提供常用代码片段'
date: '2021/11/14'
lastmod: '2021/11/14'
tags: [Visual Studio Code, 前端]
draft: false
summary: 'VS Code 是前端开发者最佳的开发工具，你在开发中是否疲倦了从一个文件拷贝来新建一个文件呢？那么如何发布一个 VS Code 插件？'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2487fd3ca81e43c4af9687d9d430cf30~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

VS Code 是前端开发者最佳的开发工具，你在开发中是否疲倦了从一个文件拷贝来新建一个文件呢？或者在你的团队内部是否有一些内部组件库，比如 Ant Design、 React hooks 等组件库，团队内部伴随开发的也一直打开组件相关文档？

其实我们可以开发一些常用的代码片段（Snippets）供团队内部使用。当输入前缀的时候就会触发智能提示。

![preview.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53d38179ba45463892c9ae32bf80c8ae~tplv-k3u1fbpfcp-watermark.image?)

## 推荐

首先推荐几个前端常用 Snippets 插件

- [ES7 React/Redux/React-Native/JS snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) React 开发者常用

- [antd-snippets](https://marketplace.visualstudio.com/items?itemName=bang.antd-snippets)

- [vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) vue 开发者推荐, 语法高亮，智能提示，emmet，错误提示，格式化，自动补全，debugger。VS Code 官方钦定 Vue 插件，Vue 开发者必备。

- [Vue 3 Snippets](https://marketplace.visualstudio.com/items?itemName=hollowtree.vue-snippets)

- [element-ui-snippets](https://marketplace.visualstudio.com/items?itemName=SS.element-ui-snippets)

一般常用的组件库在 VS Code 搜索就会得到。

最近 VS Code 发布了网页版 https://vscode.dev/ 当时上面的 snippets 在网页版中往往不支持，其实是上面的这些插件包含了其他一些非代码提示的功能，如果是纯 snippets 在网页版也是支持的。

## 开发

接下来就要开发团队内部 VS Code 插件了，打开 VS Code API 的[官网](https://code.visualstudio.com/api/get-started/your-first-extension)， 引入我们眼帘的是

```bash
npm install -g yo generator-code
```

首先全局安装脚手架，安装完成后，在命令行中输入

```bash
yo code
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f406bd64cd284be5b73179e280c1519c~tplv-k3u1fbpfcp-watermark.image?)

选择 `New Code Snippets`

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4003873c2ac74f0aaa47f68c36626d22~tplv-k3u1fbpfcp-watermark.image?)

输入一些基础信息后项目就创建成功了。

## 创建代码片段

有一个网站可以帮助我们快速的创建 code snippet
https://snippet-generator.app/

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/829b14d936c54543b7e3e13aa2fd252c~tplv-k3u1fbpfcp-watermark.image?)

左边输入代码，右侧就会生成 snippet 模板，拷贝到项目中的 `snippets.code-snippets` 文件下的 JSON 对象中

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8afa7f578e84b0b8c27adc19af2e85b~tplv-k3u1fbpfcp-watermark.image?)

其他 hooks 可以继续添加到 JSON 对象中，

如果想在让 typescript javascriptreact 也支持,可以在 package.json 中的 contributes 字段指定 4 份 snippets；

```json
"snippets": [
      {
        "language": "javascript",
        "path": "./snippets/snippets.json"
      },
      {
        "language": "javascriptreact",
        "path": "./snippets/snippets.json"
      },
      {
        "language": "typescript",
        "path": "./snippets/snippets.json"
      },
      {
        "language": "typescriptreact",
        "path": "./snippets/snippets.json"
      }
    ]
```

点击调试就可以在本地调试了

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5eb8613782964e16848c32b1b97206a9~tplv-k3u1fbpfcp-watermark.image?)

到此已经开发结束，如果不发布的话可以把 snippets 直接指定到本地目录下，打开 user snippets 配置面版，将 json 拷贝进去 就可以在 vscode 中使用了，也可以在网页版 https://vscode.dev/ 使用

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a3737dcc81149e5bd28450e4c41bb8e~tplv-k3u1fbpfcp-watermark.image?)

## 发布

1.  第一步先安装 vsce

```bash
npm install vsce -g
```

2.  第二步创建账号

首先访问  [login.live.com/](https://login.live.com/)  登录你的 Microsoft 账号，没有的先注册一个，然后访问： [aka.ms/SignupAzure…](https://aka.ms/SignupAzureDevOps) ，如果你从来没有使用过 Azure，那么就要先创建一个 Azure DevOps 组织，默认会创建一个以邮箱前缀为名的组织。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdc4f4d785b346349fcaeb42f75f499c~tplv-k3u1fbpfcp-watermark.image?)

3.  第三步进入组织创建令牌

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b926272cb0e48768a32c82d5af3b250~tplv-k3u1fbpfcp-watermark.image?)

点击右上角的用户设置，点击创建新的个人访问令牌

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fffc88c4a36544f2be3656c7793645ee~tplv-k3u1fbpfcp-watermark.image?)

**注意** 这里的 organizations 必须要选择  `all accessible organizations`，Scopes 要选择  `full access`，否则后面发布会失败。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69e9ead20a0147539c367aeae3ce0c6c~tplv-k3u1fbpfcp-watermark.image?)

**创建 token 成功后你需要本地记下来，因为网站是不会帮你保存的！！！**

4. 第四步 创建一个发布者

发布者是 visualstudio 代码市场的扩展的唯一身份标识。每个插件都需要在 `package.json` 文件中指定一个 publisher 字段。

你可以通过 visualstudio 插件市场[发布者管理](https://marketplace.visualstudio.com/manage)页面创建一个新发布者，
然后使用 `vsce login <publisher name>` , 输入刚才的 token，登陆成功。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2569d53e3e74124a809c1fdd0e616e0~tplv-k3u1fbpfcp-watermark.image?)

5.  第五步发布插件

```
vsce publish
```

发布成功后可能需要一两分钟，才可以在 VS Code 中搜索到，可以直接通过 url 访问

`https://marketplace.visualstudio.com/items?itemName=<publisher name>.<extension name>`

也可以使用以下命令 **取消发布**

```
vsce unpublish (publisher name).(extension name)
```

## 最后

本文对于开发者来说没什么技术难度，主要从一个 code Snippets 的角度出发来帮助团队，从而提高效率，主要是熟悉一下发布一个 VS Code 插件的流程，后续我会从一个实例的角度介绍下如何开发一个 VS Code 插件。

希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
