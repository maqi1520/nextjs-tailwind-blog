---
title: '使用 react-pdf 打造在线简历生成器'
date: '2022/2/21'
lastmod: '2022/2/21'
tags: [React.js]
draft: false
summary: 'React PDF 是一个使用 React 创建 PDF 文件的工具，支持在浏览器、移动设备和服务器上创建PDF文件。'
images:
  [
    'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7735eab33c2745aa94520ca6fa4fac7b~tplv-k3u1fbpfcp-watermark.image?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

PDF 格式是 30 年前开发的文件格式，并且是使用最广泛的文件格式之一，我们最喜欢使用它作为简历、合同、发票、电子书等文件的格式，最主要的原因是文档格式可以兼容多种设备和应用程序，而且内容 100%保持相同的格式。

## React-PDF 简介

React PDF 是一个使用 React 创建 PDF 文件的工具，支持在浏览器、移动设备和服务器上创建 PDF 文件。

可以用它们轻松地将内容呈现到文档中，我们可以使用 CSS 属性进行样式设置，使用 flexbox 进行布局，它支持渲染文本、图像、 svg 等等，详情可以参考[官网](https://react-pdf.org/)

## 程序实现

今天我将使用 React-pdf 和 next.js 来构建一个在线简历生成器，先一起来看下效果

![image-20220221172531731.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/70a405e3a13141c0999772f1aaf766f9~tplv-k3u1fbpfcp-watermark.image?)

在线地址：https://cv.runjs.cool/

### 初始化项目

```shell
yarn create next-app --example with-ant-design next-resume
cd next-resume
yarn add @react-pdf/renderer
```

React-pdf 渲染需要一些额外的依赖项和 webpack5 配置。

```shell
yarn add process browserify-zlib stream-browserify util buffer assert
```

这一步骤是因为 React-pdf 构建在 PDFKit 的基础之上，在使用浏览器时需要使用两个 node.js API polyfill。
而 webpack 5 不再包括自动引入 nodejs `polyfill` ，我们必须选择进入所有我们想要的 `polyfill`。为了做到这一点，我们必须为我们的项目添加一些依赖项:

在根目录下创建一个 `next.config.js`

```javascript
module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
      process: require.resolve('process/browser'),
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
      asset: require.resolve('assert'),
    }
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    )
    return config
  },
}
```

### 实现逻辑

新建在 `App.js` 将用户输入实时绑定到 state 中，然后时时渲染预览页面

```javascript
import Preview from './component/Preview'
import React, { useState } from 'react'
function App() {
  const [profile, setProfile] = useState({
    name: '狂奔滴小马',
    about: '分享 Javascript 热门\n框架，探索 web 极致\n优化体验。',
    email: 'maqi1520@qq.com',
    avatar:
      'https://p6-passport.byteacctimg.com/img/user-avatar/585e1491713363bc8f67d06c485e8260~300x300.image',
  })

  const handleChange = (name, value) => {
    setProfile({ ...profile, [name]: value })
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
      }}
    >
      <div style={{ width: '50%' }}>
        <div>
          <label>姓名</label>
          <input
            name="name"
            defaultValue={profile.name}
            onChange={(e) => {
              handleChange(e.target.name, e.target.value)
            }}
          />
        </div>
        <div>
          <label>头像地址</label>
          <input
            name="avatar"
            defaultValue={profile.avatar}
            onChange={(e) => {
              handleChange(e.target.name, e.target.value)
            }}
          />
        </div>
        <div>
          <label>简介</label>
          <input
            name="about"
            defaultValue={profile.about}
            onChange={(e) => {
              handleChange(e.target.name, e.target.value)
            }}
          />
        </div>
        <div>
          <label>email</label>
          <input
            name="email"
            defaultValue={profile.email}
            onChange={(e) => {
              handleChange(e.target.name, e.target.value)
            }}
          />
        </div>
      </div>
      <Preview profile={profile} />
    </div>
  )
}

export default App
```

`Preview.js` 是页面的右侧部分，并嵌入我们将要创建的 PDF 文档。

另外我们还有 `PDFDownloadLink`，它可以用来下载 pdf 文件。

```javascript
import React from 'react'
import { Document, Page, PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import LeftSection from './LeftSection'
import RightSection from './RightSection'
import styles from '../styles'

const Preview = ({ profile }) => {
  return (
    <div style={{ flexGrow: 1 }}>
      <PDFViewer
        showToolbar={false}
        style={{
          width: '100%',
          height: '95%',
        }}
      >
        <Template profile={profile} />
      </PDFViewer>
      <PDFDownloadLink document={<Template profile={profile} />} fileName="somename.pdf">
        {({ loading }) => (loading ? 'Loading document...' : 'Download now!')}
      </PDFDownloadLink>
    </div>
  )
}
// 创建文档组件
const Template = ({ profile }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <LeftSection profile={profile} />
        <RightSection about={profile.about} />
      </Page>
    </Document>
  )
}

export default Preview
```

我们可以直接设置 PDF 为 A4 纸尺寸。

```js
import { StyleSheet } from '@react-pdf/renderer'

export default StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'row',
  },
  section_right: {
    margin: 10,
    padding: 10,
    paddingTop: 20,
    width: '75%',
  },
  section_left: {
    width: '25%',
    height: '100%',
    backgroundColor: '#084c41',
  },
  profile_container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20',
    marginBottom: '20px',
    height: '150',
  },
  name_text: {
    paddingTop: '10px',
    paddingBottom: '5px',
    fontSize: '14px',
    fontWeight: '900',
    color: 'white',
  },
})
```

通过 StyleSheet.create 创建 JavaScript 样式表

`LeftSection.js` 代码展示

```javascript
import { View, Text, Image } from '@react-pdf/renderer'
import styles from '../styles'

export const Profile = ({ profile }) => {
  return (
    <View style={styles.profile_container}>
      <Image style={styles.profile_img} src={profile.avatar} />

      <View
        style={{
          justifyContent: 'center',
        }}
      >
        <Text style={styles.name_text}>{profile.name}</Text>
      </View>
      <Text style={styles.profession_text}>{profile.about}</Text>
    </View>
  )
}

const LeftSection = ({ profile }) => {
  return (
    <View style={styles.section_left}>
      <Profile profile={profile} />
    </View>
  )
}

export default LeftSection
```

也可以直接写内联样式控制 `FDF` 内的样式。但是不支持 `float` 浮动属性，具体大家可以看官网

## 遇到问题

本以为这样就可以完成，没想到还有一个巨坑，不支持中文，中文在 pdf 中会显示乱码， 通过 [issue](https://github.com/diegomura/react-pdf/issues/267) 找到了答案

```js
import { StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Alibaba-PuHuiTi-Light",
  src: "/Alibaba-PuHuiTi-Light.ttf",
});

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Alibaba-PuHuiTi-Light",
    flexDirection: "row",
    display: "flex",
    ...
  },
})
```

然后就可以显示中文字体了。这边我下载了阿里巴巴普惠体。

## 重构

以上是一个简易版的实现，通过上面的代码示例，你应该至少看懂了原理，为了让整个简历数据丰富，我使用了 antd 来实现丰富的表单列表。使用 `react context `来管理我们的数据。下面展示下目录结构：

```bash
├── components
│   ├── app
│   │   └── index.tsx
│   ├── editor
│   │   ├── FormCreator.tsx
│   │   ├── conifg.js
│   │   └── index.tsx
│   ├── icon
│   │   └── index.tsx
│   └── preview
│       ├── avatar.tsx
│       ├── awardList.tsx
│       ├── educationList.tsx
│       ├── index.tsx
│       ├── profile.tsx
│       ├── projectList.tsx
│       ├── skillList.tsx
│       ├── style.ts
│       └── workExpList.tsx
├── context
│   └── resumeContext.ts
├── hooks
│   └── useResume
│       └── index.ts
├── pages
│   ├── _app.tsx
│   ├── api
│   │   └── hello.js
│   └── index.tsx
└── styles
    ├── logo.png
    └── globals.css
```

## 部署

最后我使用 vercel 部署并且绑定自定义域名

体验地址 https://cv.runjs.cool/

## 参考

> https://dev.to/przpiw/react-pdf-rendering-4g7b

> https://cv.devtool.tech/app

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
