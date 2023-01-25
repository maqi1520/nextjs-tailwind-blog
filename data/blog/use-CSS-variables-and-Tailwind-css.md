---
title: '使用 CSS variables 和Tailwind css实现主题换肤'
date: '2021/6/9'
lastmod: '2021/6/17'
tags: [CSS]
draft: false
summary: '最近在网上看到 Tailwind Labs的实现的[换肤视频]，决定使用 Tailwind css 实现博客列表主题换肤。'
images: []
authors: ['default']
layout: PostLayout
---

## 背景

在 2B 的项目中，常常有客户（甲方爸爸）需求，定制与他们企业相同的主题的网站；随着苹果暗黑模式的推出，换肤的需求在网站开发中越来越多，也越来越重要，最近在网上看到 Tailwind Labs 的实现的[换肤视频](https://www.youtube.com/watch?v=MAtaT8BZEAo)，决定实践一把。

## 实现博客列表

我们先使用 Tailwind css 实现一个博客列表

- 效果

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d9bd56a311b471da9ef9ecd441603d7~tplv-k3u1fbpfcp-watermark.image)

- html 代码

```html
<div class="min-h-screen bg-white">
  <ul class="space-y-10 p-10">
    <li>
      <a class="text-gray-600">
        <article
          class="group relative flex transform items-center transition-transform hover:-translate-x-2"
        >
          <div
            class="flex flex-grow flex-col space-y-4 rounded bg-gray-50 py-8 px-8 text-base shadow-md"
          >
            <div class="flex flex-row justify-between">
              <h3 class="text-xl font-bold text-gray-900">useEffect 完整指南</h3>
              <span>2020-06-08</span>
            </div>
            <p className="leading-8">
              你用Hooks写了一些组件，甚或写了一个小型应用。你可能很满意，使用它的API很舒服并且在这个过程中获得了一些小技巧。
            </p>
          </div>
        </article>
      </a>
    </li>
    <li>
      <a class="text-gray-600">
        <article
          class="group relative flex transform items-center transition-transform hover:-translate-x-2"
        >
          <div
            class="flex flex-grow flex-col space-y-4 rounded bg-gray-50 py-8 px-8 text-base shadow-md"
          >
            <div class="flex flex-row justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                使用 CSS variables 和Tailwind csss实现主题换肤
              </h3>
              <span>2020-06-08</span>
            </div>
            <p className="leading-8">根据Tailwind Labs的[换肤视频]，手动实践。</p>
          </div>
        </article>
      </a>
    </li>
  </ul>
</div>
```

## CSS variables

使用 CSS variables 是实现换肤最方便的方案，按传统的方案就得加入一些 css class 就可以实现，如：

```css
:root {
  --page-bg: #fff;
  --card-bg: #f9fafb; /* gray-50 */
  --title-color: #111827; /* gray-900 */
  --desc-color: #4b5563; /* gray-600 */
}

.theme-dark {
  --page-bg: #111827; /* gray-900 */
  --card-bg: #1f2937; /* gray-800 */
  --title-color: #f3f4f6; /* gray-100 */
  --desc-color: #e5e7eb; /* gray-200 */
}
.page__bg {
  background-color: var(--page-bg);
}
.post__card {
  background-color: var(--card-bg);
}
.post__title {
  color: var(--title-color);
}
.post__desc {
  color: var(--desc-color);
}
```

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa9dd771eb61470a88d345dd084a8c20~tplv-k3u1fbpfcp-watermark.image)

这样就可以实现深色皮肤了，如果想增加一套皮肤，只需增加一套颜色变量就可以了。

## 兼容性

