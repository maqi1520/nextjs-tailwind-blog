---
title: ' 用小程序来实现扫码登录'
date: '2022/8/8'
lastmod: '2022/8/8'
tags: [React.js, uni-app]
draft: false
summary: '在 web 开发中，少不了用户系统，开发者需要开发注册登录这些重复的功能，而对于用户来说，要要注册才可以使用，往往会不愿意，因为我们有太多的账号和密码了，而现在可以使用小程序来实现扫码登录。'
images:
  [
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f524859dfdd549b9836e7f37b39425b5~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

在 web 开发中，少不了用户系统，开发者需要开发注册登录这些重复的功能，而对于用户来说，要要注册才可以使用，往往会不愿意，因为我们有太多的账号和密码了，而现在，微信拥有 12 亿的月活用户，使用微信实现扫码登录，会大大减少需要用户注册而造成的流失率，而实现微信扫码登录有一定门槛，首先需要是企业用户才可以在微信开发平台注册账号，紧接着需要认证缴费 300 元才可以，简直就是黑店，而现在我们可以使用小程序来实现，今天就来讲讲小程序扫码登录的实现方式。

## 小程序扫码登录的优点

- 不需要企业资质，个人用户就可以注册小程序；
- 不需要认证，每年可以省 300 元；
- 打通小程序端的用户数据，可以让 PC 网站往移动端引流，用户不流失；

## 流程图

![小程序来实现扫码登录流程图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/99e099087158448db82ab89f8d586b94~tplv-k3u1fbpfcp-zoom-1.image)

## 小程序用户系统实现

首先需要有小程序的用户系统

### 第一步：获取用户登录凭证

通过 `wx.login` 获取用户登录凭证 `res.code`

```js
wx.login({
  success: (res) => {
    //res.code
  },
})
```

在 uniapp 中，可以使用统一封装的登录方法

```js
export default {
  data() {
    return {
      user: null,
    }
  },
  onLoad() {
    //第一步 login 获取 code
    uni.login({
      provider: 'weixin',
      success: (res) => {
        this.wxlogin(res.code) //第二步调用云函数
      },
    })
  },
  methods: {
    async wxlogin(wxcode) {
      // code 获取 openid 存入数据库中
      this.user = await uniCloud.callFunction({
        name: 'user_authorize',
        data: {
          code: wxcode,
        },
      })
    },
  },
}
```

user 是数据库中的用户信息，用于展示在页面上，这一步用户登录无感知的，我们也无法获得用户的头像昵称等信息，若要在 pc 上展示用户信息，可使用 `uni.getUserProfile` 方法。

![授权登录](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d18ebca8125e4b95b3f9c11473391ec4~tplv-k3u1fbpfcp-zoom-1.image)

实现代码如下：

```js
export default {
  data() {
    return {
      user: null,
    }
  },
  onLoad() {},
  methods: {
    async getUserProfile() {
      //第一步 login 获取 code
      uni.login({
        provider: 'weixin',
        success: function (loginRes) {
          console.log(loginRes.code)
          // 获取用户信息
          uni.getUserProfile({
            desc: '个人登录，记录数据', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: function (infoRes) {
              console.log('用户昵称为：' + infoRes.userInfo.nickName) //昵称
              console.log('用户昵称为：' + infoRes.userInfo.avatarUrl) //头像
              this.wxlogin(loginRes.code, infoRes.userInfo)
            },
          })
        },
      })
    },
    async wxlogin(wxcode) {
      // code 获取 openid 存入数据库中
      this.user = await uniCloud.callFunction({
        name: 'user_authorize',
        data: {
          ...infoRes.userInfo,
          code: wxcode,
        },
      })
    },
  },
}
```

`getUserProfile` 方法不能主动调用，必须通过按钮，用户点击授权获得，所以我们需要在页面中加入以下代码：

```html
<template>
  <view>
    <button class="login-btn" v-if="!user" open-type="getUserProfile" @click="getUserProfile">点击登录</button>
    <view v-if="user">
      <text>{{ user.nickName }}</text>
    <view>
  </view>
</template>
```

### 第二步：code 获取 openid 存入数据库中

请求服务端，服务端通过微信的`code2session`接口获取 `openid`
这个 `openid` 就是小程序与微信的唯一 id 了，这里我以 uniapp 云函数为例，说明下实现代码。

```js
async function code2Session(appId, secret, code) {
  const res = await uniCloud.httpclient.request(
    `https: //api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`,
    {
      dataType: 'json',
    }
  )
  return res.data
}
```

用 `uniCloud.httpclient.request`请求` code2Session`接口获取 openid

```js
const db = uniCloud.database()

