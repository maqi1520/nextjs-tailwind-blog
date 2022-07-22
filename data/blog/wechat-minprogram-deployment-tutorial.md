---
title: '《成语小秀才》部署教程'
date: '2022/7/22'
lastmod: '2022/2/25'
tags: ['微信小程序']
draft: false
summary: '相信很多朋友都玩过这款小游戏，叫成语秀才，这款小游戏开发起来还是比较困难的，首先要有一份海量的题库。。。文末有源码。'
images:
  [
    'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/94c64aad55704ccabdc658df03fe0e2e~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?',
  ]
authors: ['default']
layout: PostLayout
---

## 前言

相信很多朋友都玩过这款小游戏，叫成语秀才，没体验过的朋友可以点击[这里](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd9397ccd7614260ab854867a702e199~tplv-k3u1fbpfcp-watermark.image?)，扫码体验，这款小游戏开发起来还是比较困难的，首先要有一份海量的题库，然后在每道题都有不同的布局，我是一个非常喜欢学习的人，于是我就花费了巨资 4.99 元，买了这份源码，然后买到这份源码后，却没有部署文档，卖家说花费 60 元可以提供部署一条龙服务。本着我爱学习和分享的精神，我来补充这份部署文档，在文末，我也将这份至少价值 64.99 元的源码分享给大家。

## 技术架构

- 后端： PHP+mysql
- 前端：微信小程序原生开发

## 部署前的准备

- 一个小程序账号，每个用户可以免费注册 5 个小程序账号
- 一台 linux 服务器
- 一个已经备案的域名
- 下载微信开发者工具

## 部署

### 安装宝塔面板

宝塔面板是一款可视化的服务器管理软件，通过 Web 端轻松管理服务器，提升运维效率，支持 windows 和 linux 系统，可一键配置服务器环境（LAMP/LNMP/Tomcat/Node.js），可以轻松在版本间进行切换，集成方便高效的文件管理器，支持上传、下载、打包、解压以及文件编辑查看功能，例如：创建管理网站、FTP、数据库，拥有可视化文件管理器，可视化软件管理器，可视化 CPU、内存、流量监控图表，计划任务等功能，且支持一键备份到云存储空间里。

使用 SSH 连接到您的 Linux 服务器后,输入以下命令安装

Centos 安装脚本

```bash
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
```

Ubuntu/Deepin 安装脚本

