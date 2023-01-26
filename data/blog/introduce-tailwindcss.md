---
title: 用 TailwindCSS 打造美好祝福：给大家送上新年祝福的 demo
date: 2023/1/22 19:40:16
lastmod: 2023/1/26 11:42:08
tags: [tailwindcss]
draft: false
summary: 前几天，群里有有伙伴问，在Next.js中，该使用哪个UI框架？我强烈推荐 tailwindcss， 因为你不再需要写 CSS 代码了，这 2 天还录制了一个视频，包括录屏、录音、剪辑、动画等，花费蛮多时间，在视频最后，借一个 demo 给大家拜年了，祝您在新的一年中，事业蒸蒸日上，幸福美满，健康长久。
images: https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42b85073f04a4eefa5281cf1c737cbae~tplv-k3u1fbpfcp-watermark.image?
authors: ['default']
layout: PostLayout
---

前几天，群里有有伙伴问，在 Next.js 中，该使用哪个 UI 框架？我强烈推荐 tailwindcss， 因为你不再需要写 CSS 代码了，这 2 天还录制了一个视频，包括录屏、录音、剪辑、动画等，花费蛮多时间，在视频最后，借一个 demo 给大家拜年了，祝您在新的一年中，事业蒸蒸日上，幸福美满，健康长久。

<Video src="//player.bilibili.com/player.html?aid=350646988&bvid=BV1yR4y1a7by&cid=976263286&page=1&high_quality=1&danmaku=0" />

2022 年 Tailwind css 可以说是 CSS 框架中一批黑马，越来越多的开发者开始使用 Tailwind css，在 stateofcss.com 上显示，在满意度和关注度和认知度方面持续上升，在使用度方面仅次于 bootstrap， 当然国内开发者加入这个调查的较少，那么你在项目中使用过   Tailwind css 吗？

## 什么是 Tailwind css ？

官网的描述是：A utility-first CSS framework，一个实用优先的 CSS 框架，可以理解为是一个 css 原子类框架， 我们不必再写 CSS，而是全部使用原子类代替。

比如 flex 、pt-4、text-center，原子类这个东西早就有了，那为什么到现在才流行呢？

## 我们一起来看看   Tailwind css 的优点

1.  基于约束

Tailwind css 基于 api 约束，让我们在颜色，间距，版式，阴影等使用上有一定约束，而不是使用任意颜色值样式，这会让我们的网页更规范性。

2.  书写任意样式

Tailwind css 虽然基于约束，但可以创建任意样式，即使你使用相同的 html ，也可以创建丰富的界面

3.  代码量最少

Tailwind css 在构建时会自动删除所有未使用的 CSS，这意味着最终生成的 CSS 代码可能是最小的。事实上，大多数 Tailwind 项目向客户端发送的 CSS 少于 10kB。

4.  响应式设计

Tailwind css 采用移动优先的策略，我们不必再写媒体查询 css 代码，而是可以在任意原子类前面加上 sm、md、lg 等这些前缀，让我们的网站轻松实现响应式设计。

5.  支持 hover 和 focus  状态

鼠标悬停和聚焦依然可以实现，只需要在原子类前面加上 `hover:` `focus:` 等前缀，甚至可以使用 group，实现子元素的悬停和聚焦效果

6.  组件化设计

别在担心 html 中相同代码的复制粘贴，现代 JavaScript 框架都采用了组件化设计思维，相同的代码只需要创建一个组件，然后通过循环遍历实现。

有时候也担心 class 名称过长，也可以使用 @apply 指令将原子类复制到 css 样式表中

7.  暗黑模式支持

不想让人在凌晨 2 点打开手机感觉亮瞎眼？没错，你的网站需要支持暗黑模式，我们只需要在原子类样式前面加上 dark 前缀，就可以实现网站适配。

8.  易于扩展调整

我们可以在 `tailwind.config.js` 配置文件中配置颜色、尺寸、以及其他样式、配置插件等。

比如例示中配置了 primary 和 secondary 的颜色变量，那么就可以支持 `bg-primary-50` 样式了。

因此对于网站，要支持换肤，便是轻而易举。只需要修改 `tailwind.config.js` 就可以

9.  前沿的 css 特性支持

Tailwind 还支持 Grid 布局，transform 旋转，缩放，平移、gradient 渐变等；编辑器支持 那么，这么多类名，如何让开发者都如果记得住？别担心，官方提供了 vscode 扩展支持，只需要安装这个插件，就可以在编辑器中会自动补全和提示。

好了，以上就是本文的全部内容，没用过的朋友，赶紧去试试吧