exports.main = async (event, context) => {
  let appId = '小程序appid'
  let appSecret = '小程序秘钥'
  let res = await code2Session(appId, appSecret, event.code)

  let wx_user = await db
    .collection('wx_user')
    .where({
      openid: res.openid,
    })
    .get()
    .then((res) => res.data[0])
  // 判断用户是否存在
  if (!wx_user) {
    let createTime = new Date().getTime()
    let user_new = await db.collection('wx_user').add({
      ...event,
      code: undefined,
      openid: res.openid,
      createTime,
    })
    // 查询最新的数据
    wx_user = await db
      .collection('wx_user')
      .where({
        openid: res.openid,
      })
      .get()
      .then((res) => res.data[0])
  }
  return {
    success: true,
    data: chrrentUser,
  }
}
```

判断用户是否存在，若不存在就新建一条数据，若存在，就直接返回数据库中的数据，这样就可以建立用户系统。

## PC 端扫码登录

PC 端扫码登录，依赖微信提供的`wxacode.getUnlimited`接口，
该接口获取的小程序码，适用于需要的码数量极多的业务场景。通过该接口生成的小程序码，永久有效，数量暂无限制。我们可以通过业务码来实现登录。
下面代码是云函数，用于获取 PC 端的二维码。

```js
//封装获取access_token的方法 1分钟1w次
async function getAccessToken(appId, appSecret) {
  const res = await uniCloud.httpclient.request(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
    {
      dataType: 'json',
    }
  )
  return res.data.access_token
}

exports.main = async (event, context) => {
  const data = JSON.parse(data.body)
  let appId = '小程序appid'
  let appSecret = '小程序秘钥'
  const access_token = await getAccessToken(appId, appSecret)

  const res = await uniCloud.httpclient.request(
    'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + access_token,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        scene: data.scene,
        page: data.page,
        env_version: 'release', //扫描后打开的小程序的版本，正式版release，体验版trial，开发版develop
        width: '430', //生成的小程序码图片的宽度
        //小程序码线条的颜色
        line_color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    }
  )
  return 'data:image/png;base64,' + res.data.toString('base64')
}
```

然后，需要在小程序 `onLoad` 时候，获取扫码登录的唯一值，并且保存到全局中。

```js
onLoad(options) {
  this.scene = options.scene;
}
```

登录授权的时候将 `scene` 和用户信息保存到用户表

```js
async wxlogin(wxcode) {
      // code 获取 openid 存入数据库中
  this.user = await uniCloud.callFunction({
    name: "user_authorize",
    data: {
      ...infoRes.userInfo,
      scene:this.scene,
      code: wxcode,
    },
  });
},
```

接下来 pc 端，就可以根据 scene 轮询查询 user 表，获取登录信息了。

## PC 扫码登录步骤

- PC 端点击登录时生成并显示小程序码，此时开启轮询，每 3 秒查询一次数据库；

- 在三分钟内如果查询不到匹配的用户信息，结束轮询，并让二维码失效；

- 若查询到匹配用户可以将用户信息通过 JsonWebToken 保存，同 PC 登录原理一致。

## 小程序端优化

可以先通过 `wx.login` 实现免提示登录，此时 PC 端二维码显示扫码成功。

再通过 `wx.getUserProfile` 授权获取用户头像等信息，实现同步。

## 体验

最后我将完整代码实现在小程序"面试狗"中，PC 端大家可以访问:https://www.runjs.cool/interview 体验

Github 地址: https://github.com/maqi1520/runjs.cool

如果对你有帮助，可以随手点个赞，这对我真的很重要。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
