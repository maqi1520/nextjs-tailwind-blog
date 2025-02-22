---
title: 网站迁移后，如何通过 Cloudflare 实现 301 重定向？
date: 2025/02/22 22:55:57
lastmod: 2025/02/22 11:42:11
tags: [Cloudflare]
draft: false
summary: 在网站迁移过程中，301 重定向是至关重要的一步。它不仅可以确保用户访问旧域名时自动跳转到新域名，还能将旧域名的 SEO 权重传递到新域名，避免流量损失和搜索引擎排名下降。
images: https://img.maqib.cn/img/202502221832285.webp
authors: ['default']
layout: PostLayout
---

大家好！最近我将我的网站从 `https://editor.runjs.cool/` 迁移到了 `https://mdxnotes.com/`。为了确保用户和搜索引擎能够顺利访问新站点，我决定通过 **Cloudflare** 来设置 301 重定向。今天就来分享一下具体的操作步骤，希望能帮助到有类似需求的朋友们！

## 为什么要设置 301 重定向？

在网站迁移过程中，301 重定向是至关重要的一步。它不仅可以确保用户访问旧域名时自动跳转到新域名，还能将旧域名的 SEO 权重传递到新域名，避免流量损失和搜索引擎排名下降。

## 如何通过 Cloudflare 实现 301 重定向？

Cloudflare 提供了两种主要方式来实现 301 重定向：**页面规则（Page Rules）** 和 **Workers**。下面我会详细介绍这两种方法。

## 方法 1：使用 Cloudflare 页面规则（Page Rules）

### 步骤 1：登录 Cloudflare

首先，访问 [Cloudflare](https://www.cloudflare.com/) 并登录你的账户。
并且将域名添加到 Cloudflare 域，这样就可以通过 cloudflare 来域名解析。

### 步骤 2：选择站点

在仪表板中选择你需要设置的网站（例如我的站点 `runjs.cool`）。

![cloudflare 站点](https://img.maqib.cn/img/202502221832285.webp)

### 步骤 3：进入页面规则

在左侧菜单中，点击 **"Rules"**（规则）。

![cloudflare rules](https://img.maqib.cn/img/202502221833930.webp)

### 步骤 4：创建新的页面规则

点击 **"Create Rule"**（创建规则）。

### 步骤 5：设置规则条件

在 （如果 URL 匹配）字段中，输入旧域名的匹配规则。例如：

- `https://editor.runjs.cool/*`（匹配所有页面）

- 选择 **"301 - Permanent Redirect"**（301 永久重定向）。
- 在目标 URL 中，输入新域名的对应地址。例如：
  - `https://mdxnotes.com/${1}`（`${1}` 表示保留原始路径）。

![cloudflare 设置规则条件](https://img.maqib.cn/img/202502221615777.webp)

### 步骤 7：保存规则

点击 **"Save"**（保存并部署）。
可能要等一会后，访问旧域名的页面，检查是否成功跳转到新域名。

---

## 方法 2：使用 Cloudflare Workers（高级）

如果你需要更灵活的重定向逻辑（例如基于路径、查询参数等），可以使用 Cloudflare Workers 来实现。

### 步骤 1：登录 Cloudflare

访问 [Cloudflare](https://www.cloudflare.com/) 并登录你的账户。

### 步骤 2：进入 Workers

在左侧菜单中，点击 **"Workers & Pages"**（Workers 和页面）。

### 步骤 3：创建 Worker

点击 **"Create Application"**（创建应用），然后选择 **"Create Worker"**（创建 Worker）。

也可以通过 playground 直接创建

https://workers.cloudflare.com/playground

### 步骤 4：编写重定向代码

在 Worker 编辑器中，输入以下代码：

```javascript
/**
 * @typedef {Object} Env
 */

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // 设置新域名
    const newDomain = 'https://mdxnotes.com'

    // 保留路径和查询参数
    const newUrl = newDomain + url.pathname + url.search

    // 返回 301 重定向
    return Response.redirect(newUrl, 301)
  },
}
```

点 Go，就可以预览

![](https://img.maqib.cn/img/202502221635983.webp)

### 步骤 5：部署 Worker

点击 **"Deploy"**（部署）。

![Deploy](https://img.maqib.cn/img/202502221638193.webp)

### 步骤 6：绑定 Worker 到旧域名

![cloudflare 绑定 Worker 路由设置截图](https://img.maqib.cn/img/202502221645609.webp)

### 步骤 7：测试重定向

访问旧域名的页面，检查是否成功跳转到新域名。

通过以上步骤，你可以轻松使用 Cloudflare 实现 301 重定向，确保用户和搜索引擎顺利访问新站点。如果你有任何问题，欢迎在评论区留言讨论！

**关注我们，获取更多技术干货！**

希望这篇文章对你有帮助！如果你觉得有用，别忘了点赞、分享哦！😊
