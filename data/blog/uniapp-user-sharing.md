---
title: 'Uniapp 实现全民分销功能'
date: '2022/6/25'
lastmod: '2022/6/25'
tags: [JavaScript, React.js, CSS]
draft: false
summary: '前段时间在掘金 app 多了一个推广中心，分享课程链接，若有其他用户从你分享的链接购买，你就可以获得佣金，本篇介绍下全民分销功能实现原理。'
images:
  [
    'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e0a790a69d442da8f04b3874084d0fc~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

前段时间在掘金 app 多了一个推广中心，分享课程链接，若有其他用户从你分享的链接购买，你就可以获得一笔佣金，我们称类似的功能叫全民分销，全民分销在互联网推广中很常见，比如腾讯云、阿里云等都有，只不过叫法不一样、腾讯云叫 SCP，阿里云叫推广云大使。笔者也通过类似的活动，也获得过一些收益，由于全民分销功能使用门槛较低、传播速度快、对于平台商家和用户都是零成本的，成了互联网中热门的推广功能，本篇介绍下全民分销功能实现原理。

![掘金推广中心](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/513ce7bc19fb42c6a24ad0160adb3750~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

## 流程图

![全民分销流程图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/511916aafb3a4746aa6c806a0dd47451~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

推广者（也就是老用户）生成唯一的推广链接或者二维码，新用户点击推广者链接记录推广者 ID，用户下单生成推广记录流水，当然还有另外一种方式，拉新获得奖励，比如拉新 3 人获得代金券等

## 表结构

比如有一张用户表

```ts
interface User {
  _id: string
  // 名称
  name: string
  // 头像
  avatar: string
  // weixin  唯一ID
  openid: string
  // 创建时间
  createTime: number
  // 积分
  integral: number
}
```

一张记录表

```ts
interface Record {
  _id: string
  // 获得积分描述
  name: string
  // 发放模式 1 已发放 0 未发放
  mode: number
  // 关联用户表
  userId: string
  // 创建时间
  createTime: number
  // 获得积分
  integral: number
}
```

积分用来描述用户收益，或者可以用积分来兑换奖励，这部分可以根据不同的活动有不同的实现方式。以上数据字段是简易版设计，实际可以根据活动情况增加字段。

## 分享的 3 种方式

### 复制链接

在 web app 中一般会使用复制链接的功能 在现代浏览器(chrome 66+,edge 79+ )中只需要 1 行代码就可以实现复制和粘贴

```js
const copy = (text) => navigator.clipboard.writeText('Hello world!')
```

粘贴

```js
const text = navigator.clipboard.readText()
```

如果需要兼容老的浏览器可以使用 `clipboard.js`

### 转发

在小程序中会有转发和分享的按钮， 只需要在函数生命周期中加入 2 个函数就可以了。

```js
onShareAppMessage() {
  // 转发
  return {
    title: this.detail.title + ' | 前端面试题库',
    path: '/pages/index/detail?id=' + this.detail._id + '&userId=' + this.vuex_user ? this.vuex_user._id : '',
  }
},
onShareTimeline() {
  // 分享到朋友圈
  return {
    title: this.detail.title + ' | 前端面试题库',
    path: '/pages/index/detail?id=' + this.detail._id + '&userId=' + this.vuex_user ? this.vuex_user._id : '',
  }
}
```

上述代码是我的面试刷题小程序代码 `detail._id` 是题目 id，`this.vuex_user._id` 是当前用户的 id，这样，每一道题目分享出去都会带上当前用户的 id。

### 生成带参数的二维码

在小程序中可以使用 [wxacode.getUnlimited](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html 'https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html') 接口获取小程序码，适用于需要的码数量极多的业务场景。通过该接口生成的小程序码，永久有效，数量暂无限制。

首先需要获得 access_token，这个是接口调用凭证

```js
//封装获取 access_token 的方法， 1分钟1w次
async function getAccessToken(appId, appSecret) {
  const res = await uniCloud.httpclient.request(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
    {
      dataType: 'json',
    }
  )
  return res.data.access_token
}
```

接下来就可以调用微信提供的接口，生成唯一的小程序码

```js
async function getMpCode(scene, page, access_token) {
  const res = await uniCloud.httpclient.request(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        scene,
        page,
      },
    }
  )
  return res.data
}
```

**参数说明**

- env_version：要打开的小程序版本。正式版为 release，体验版为 trial，开发版为 develop
- page： 页面 page，例如 pages/index/index，**根路径前不要填加 /**，不能携带参数（参数请放在 scene 字段里），如果不填写这个字段，默认跳主页面
- scene：二维码唯一参数， 最大 32 个可见字符，只支持数字，大小写英文以及部分特殊字符：`!#$&'()*+,/:;=?@-._~`，其它字符请自行编码为合法字符（因不支持%，中文无法使用 urlencode 处理，请使用其他编码方式）

**返回值**

- Buffer 返回的图片 Buffer

**云函数生成小程序码**

```js
exports.main = async (event, context) => {
  const appId = '你的 appId'
  const appSecret = '你的 appSecrets'
  const { page, scene } = event
  const access_token = await getAccessToken(appId, appSecret)
  const res = await getMpCode(scene, page, access_token)
  return res
}
```

**小程序端生成 canvas 海报**

```js
uniCloud.callFunction({
  name: 'getmpcode',
  data: {
    scene,
  },
  success: (res) => {
    const imagepath = `${wx.env.USER_DATA_PATH}/mpcode.png`
    const fs = uni.getFileSystemManager()
    fs.writeFileSync(imagepath, uni.arrayBufferToBase64(res.result.data), 'base64')
    canvasdrawImage(imagepath)
  },
})
```

我们在页面上加一个生成朋友圈海报的按钮，当点击这个按钮触发云函数，生成小程序码，然后生成一个 `${wx.env.USER_DATA_PATH}/mpcode.png` 临时文件路径，将接口返回的数据通过 `uni.arrayBufferToBase64` 转成 base64，最后将 base64 写入临时文件，此时本地就有了带参数的二维码。

接下来将二维码绘制在 canvas 上就可以了

```html
<template>
  <view>
    <canvas canvas-id="myCanvas" style="width:100vw;height:100vw;"></canvas>
  </view>
</template>
```

```js
function canvasDrawImage(imagepath) {
  const context = uni.createCanvasContext('myCanvas')
  context.drawImage(imagepath, 470, 530, 100, 100)
  context.draw()
}
```

此时我们可以在页面上看到一个小程序码，drawImage 参数接收一个本地图片路径，在 470,530 的坐标，绘制一个 100,100 的小程序二维码

```js
var img = new Image()
img.onload = function () {
  context.drawImage(img, 0, 0)
}
img.src = 'https://example.com/files/backdround.png'
```

为了让海报更加好看，我们可以设计一张背景，先在 canvas 上绘制背景，文字等，然后再绘制小程序码。

### 下载生成的 canvas 海报

```js
methods: {
  saveImage() {
    uni.showLoading({
      title: '加载中...',
      mask: true,
    })
    uni.canvasToTempFilePath({
      //将canvas保存到一个临时文件
      canvasId: 'myCanvas', //画布id
      success: (res) => {
        const fs = uni.getFileSystemManager()

        fs.saveFile({
          tempFilePath: res.tempFilePath, // 传入一个本地临时文件路径
          success: (res) => {
            this.posterImage = res.savedFilePath
            this.saveImageToPhotosAlbum()
          },
          fail: (err) => {
            console.log(err)
          },
        })
        uni.hideLoading()
      },
    })
  },
  saveImageToPhotosAlbum() {
    uni.saveImageToPhotosAlbum({
      filePath: this.posterImage,
      success: () => {
        this.$emit('close-overlay')
        uni.showToast({
          title: '保存图片成功',
          duration: 2000,
        })
      },
      fail(err) {
        const { errMsg } = err
        if (errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
          uni.showModal({
            title: '保存失败',
            content: '请授权保存图片到“相册”的权限',
            success: (result) => {
              const { confirm } = result
              if (confirm) {
                uni.openSetting({})
              }
            },
          })
        }
      },
    })
  },
}
```

在页面上加一个下载海报按钮，点击就调用 saveImage 函数, 这样就可以将 canvas 海报保存到本地相册了。

**注意** 虽然是 canvas 下载图，但是需要在微信小程序后台： 开发平台->服务器域名->uploadFile 合法域名要添加上 [example.com](https://example.com 'https://example.com') 否则没办法下载成功图片。

## 插入记录表

从 url 获得推广者的 id， 我们需要在用户注册或者下单的时候，推广者获得收益和积分等记录存入一张收益记录表， 这样就可以根据记录或者获得查询收益。代码比较简单，这里就不贴了。

## 小结

本文记录了小程序端全民分销的实现方式，包含前后端的逻辑和思路，总体比较简单，唯一难的就是使用 canvas 绘制海报，若要绘制一张好看的 canvas 海报，可能会花费你不少时间，但是我们可以使用现成的插件，直接在 [Dcloud 插件市场](https://ext.dcloud.net.cn/ 'https://ext.dcloud.net.cn/')搜索关键词“海报”，里面有各种已经封装好的插件，这里我推荐使用 [海报画板](https://ext.dcloud.net.cn/plugin?id=2389 'https://ext.dcloud.net.cn/plugin?id=2389')，支持 xml 和 json 等方式配置，使用比较简单。

## 最后

我的面试刷题小程序[面试狗](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e79ba7971fc4bfbb539676438a66ef4~tplv-k3u1fbpfcp-watermark.image? 'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e79ba7971fc4bfbb539676438a66ef4~tplv-k3u1fbpfcp-watermark.image?')中也加入了这个功能，邀请一个新用户，可以获得 6 积分，虽然现在积分不能兑换礼品，感兴趣朋友可以体验下。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
