---
title: '开发一个在线代码对比工具'
date: '2022/8/8'
lastmod: '2022/8/8'
tags: [React.js]
draft: false
summary: '在开发过程中，我们经常需要用到代码对比，对比下代码是否一致，有哪些改动，方便我们可以查看问题，今天我们就来说实现下，其实很简单。'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e1c24c6606b4fa08b439f6fb6f8a1c2~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

在开发过程中，我们经常需要用到代码对比，对比下代码是否一致，有哪些改动，方便我们可以查看问题，今天我们就来说实现下，其实很简单，不需要后端，纯前端就可以实现。

## Monaco Editor

[Monaco Editor](https://microsoft.github.io/monaco-editor/ 'https://microsoft.github.io/monaco-editor/') 是 VS Code 中使用的开源代码编辑器， 拥有代码高亮和代码自动补全的功能，并且内置了一个 Diff Editor。

![官网 Diff editor](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdf6eca3d39e4e8e9f4d8f1f3d0bcbad~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

官网就有一个 Diff Editor 的演示，我们要开发的就是在这个基础之上，加上语言切换的功能，让这个 Diff Editor 拥有内置云语言的语法高亮。

`TypeScript, JavaScript, CSS, LESS, SCSS, JSON, HTML、XML, PHP, C#, C++, Razor, Markdown, Diff, Java, VB, CoffeeScript, Handlebars, Batch, Pug, F#, Lua, Powershell, Python, Ruby, SASS, R, Objective-C`

官网罗列了这些语言，但远不止于此。

## 马上掘金

使用 monaco-editor 创建一个简单的代码编辑器

使用 monaco-editor 创建一个简单的 Diff 编辑器

Monaco Editor 有 2 种加载方式，分别是 amd 和 esm，也就是 `Requirejs` 和 `ES Modules`。马上掘金中使用的是 `requirejs`。

## 技术栈选择

我准备把常用的工具做成一个工具网站，所以我选择使用 [next.js](https://nextjs.org/ 'https://nextjs.org/')，并且可以使用 [vercel](https://vercel.com/ 'https://vercel.com/') 免费持续部署。

关于 Monaco Editor 在 next.js 中的配置，之前有介绍过，大家可以看这篇文章 [《在 Next.js 中使用 Monaco Editor》](https://juejin.cn/post/7091177467498463239 'https://juejin.cn/post/7091177467498463239')。

## 实现 Diff Editor

```tsx
import type { editor as MonacoEditor } from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'

export default function TextDiffPage() {
  const editorContainer = useRef<HTMLDivElement | null>(null)
  const [language, setLanguage] = useState('text')
  const [inlineView, setInlineView] = useState(false)

  const [diffEditor, setDiffEditor] = useState<MonacoEditor.IStandaloneDiffEditor | null>(null)

  const createModel = (value: string, language: string, type: 'original' | 'modified') => {
    return monaco.editor.createModel(value, language)
  }

  const initEditor = async () => {
    const originalModel = createModel(`Hello World`, language, 'original')
    const modifiedModel = createModel(`Goodbye World`, language, 'modified')
    const editor = monaco.editor.createDiffEditor(editorContainer.current, {
      minimap: { enabled: false },
      theme: 'vs-dark',
      renderSideBySide: !inlineView,
      originalEditable: true,
    })
    editor.setModel({
      original: originalModel,
      modified: modifiedModel,
    })

    setDiffEditor(editor)
  }

  useEffect(() => {
    initEditor()
    return () => {
      if (diffEditor) diffEditor.dispose()
    }
  }, [])

  useEffect(() => {
    if (diffEditor) {
      diffEditor.updateOptions({
        renderSideBySide: !inlineView,
      })
    }
  }, [inlineView])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 flex-shrink-0 items-center space-x-5 border-b px-3 dark:border-neutral-800">
        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={inlineView}
            onChange={(e) => setInlineView(e.target.checked)}
          />
          <span>Inline diff</span>
        </label>
      </header>
      <div ref={editorContainer} className="h-full"></div>
    </div>
  )
}
```

上述代码很简单，可能有同学对 `createModel` 方法比较疑惑，为什么是 `Model` ？好比 Monaco Editor 是一个容器，容器可以设置 Model、切换 Model，比如 vscode 中，每打开一个文件就是一个 Model，文件切换就是切换 model，每个文件都有状态，比如光标位置，历史记录等，这些状态都存在 model 中，这样就不会因为文件切换而状态混淆。

```js
// typescript 禁用类型检查
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: false,
})

// typescript jsx 格式使用 React 语法解析
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  jsx: monaco.languages.typescript.JsxEmit.React,
})
```

对与一些 typescript 的语法校验我们可以选择关闭，jsx 不支持，可以设置为 react 语法支持。

## 最后

最后我的工具网站也开源了，包含一些前端常用工具，还可以在线刷面试题。

- [代码对比编辑器](https://www.runjs.cool/text-diff 'https://www.runjs.cool/text-diff')
- [GitHub 代码](https://github.com/maqi1520/runjs.cool 'https://github.com/maqi1520/runjs.cool')

如果对你有帮助，可以随手点个赞，这对我真的很重要。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