CSS variables 只支持现代浏览器，但是许多客户还在使用 IE11，为了兼容 IE11 可以使用 postcss 插件[postcss-custom-properties](https://github.com/postcss/postcss-custom-properties)

例如下面 css：

```css
:root {
  --color: red;
}
h1 {
  color: var(--color);
}
```

经过 postcss 的处理，得到下面的 css，不支持的 css 属性， 浏览器会自动忽略。

```css
h1 {
  color: red;
  color: var(--color);
}
```

但是这个插件只对第一次编译的时候有用，动态换肤的时候就失效了，
我们可以使用 js polyfill 来修复这个问题,在 HTML 中引入下面代码就可以解决。

```html
<script>
  window.MSInputMethodContext &&
    document.documentMode &&
    document.write(
      '<script src="https://cdn.jsdelivr.net/gh/nuxodin/ie11CustomProperties@4.1.0/ie11CustomProperties.min.js"><\/script>'
    )
</script>
```

😅 但是这样写完全体现不出 Tailwind css 的优势，Tailwind 的思想是 Utility-First，写页面的时候不需要取繁琐的 class 名称了。

## Tailwind 配置

tailwind css 可以让用户在`tailwind.config.js`中配置一些自定义颜色，这样 css 中就增加了与之对应颜色的 class。

```js
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  theme: {
    extend: {
      colors: {
        amber: colors.amber,
        lime: colors.lime,
        rose: colors.rose,
        orange: colors.orange,
      },
    },
    backgroundColor: {
      //utilities like `bg-base` and `bg-primary`
      base: 'var(--color-base)',
      'off-base': 'var(--color-off-base)',
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      muted: 'var(--color-text-muted)',
    },
    textColor: {
      //like `text-base` and `text-primary`
      base: 'var(--color-text-base)',
      muted: 'var(--color-text-muted)',
      'muted-hover': 'var(--color-text-muted-hover)',
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
    },
  },
  variants: {},
  plugins: [],
}
```

在这里为了方便使用和记忆，我用来几个简单的变量名称来定义，背景和字体颜色，当然还有扩展其他样式如`borderColor`

然后在 css 中定义变量 theme 方法可以获取 tailwind 内置的颜色，想要使用颜色比配置在 colors 中。跟多颜色可以访问[customizing-colors](https://tailwindcss.com/docs/customizing-colors),当然

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  .theme-light {
    --color-base: theme('colors.white');
    --color-text-base: theme('colors.black');
    --color-off-base: theme('colors.gray.50');
    --color-text-muted: theme('colors.gray.600');
    --color-text-muted-hover: theme('colors.gray.500');
    --color-primary: theme('colors.blue.600');
    --color-secondary: theme('colors.blue.300');
  }

  .theme-dark {
    --color-base: theme('colors.gray.900');
    --color-text-base: theme('colors.gray.100');
    --color-off-base: theme('colors.gray.800');
    --color-text-muted: theme('colors.gray.300');
    --color-text-muted-hover: theme('colors.gray.200');
    --color-primary: theme('colors.blue.500');
    --color-secondary: theme('colors.blue.200');
  }
}
```

tailwind 中有个样式是`text-opacity-10` 设置了字体颜色，还可以设置透明度，查看源码发现样式是通过 rgba 实现的.

```css
.text-gray-900 {
  --tw-text-opacity: 1;
  color: rgba(17, 24, 39, var(--tw-text-opacity));
}
```

如想要支持这个透明度的样式，我们还需要将颜色转成 Rgb,`tailwind.config.js` 配置

```js
function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue) {
            return `rgba(var(${variableName}), ${opacityValue})`;
        }
        return `rgb(var(${variableName}))`;
    };
}

module.exports = {

   ...,

   theme: {
        // we want to extend the current colors instead of replacing them
        extend: {
         //like `bg-base` and `bg-primary`
            backgroundColor: {
                primary: withOpacity('--color-primary'),
                secondary: withOpacity('--color-secondary'),
                muted: withOpacity('--color-text-muted'),
            },
        //like `text-base` and `text-primary`
            textColor: {
                primary: withOpacity('--color-primary'),
                secondary: withOpacity('--color-secondary'),
            },
      }
}
```

css 中颜色定义

```css
.theme-dark {
  --color-base: 17, 24, 39; /* gray-900 */
  --color-text-base: 243, 244, 246; /* gray-100 */
  --color-off-base: 31, 41, 55; /* gray-800 */
  --color-text-muted: 229, 231, 235; /* gray-200 */
  --color-muted-offset: 209, 213, 219; /* gray-300 */
  --color-primary: 147, 197, 253; /* blue-300 */
  --color-secondary: 96, 165, 250; /* blue-400 */
}
```

## 最终效果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd81446d786448b89a25a17dff92f311~tplv-k3u1fbpfcp-watermark.image)

- [代码](https://play.tailwindcss.com/KDVQG5ULlM)

顺便提一下https://play.tailwindcss.com/ 必须点击 share 才会保存。😂 我在练习的时候也没保存，吃过一堑。

## 参考

- https://www.youtube.com/watch?v=MAtaT8BZEAo

- https://css-tricks.com/color-theming-with-css-custom-properties-and-tailwind/

- https://dev.to/austincrim/how-i-added-themes-to-my-website-using-tailwind-3ig3
