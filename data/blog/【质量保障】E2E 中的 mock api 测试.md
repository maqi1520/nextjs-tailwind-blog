---
title: 【质量保障】E2E 中的 mock api 测试
date: '2024/9/01'
lastmod: '2024/9/01'
tags: [测试]
draft: false
summary: '如何使用 Playwright 来模拟 API 请求和修改 API 响应'
images: [https://img.maqib.cn/img/CleanShot_2024_09_30_at_10.49.41@2x.png]
layout: PostLayout
slug: quality-assurance-e2e-mock-api-testing
---

## 前言

保证软件稳定性，使用端到端（E2E）测试是常见的测试方案， 但全量的 E2E 测试存在一些问题

1. 测试成本较大（包括测试时间成本和资源成本）
1. 测试场景不够全面

我们可以使用 mock api 来互补。

## Mock API 介绍

Web 软件开发中，通常使用 http 请求来实现，Playwright 提供了用于模拟和修改网络请求的 API，包括 HTTP 和 HTTPS。页面所做的任何请求 XHR 和 fetch 请求，都可以被跟踪、修改和模拟。使用 Playwright 还可以将多个页面的网络请求录制成 HAR 文件，使得 E2E 测试可以降低成本，构造一些特殊场景，覆盖更多复杂场景。

## 模拟 API 请求

我们以 playwright 官方的一个例子为例

https://demo.playwright.dev/api-mocking/

这个是一个简单的列表页面，通过一个接口`api/v1/fruits`渲染出接口给的水果列表数据

![](https://img.maqib.cn/img/202407291929218.png)

以下代码将拦截所有 `*/**/api/v1/fruits` 接口调用，并返回自定义响应，测试执行的时候，不会向 API 发出任何请求。

```js
test("mocks a fruit and doesn't call api", async ({ page }) => {
  // Mock the api call before navigating
  await page.route('*/**/api/v1/fruits', async (route) => {
    const json = [{ name: 'Strawberry', id: 21 }]
    await route.fulfill({ json })
  })
  // Go to the page
  await page.goto('https://demo.playwright.dev/api-mocking')

  // Assert that the Strawberry fruit is visible
  await expect(page.getByText('Strawberry')).toBeVisible()
})
```

该测试将请求转到模拟路由 URL 上，并断言页面上存在模拟数据。

运行 `npx playwright test --ui`

执行测试用例，并且查看 trace viewer

![](https://img.maqib.cn/img/202407291945677.png)

从上图看到接口请求数据已经被拦截。

## 修改 API 响应

有时需要发出 API 请求，但需要修改响应数据来测试。在这种情况下，可以执行请求并修改返回的接口数据。

例如： 一些 ui 权限控制展示等

```js
test('gets the json from api and adds a new fruit', async ({ page }) => {
  // Get the response and add to it
  await page.route('*/**/api/v1/fruits', async (route) => {
    const response = await route.fetch()
    const json = await response.json()
    json.push({ name: 'Loquat', id: 100 })
    // Fulfill using the original response, while patching the response body
    // with the given JSON object.
    await route.fulfill({ response, json })
  })

  // Go to the page
  await page.goto('https://demo.playwright.dev/api-mocking')

  // Assert that the new fruit is visible
  await expect(page.getByText('Loquat', { exact: true })).toBeVisible()
})
```

运行测试，我们可以看到 network 中的请求包含了 2 次，一次来源于 Page#1

![](https://img.maqib.cn/img/202407292000733.png)

通过检查响应，可以看到 mock 中添加的新水果已显示在列表中。

## 使用 HAR 文件进行 Mock

HAR 文件是一个 HTTP 存档文件，其中包含加载页面时发出的所有网络请求的记录。它包含有关请求和响应标头、Cookie、内容、时间等的信息。
我们可以使用 HAR 文件在测试中模拟网络请求。并将测试执行持续集成（CI），需要 3 个步骤：

1. 录制 HAR 文件。
2. 将 HAR 文件与测试一起提交。
3. 在测试中使用保存的 HAR 文件路由请求。

### 录制一个 Har 文件

为了录制 HAR 文件，我们使用 `page.routeFromHAR()` 或 `browserContext.routeFromHAR()` 方法。此方法接受 HAR 文件的路径和可选一个可选对象 `options`。 对象可以包含 `url` 用于指定 `glob` 模式匹配的请求才会录制到 HAR 文件中。如果未指定，则将所有请求都录制到 HAR 文件中。

- 将 `update` 选项设置为 true，将使用实际网络请求创建或更新 HAR 文件。并且创建一个 HAR 文件。
- 将 `update` 选项设置为 false，将使用 HAR 文件中的数据来 mock 真实数据 。

```js
test('records or updates the HAR file', async ({ page }) => {
  // Get the response from the HAR file
  await page.routeFromHAR('./hars/fruits.har', {
    url: '*/**/api/v1/fruits',
    update: true,
  })

  // Go to the page
  await page.goto('https://demo.playwright.dev/api-mocking')

  // Assert that the Playwright fruit is visible
  await expect(page.getByText('Strawberry')).toBeVisible()
})
```

执行测试用例后将会生成一个 HAR 文件。

![](https://img.maqib.cn/img/202407301426205.png)

HAR 文件就是一个 json 文件，保存了 mock 请求接口信息，接口响应结果保存到 bin 文件中。

### 修改 HAR 文件

一旦录制完成了一个 HAR 文件，我们就可以通过在 `hars` 文件夹下，找到哈希` .bin` 文件并编辑， 将修改后的文件提交到源代码管理中。
当使用 `update:true` 运行此测试时，就会使用 API 请求更新 HAR 文件。

```js
;[
  {
    name: 'Playwright',
    id: 100,
  },
  // ... other fruits
]
```

### 使用录制的 HAR 文件进行 mock 测试

现在，我们已经记录了 HAR 文件并修改了 mock 数据，只需`update` 改为 false 或者删除即可。这将针对 HAR 文件运行测试，而不是真实的 API。

```js
test('gets the json from HAR and checks the new fruit has been added', async ({ page }) => {
  // Replay API requests from HAR.
  // Either use a matching response from the HAR,
  // or abort the request if nothing matches.
  await page.routeFromHAR('./hars/fruits.har', {
    url: '*/**/api/v1/fruits',
    update: false,
  })

  // Go to the page
  await page.goto('https://demo.playwright.dev/api-mocking')

  // Assert that the Playwright fruit is visible
  await expect(page.getByText('Strawberry')).toBeVisible()
})
```

查看 trace viewer，我们可以看到路由是从 HAR 文件实现的，并且未调用 API。

检查网络响应，可以看到新数据已添加到 JSON 中，这是通过手动更新 hars 文件夹中的`哈希.bin`文件来完成的。

HAR 需要严格匹配 URL 和 HTTP 方法。对于 POST 请求，它还需要严格匹配 POST 有效负载。

如果给定的 HAR 文件名以 .zip 结尾，则会将 HAR 文件和录制的网络 json 打包为 zip。我们可以解压 zip 文件，手动编辑数据。

### 使用 CLI 录制 HAR 文件

Playwright 还支持使用 CLI 录制 HAR。

使用 Playwright CLI 打开浏览器并传递 `--save-har` 选项以生成 HAR 文件。（可选参数）使用 `--save-har-glob` 仅保存您感兴趣的请求，例如 API 接口。如果 har 文件名以 .zip 结尾，则会将录制的所有文件都压缩到一个 zip 中。

```js
npx playwright open --save-har=example.har --save-har-glob="**/api/**" https://example.com
```

## 参考

- https://playwright.dev/docs/mock

- https://github.com/microsoft/playwright-examples
