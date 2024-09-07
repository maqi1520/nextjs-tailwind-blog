---
title: 【质量保障】Playwright 使用入门
date: 2024/09/01 23:03:43
lastmod: 2024/09/01 15:45:10
tags: [前端, 测试]
draft: false
summary: playwright 介绍 Playwright 是一个端到端（E2E）测试框架， 它可在所有现代浏览器中运行功能强大的测试和自动化。支持多种编程语言 API， 包括 JavaScript
images: https://img.maqib.cn/img/202311021549809.png
authors: ['default']
layout: PostLayout
slug: quality-assurance-playwright-getting-started
---

## playwright 介绍

Playwright 是一个端到端（E2E）测试框架， 它可以在所有现代浏览器中运行功能强大的测试和自动化。支持多种编程语言 API， 包括 JavaScript 、 TypeScript, Python, .NET Java。正因为它基于游览器，相当与模拟用户真实操作，因此不光能够用来跑测试用例，还可以用来写爬虫。

## Playwright Test for VSCode

我们可以安装一个 vscode 插件 [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)，来帮助我们运行、录制、调试测试用例。

![](https://img.maqib.cn/img/20231012170537.png)

## 初始化项目

如果项目中没有安装`Playwright` NPM 包，或者重新开始一个新的测试项目，需要可以在 vscode 命令面板中的`intsll Playwright`。

![](https://user-images.githubusercontent.com/13063165/193314391-6c1df069-857f-4fff-b4fd-5a228bd2fb5d.png)

选择我们常用的浏览器，不必担心选错，后面可以在项目中更改。还可以选择 GitHub Action ，这样就可以轻松在 Github 中持续集成。

这里我选择 chromium，这样可以只下载一个浏览器内核。

![](https://img.maqib.cn/img/20231012173247.png)

点击`OK`后，插件会帮我们自动初始化程序， 下图是初始化的目录结构

![](https://img.maqib.cn/img/20231012174136.png)

配置文件都在 `playwright.config.ts` 中。

看下 `package.json`，只包含了一个包`@playwright/test`

![](https://img.maqib.cn/img/20231012181225.png)

## 运行测试

所有的测试用例都要写在 `tests` 文件夹中，默认有一个测试文件，包含有 2 个测试用例，代码在`example.spec.ts` 中。

![](https://img.maqib.cn/img/20231012174624.png)

第一个测试用例：确保标题包含 Playwright；

第二个测试用例：确保点击 “Get Started”后，跳转到 intro 的链接。

选择左侧的测试用例，并且勾选 `Show browser`，我们便可以直观的看到 Playwright 运行测试的过程。

![](https://img.maqib.cn/img/CleanShot%202023-10-12%20at%2017.59.36.gif)

以上例子默认是使用 chromium 来运行的，并且 chromium 不包含任何 cookie 和缓存信息。

在 `playwright.config.ts` 配置文件中， 可以配置启用的浏览器为 chrome，我们只需要增加一个参数 `channel`，让 Playwright 使用浏览器来运行。 也可以是其他浏览器，参数可以为： "chrome", "chrome-beta", "chrome-dev", "chrome-canary", "msedge", "msedge-beta", "msedge-dev"，"msedge-canary".

```diff-js
use: {
+    channel:'chrome',
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
```

我们虽然改成了使用浏览器来运行，但是启动的浏览器也是一个无痕模式，不包含任何缓存信息。

## 添加 cookie

测试的系统往往需要登录，而在运行每个测试用例之前运行，都需要登录，这肯定是繁琐的，因此我们可以在运行测试用例之前，手动拷贝 cookies，注入到浏览器中。

比如掘金的每日签到和抽奖，我就可以使用 Playwright 来实现自动化

首先建立一个测试文件

```ts
import { test, expect, type Page } from '@playwright/test'

test('登录', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'sessionid',
      value: 'xxx',
      path: '/',
      domain: '.juejin.cn',
    },
    {
      name: 'sessionid_ss',
      value: 'xxx',
      path: '/',
      domain: '.juejin.cn',
    },
  ])
  await page.goto('https://juejin.cn/')
})
```

打开 chrome 控制台，复制 cookies， 添加到代码中

![](https://img.maqib.cn/img/20231013111106.png)

此时点击左侧运行的测试用例，发现已经是登录状态。

![](https://img.maqib.cn/img/20231013134725.png)

## 录制一个测试用例

如果要手动去查找 dom ，从零开始写一个测试用例肯定是繁琐的，因此 Playwright VSCode 插件提供了录制功能。

运行上一次测试用例后，浏览器是未关闭的。此时我们点击 vscode 左侧的 `Record new` 按钮，vscode 便会自动创建一个测试文件，并且记录操作步骤。

录制时，浏览器又是一个全新的，不保留任何状态，那如果我们要测试的是登录后的功能，岂不是又要登录？
其实 playwright 可以保存登录状态。

在上面测试用例后加一句 storageState。

```diff-ts
import { test, expect, type Page } from "@playwright/test";

test("登录", async ({page, context}) => {
    await context.addCookies([
        {
            name: "sessionid",
            value: "xxx",
            path: "/",
            domain: ".juejin.cn",
        },
        {
            name: "sessionid_ss",
            value: "xxx",
            path: "/",
            domain: ".juejin.cn",
        },
    ]);
    await page.goto("https://juejin.cn/");
+   await context.storageState({ path: 'state.json' });
});
```

并且在 `playwright.config.ts` 中，配置存储位置。

![](https://img.maqib.cn/img/20231013142813.png)

此时我们录制操作，就已经是登录状态了。

以下便是录制后的代码。

```js
import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('https://juejin.cn/')
  await page.getByRole('button', { name: '去签到' }).click()
  await page.getByRole('button', { name: '立即签到' }).click()
  await page.getByRole('button', { name: '去抽奖' }).click()
  await page.getByText('免费抽奖次数：1次').click()
  await page.getByRole('button', { name: '收下奖励' }).click()
})
```

录制完成后，直接运行代码可能会报错，我们需要调整一下，因为有些文本是异步请求实现的，有些事件是请求成功后绑定的，在手动录制时，因为已经响应完成，因此没问题，我们加上 2 句延迟。

```diff-js
test("test", async ({ page }) => {
  await page.goto("https://juejin.cn/");
+  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /去签到|已签到/ }).click();
+  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /今日已签到|立即签到/ }).click();
  await page.getByRole("button", { name: "去抽奖" }).click();


  const lotteryElement = await page.$("#turntable-item-0");
  const buttonText = await lotteryElement?.textContent();
  if (buttonText === "免费抽奖次数：1次") {
    await lotteryElement?.click();
    await page.getByRole("button", { name: "收下奖励" }).click();
  } else {
    expect(
      page.locator("#turntable-item-0", { hasText: /单抽/ })
    ).toBeDefined();
  }
});
```

便可以运行成功，注意这里我使用了 `waitForTimeout` 这个 api 在官网中已经被标记了废弃(deprecate)

实际测试场景中请使用改用网络事件、选择器变得可见等信号。

```diff-js
await page.goto("https://juejin.cn/");
  await page.waitForResponse((res) =>
    res.url().includes("/user_api/v1/incentive_activity/award_after_login")
  );
  await page.getByRole("button", { name: /去签到|已签到/ }).click();

  await page.waitForResponse((res) =>
    res.url().includes("/growth_api/v2/get_today_status")
  );
  await page.getByRole("button", { name: /今日已签到|立即签到/ }).click();
```

等待接口响应成功后再出发点击事件。

还有一点就是，自动录制的代码，一般使用了语义化定位方法，比如`getByRole`、`getByText`，这些定位器往往不够准确，改动代码会导致测试用例失效。

因此我们可以使用 `locator` 定位器来替换。

在 Playwright 中，Locator 表示一种元素查找方式，是 Playwright 提供的一组方法，用于定位页面上的元素。

Locator 支持 XPath 和 CSS 选择器

```js
await page
  .locator('#tsf > div:nth-child(2) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input')
  .click()

await page.locator('//*[@id="tsf"]/div[2]/div[1]/div[1]/div/div[2]/input').click()
```

在 vscode 中可以使用 Pick locator 快速获取当前的 dom 定位。

![](https://img.maqib.cn/img/20231015151142.png)

![](https://img.maqib.cn/img/20231015151100.png)

## 测试用例及断言

录制的测试代码只能确保业务能够跑通，但不能证明程序的可靠与健壮。一旦测试用例出错，也不知道是程序错误还是测试用例错误，因此我们还是需要根据测试用例来写可靠的测试代码。

比如上述掘金抽奖程序可以包含以下测试用例

1. 签到的状态需要根据接口返回显示

通过 network 查看签到返回如下：

![](https://img.maqib.cn/img/20231015163937.png)

实现签到测试用例代码如下

```js
test('签到的状态根据接口返回显示', async ({ page }) => {
  await page.goto('https://juejin.cn/user/center/signin')
  const promise = await page.waitForResponse((res) =>
    res.url().includes('/growth_api/v2/get_today_status')
  )
  const res = await promise.json()
  if (res.data.check_in_done) {
    await expect(page.locator('.signedin')).toHaveText('今日已签到')
  } else {
    await expect(page.locator('.signedin')).toHaveText('立即签到')
    await page.getByRole('button', { name: /立即签到/ }).click()
    await page.getByRole('button', { name: '去抽奖' }).click()
    //调整到抽奖页面
    await expect(page).toHaveURL(/user\/center\/lottery/)
  }
})
```

2.  抽奖页面，根据接口返回显示抽奖次数和奖品

通过 network，看到抽奖配置接口返回如下：
![](https://img.maqib.cn/img/20231015163736.png)

实现的测试用例代码如下

```js
test('根据接口返回显示抽奖次数', async ({ page }) => {
  await page.goto('https://juejin.cn/user/center/lottery')
  const promise = await page.waitForResponse((res) =>
    res.url().includes('/growth_api/v1/lottery_config/get')
  )
  const res = await promise.json()
  const lotteryNames = res.data.lottery.map((item) => {
    if (item.unlock_count === 0) {
      return new RegExp(item.lottery_name)
    } else {
      return new RegExp(`再抽${item.unlock_count}次解锁`)
    }
  })

  await expect(page.locator('.item-container .turntable-item')).toHaveText(lotteryNames)

  if (res.data.free_count) {
    await expect(page.locator('#turntable-item-0')).toHaveText(
      `免费抽奖次数：${res.data.free_count}次`
    )
  } else {
    await expect(page.locator('#turntable-item-0')).toHaveText('单抽 200')
  }
})
```

有了以上断言，我们便可以确保前端页面显示与接口返回显示一致。

运行完成后，可以在 playwright-report 查看测试报告。

![](https://img.maqib.cn/img/20231015205316.png)

## 小结

本文介绍了 Playwright 单元测试框架的入门使用，Playwright 是一个功能强大的端到端（E2E）测试框架，支持多种编程语言 API，适用于现代浏览器，还可用于编写网络爬虫。

使用 Playwright Test for VSCode 插件，可以快速初始化测试项目，运行测试用例，并添加 Cookie 来模拟登录状态，以及可以使用录制功能来自动生成测试代码。

另外， 可以使用 Locator 定位器替代语义化定位方法，以提高测试的准确性。最后，我们通过了一个掘金抽奖程序实例来说明测试代码的可靠性。
