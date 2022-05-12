---
title: '实现一个 Code Pen：（三）10 行代码实现代码格式化'
date: '2022/5/12'
lastmod: '2022/5/12'
tags: [JavaScript, React.js]
draft: false
summary: '在上文中，我们使用 monaco-editor 结合 Next.js，打造了编辑器的功能，在本文中，我们将继续优化 monaco-editor， 使它拥有代码格式化的功能。'
images: []
authors: ['default']
layout: PostLayout
---

在上文中，我们使用 monaco-editor 结合 Next.js，打造了编辑器的功能，在本文中，我们将继续优化 monaco-editor， 使它拥有代码格式化的功能。

## prettier 在浏览器使用

关于代码格式化，被人熟悉的是 prettier，在前端工程中，为了保证团队成员提交代码的格式一致，会先安装 `prettier` 和 `husky`，使用 Git hooks 函数，在代码提交之前把代码格式化，此时的 prettier 是 nodejs 版本，是一个可执行的 cli 工具， 当然 prettier 也有 Browser 版本，也就是 `prettier/standalone`， 现代浏览器都支持 ES modules， 通过下面这几行代码就可以实现浏览器端代码格式化了。

```html
<script type="module">
  import prettier from 'https://unpkg.com/prettier@2.6.2/esm/standalone.mjs'
  import parserBabel from 'https://unpkg.com/prettier@2.6.2/esm/parser-babel.mjs'
  import parserHtml from 'https://unpkg.com/prettier@2.6.2/esm/parser-html.mjs'

  function formatCode(code) {
    return prettier.format(code, {
      parser: 'babel',
      plugins: [parserBabel, parserHtml],
    })
  }

  console.log(formatCode('const html=/* HTML */ `<DIV> </DIV>`'))
  // Output: const html = /* HTML */ `<div></div>`;
</script>
```

prettier 使用方法的核心就是调用不同的 parser，去解析不同的文本，在我当前的开发的 Code Pen 场景中，使用到了以下几个 parser:

- babel: 处理 js
- html: 处理 html
- postcss: 用来处理 css, less, scss
- typescript: 处理 ts

除了 ES modules 方式， Prettier 浏览器版本，还支持 amd, commonjs 的用法，使用非常方便。详情用法可以查看[官方文档](https://prettier.io/docs/en/browser.html)。

## 集成到 monaco-editor

monaco-editor 本身也提供了格式化的命令，可以通过右键菜单或者快捷键`⇧ + ⌥ + F`来对代码进行格式化，目前自带的格式化工具不如 Prettier 的标准，因此我们可以覆盖原先的格式化指令， 主要通过[monaco.languages.registerDocumentFormattingEditProvider](https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#registerDocumentFormattingEditProvider) 来实现。

```js
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const modelToPaser={
  html
  css,
  less,
  sass,
  typescript,
  javascript:'babel'
}
export function registerDocumentFormattingEditProviders() {
  const disposables = [];

  const formattingEditProvider = {
    async provideDocumentFormattingEdits(model, _options, _token) {
      const pretty=formatCode( model.getValue(), modelToPaser[model.getLanguageId()])
      if (canceled || error) return [];
      return [
        {
          range: model.getFullModelRange(),
          text: pretty,
        },
      ];
    },
  };

 ['html','css','less','scss','javascript','typescript'].forEach((id)=>{
  disposables.push(
    monaco.languages.registerDocumentFormattingEditProvider(
      id,
      formattingEditProvider
    )
  );
 })

  return {
    dispose() {
      disposables.forEach((disposable) => disposable.dispose());
    },
  };
}
```

上述代码中 通过 `model.getValue()` 获得当前编辑器中的文本，通过 `model.getLanguageId()` 获得当前编辑器的编程语言，每一种语言都有不同的解析器，需要与`Prettier`的 paser 对应，比如：JavaScript 语言对应的就是`babel` paser。

至此，整个 Prettier 的流程便已完成，为了提高解析性能，可以将格式化的代码放入一个 web worker 中，完整的 web worker 代码如下：

```js
import prettier from 'prettier/standalone'

const options = {
  html: async () => ({
    parser: 'html',
    plugins: [await import('prettier/parser-html')],
    printWidth: 100,
  }),
  typescript: async () => ({
    parser: 'typescript',
    plugins: [await import('prettier/parser-typescript')],
    printWidth: 100,
  }),
  css: async () => ({
    parser: 'css',
    plugins: [await import('prettier/parser-postcss')],
    printWidth: 100,
  }),
  less: async () => ({
    parser: 'less',
    plugins: [await import('prettier/parser-postcss')],
    printWidth: 100,
  }),
  scss: async () => ({
    parser: 'scss',
    plugins: [await import('prettier/parser-postcss')],
    printWidth: 100,
  }),
  javascript: async () => ({
    parser: 'babel',
    plugins: [await import('prettier/parser-babel')],
    printWidth: 100,
    semi: false,
    singleQuote: true,
  }),
}

let current

addEventListener('message', async (event) => {
  if (event.data._current) {
    current = event.data._current
    return
  }

  function respond(data) {
    setTimeout(() => {
      if (event.data._id === current) {
        postMessage({ _id: event.data._id, ...data })
      } else {
        postMessage({ _id: event.data._id, canceled: true })
      }
    }, 0)
  }

  const opts = await options[event.data.language]()

  try {
    respond({
      pretty: prettier.format(event.data.text, opts),
    })
  } catch (error) {
    respond({ error })
  }
})
```

## 覆盖快捷键

相比于 `cmd + s` 时，执行自定义的函数，不如直接覆盖掉自带的格式化指令，在 `cmd + s` 时直接执行指令来完成格式化来的优雅。执行上面的代码就已经覆盖格式化的指令，接下来，只需要绑定快捷键就可以了。

```js
function setupKeybindings(editor) {
  let formatCommandId = 'editor.action.formatDocument'
  const { handler, when } = CommandsRegistry.getCommand(formatCommandId)
  editor._standaloneKeybindingService.addDynamicKeybinding(
    formatCommandId,
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
    handler,
    when
  )
}
```

通过 `CommandsRegistry.getCommand(formatCommandId)` 获得 action 的方法，在通过 `_standaloneKeybindingService.addDynamicKeybinding` 绑定快捷键。然后在 react 组件初始化的时候绑定快捷键就可以了

```js
useEffect(() => {
  if (divEl.current) {
    editor.current = monaco.editor.create(divEl.current, {
      minimap: { enabled: false },
      theme: 'vs-dark',
    })
  }

  setupKeybindings(editor.current)

  return () => {
    editor.current.dispose()
  }
}, [])
```

至此我们编辑器快捷键格式化的逻辑就完成了。

![格式化效果](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ce0535e9fc24a7aaa6958bdfc03061d~tplv-k3u1fbpfcp-watermark.image?)

预览地址：https://code.runjs.cool/pen/1

代码仓库：https://github.com/maqi1520/next-code-pen

## 小结

- 使用`prettier/standalone`在浏览器代码格式化；
- `monaco.languages.registerDocumentFormattingEditProvider` 修改 monaco 默认的格式化代码方法；
- `editor._standaloneKeybindingService.addDynamicKeybinding` 绑定快捷键；
- 使用 web worker 优化格式化代码的性能；

关于 Monaco Editor 的配置请参考[官网](https://microsoft.github.io/monaco-editor/api/index.html)和[Github](https://github.com/microsoft/monaco-editor)

接下来将介绍代码在线编译的实现。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/)