```bash
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

出现疑问，输入 yes 后就开始安装了
![宝塔面板安装后输出地址](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/56c7d60566734311bfd90397e1b8c34c~tplv-k3u1fbpfcp-zoom-1.image)
2-3 分钟后会在屏幕上输出宝塔面板的登录地址，宝塔面板会随机生成用户名、密码和端口，我们需要把这些地址保存到本地，以免下次忘记。

接下来我们需要在云服务器上设置安全组或者防火墙，放行自动生成的端口。

![腾讯云配置安全组](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/028d4bbf2e0645f495002a9d15eb405b~tplv-k3u1fbpfcp-zoom-1.image)

开通了端口，输入宝塔面板地址，输入用户名和密码就可以登录了
![宝塔面板登录](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f55e5c947f074c06917b59710c10fed4~tplv-k3u1fbpfcp-zoom-1.image)

### 域名解析

![腾讯云域名解析](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57ccbd07430848369f05779956145012~tplv-k3u1fbpfcp-zoom-1.image)

在你的域名服务商后台，将一个域名解析到 这台这台服务器 ip，解析完成后，你就可以使用域名访问了。

### 安装 PHP+mysql

登录后要先绑定一个宝塔账号，这个大家自行注册就可以了
![选择系统推荐的 LNMP 环境](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87a0287e81c0480ab44c325b74097bdb~tplv-k3u1fbpfcp-zoom-1.image)
绑定成功后，我们来安装 PHP+mysql，系统会自动弹窗框让我们来选择环境，我这里选择 LNMP

- 急速安装，安装时间极快（5-10 分钟），版本与稳定性略低于编译安装，适合快速部署测试
- 编译安装，安装时间长（30 分钟到 2 小时），性能最大化，适合生产环境，
  点击一键安装后，宝塔面板就会开始安装环境了

![LNMP 环境安装进度](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dca6c1b9526d40428dea14659f358e91~tplv-k3u1fbpfcp-zoom-1.image)
等待 10 分钟后，环境安装完成，当然有经验的同学可以自行安装 PHP+mysql 的环境，但是使用宝塔面板对新手比较友好。

![访问IP显示会宝塔404页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/969c0b1146c24386bba1e007d55caf6f~tplv-k3u1fbpfcp-zoom-1.image)
此时访问我们的 IP 就可以看到页面，说明我们的环境已经安装成功了。

### 安装微擎

微擎官网：https://www.we7.cc/

微擎官方文档：https://www.kancloud.cn/donknap/we7/136557

微擎源码地址：https://gitee.com/we7coreteam/pros

微擎是一款小程序和公众号管理系统，可以实现微信平台（mp.weixin.qq.com）不能实现的功能，例如商城，餐饮，酒店，汽车，门店，同城，各类行业解决方案，营销，推广，吸粉，游戏，物联网和人工智能等功能，这些应用大部分收费，也有免费的应用，大家可以在官网上搜索安装。

点击网站，添加网站，输入你自己的要解析的域名，
![宝塔面板添加网站](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a8ee547be3444d49c5fcf23c4766086~tplv-k3u1fbpfcp-zoom-1.image)

选择创建数据库，和 FTP，点击提交,此时输入我们的域名可以看到如下页面

![宝塔默认创建的页面](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4aa6ab9c38ed4118bdc33bdb4215881d~tplv-k3u1fbpfcp-zoom-1.image)

说明我们的网站创建成功了。

### 安装微擎框架

在网站 ftp 目录下上传微擎框架的源码
![上传微擎框架源码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a26aaf081ae412da31f967a43f3a927~tplv-k3u1fbpfcp-zoom-1.image)

上传完成后点击 zip 文件解压

![设置网站默认站点](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bdf78269543540bf925b8475efb498a0~tplv-k3u1fbpfcp-zoom-1.image)

点击默认站点，设置我们刚才创建的网站

![输入IP，开始安装微擎](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12c769cda391444aaa0703b0c0e44687~tplv-k3u1fbpfcp-zoom-1.image)
输入 IP 地址，就可以进入微擎的安装页面了。
![微擎安装页面检查环境](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71f28a203c6b41b49f75c321b46b54ad~tplv-k3u1fbpfcp-zoom-1.image)

安装过程中会检查 PHP 环境要求，若检查不成功，我们需要修改相应的 PHP info 文件。

![微擎配置数据库和密码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/48a541dd8d9f49f1b41befcc7ec4c320~tplv-k3u1fbpfcp-zoom-1.image)

点击继续输入刚才创建的数据库信息，并且设置微擎后台密码

![微擎安装完成](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d717f71c30324d4eb41f746f5db070fa~tplv-k3u1fbpfcp-zoom-1.image)

点击继续安装完成

### 安装小程序

安装小程序后端模块

![上传微信模块源码并解压](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c2d0821c98741b28ffa8e6f6d0f400d~tplv-k3u1fbpfcp-zoom-1.image)

在 addons 目录下上传小程序后端模块，并且解压。

![微擎应用管理，未安装的列表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/df929d840cda4481af30b3024be3eb35~tplv-k3u1fbpfcp-zoom-1.image)

解压成功后，登录微擎后台，在应用管理中，有一个未安装的列表

点击应用开始安装，一路点确定，安装完成

![微擎应用管理，已安装的列表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f2619acc95646cc8a2c4d3c306843aa~tplv-k3u1fbpfcp-zoom-1.image)

接下来在平台入口，新建平台选择新建微信小程序

![新建平台，新建小程序](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86d161e58d834ec58d7fb7e0dd01bca0~tplv-k3u1fbpfcp-zoom-1.image)

![选择手动添加小程序](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ed64dcaea9c4d8489359dfde04493b7~tplv-k3u1fbpfcp-zoom-1.image)

![选择新建单个小程序](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97bb884cc4764a24b2e16f31b3a40d96~tplv-k3u1fbpfcp-zoom-1.image)

![配置小程序信息](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d563b265fb4e429390454a3e5dbf5b11~tplv-k3u1fbpfcp-zoom-1.image)

配置小程序信息，AppId 和 AppSceret 可以在微信后台开发设置中找到。

![添加应用](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6fe7dc060f464f2c9ce6661d521cbc06~tplv-k3u1fbpfcp-zoom-1.image)

添加应用选择成语小秀才

![生成版本](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/685f22d0a6484e8ea007dac8392877da~tplv-k3u1fbpfcp-zoom-1.image)
输入一个名称，输入一个版本号，点击生成版本，小程序后端安装成功

### 导入数据库

在宝塔面板选择数据库，登录 phpmyadmin
![导入 sql](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ba8bd47822d4e4989a4a3bd57bd0b6f~tplv-k3u1fbpfcp-zoom-1.image)

选择刚才创建的数据，选择 sql 文件，点击导入，等待 2 分钟，数据库导入成功

![成语小程序相关表](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7bcdc2fa2a344dfbd58e01e4c913c66~tplv-k3u1fbpfcp-zoom-1.image)

`ims_yf_chengyu_` 开头的都是成语小程序相关表, `ims_yf_chengyu_level`看到总共有 3008 关

### 修改小程序源码

![只有微信开发者工具打开小程序源码](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ab3fdd433c749aa8e7d6fac8c0d9e0b~tplv-k3u1fbpfcp-zoom-1.image)

修改 siteroot 为你的域名，修改 uniacid 和 acid 为下图 url 上的 uniacid

![小成语应用 uniacid](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b33e3d492e14b8dbf3767a57d783487~tplv-k3u1fbpfcp-zoom-1.image)

![修改小程序 appid](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9eb662f45303423fb1e4bff51893a9c1~tplv-k3u1fbpfcp-zoom-1.image)

修改 `project.config.json` 中的 `appid` 为你自己的小程序 `appid`;

![小程序开发模式](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a19d38c550047028a4a6504736111e8~tplv-k3u1fbpfcp-zoom-1.image)
到此为止小程序会自动刷新，看到这个界面说明小程序已经可以成功运行。
接下来需要在微信后台——>开发管理——>开发设置——>设置 request 合法域名。
设置完成后就可以提交小程序审计，上线了。

## 结语

本文详情记录了微擎小程序的安装部署步骤，当然不单单是这一个小程序，其他小程序部署也是如此。

如果你对整套小程序感兴趣，也想部署这套小程序，可以关注微信公众号“JS 酷”，回复**成语**获取源码。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。
