---
title: 如何使用 react 和 three.js 在网站渲染自己的3D模型
date: '2022/03/12'
lastmod: '2022/03/12'
tags: [JavaScript, React.js]
draft: false
summary: 在本文中，我将介绍如何在 react 项目中使用 react-three-fiber 创建的一个3D 软件程序，配置3D 参数(如 Blender 或 Maya ) 。在本文结束时，您将能够在您的网站上渲染一个3D模型 (gltf / glb)。
images:
  [
    https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03e816da47944c2da6ed00f76e0a7419~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?,
  ]
layout: PostLayout
---

哈喽，大家好，我是小马，今天翻译一篇文章 [《How to Use Three.js And React to Render a 3D Model of Your Self》](https://dev.to/nourdinedev/how-to-use-threejs-and-react-to-render-a-3d-model-of-your-self-4kkf)，内容是当下最流行的 three.js，根据本文步骤，你将零基础学会在网页中渲染 3D 模型。

正文开始

---

在本文中，我将介绍如何在 react 项目中使用 react-three-fiber 创建的一个 3D 软件程序，配置 3D 参数(如 Blender 或 Maya ) 。在本文结束时，您将能够在您的网站上渲染一个 3D 模型 (gltf / glb)。

## 获取自己的 3D 模型

为了获得自己的 3D 模型，我们使用 [**Ready Player Me**](https://readyplayer.me) 这个网站，一个免费的 3D 形象创建器来自 Wolf3D，允许任何人在几分钟内创建自己的外观表现，不需要任何 3D 建模经验，你只需要做的是快速自拍，然后等待程序根据你的肖像自动生成自定义 3D 形象。

然后你可以自由地使用一系列合适的发型、肤色、面部特征、服装选择和其他可定制的属性对自己的角色进行调整。

登录这个网站后 [**Ready Player Me**](https://readyplayer.me), 你只需要遵循以下步骤，你就可以开始进行。

### 选择体型

![步骤一选择提醒截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9bbc3381ad2496a9f08fc67a0d3f34b~tplv-k3u1fbpfcp-zoom-1.image)

### 上传你自己的照片

![步骤二上传你自己的照片截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/459a6f183e994b4aa032f9069ff4af7d~tplv-k3u1fbpfcp-zoom-1.image)

### 定制您的外观

![步骤三定制您的外观截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9805fc6d7a04a4aa94db951b5eedce7~tplv-k3u1fbpfcp-zoom-1.image)

### 下载您的模型

![下载您的模型截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c49663ab40d4876ad7215285d97e9ca~tplv-k3u1fbpfcp-zoom-1.image)

## 在 React 中渲染模型

为了在 react 程序中渲染这个模型，我们将使用 [**react-three-fiber**](https://github.com/pmndrs/react-three-fiber)** 一个**Threejs **React 渲染器**

### 项目开发

首先让我们创建一个项目

```shell
npx create-react-app my-3d-model
#or
yarn create react-app my-3d-model
```

然后安装 [**@react-three/fiber**](https://github.com/pmndrs/react-three-fiber) 和 [**@react-three/drei**](https://github.com/pmndrs/drei)

```shell
npm install three @react-three/fiber @react-three/drei
#or
yarn add three @react-three/fiber @react-three/drei
```

### 将模型转换为 React 组件

完成之后，继续并运行以下命令，使用 [**gltfjsx**](https://github.com/pmndrs/gltfjsx) 转换成 react 组件格式。

```shell
npx gltfjsx model.glb
```

转换后的内容类似于以下代码

```javascript
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/model.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={nodes.EyeLeft.material}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={nodes.EyeRight.material}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  )
}

useGLTF.preload('/model.glb')
```

### 创建场景

```javascript
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export default function App() {
  return (
    <Canvas
      camera={{ position: [2, 0, 12.25], fov: 15 }}
      style={{
        backgroundColor: '#111a21',
        width: '100vw',
        height: '100vh',
      }}
    >
      <ambientLight intensity={1.25} />
      <ambientLight intensity={0.1} />
      <directionalLight intensity={0.4} />
      <Suspense fallback={null}>// your model here</Suspense>
      <OrbitControls />
    </Canvas>
  )
}
```

### 将模型添加到场景中

首先将模型 (glb 文件) 添加到 **public**文件夹下，使用 [**gltfjsx**](https://github.com/pmndrs/gltfjsx) 生成的文件将其放入 src 下的 components 文件夹

```javascript
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from './Model' /* highlight-line */

export default function App() {
  return (
    <Canvas
      camera={{ position: [2, 0, 12.25], fov: 15 }}
      style={{
        backgroundColor: '#111a21',
        width: '100vw',
        height: '100vh',
      }}
    >
      <ambientLight intensity={1.25} />
      <ambientLight intensity={0.1} />
      <directionalLight intensity={0.4} />
      <Suspense fallback={null}>
        <Model position={[0.025, -0.9, 0]} /> /* highlight-line */
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}
```

修改 app.js

```css
body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
```

添加 css

**结果展示** [codesandbox.io](https://codesandbox.io/s/bold-wing-9w9n3i?file=/src/Model.js)

## 给模型添加动画

给 3D 模型添加动画, 需要在你的电脑上安装 [**blender**](https://www.blender.org)

### 将模型导入到 blender

Blender 是免费的开源 3D 软件，它支持整个 3D 管道建模、索具、动画、模拟、渲染、合成和运动跟踪，甚至视频编辑和游戏创作，[**了解更多信息**](https://www.blender.org/about/)。

#### 创建一个新的 blender 项目

![创建一个新的blender项目截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/785495feab1b404f8c56270d3de3ee07~tplv-k3u1fbpfcp-zoom-1.image)

#### 删除所有对象中的物体

![删除所有对象中的物体截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/386010f5dbe24324971ae93b71cb4d6e~tplv-k3u1fbpfcp-zoom-1.image)

#### 将 glb 文件导入 blender

![将 glb 文件导入 blender截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0fbeb8c301e145c38435479e3c10e9af~tplv-k3u1fbpfcp-zoom-1.image)

![将 glb 文件导入 blender第二步截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0fbeb8c301e145c38435479e3c10e9af~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45b1b6e69ab84befa112d6be2d0c0469~tplv-k3u1fbpfcp-zoom-1.image)

选择您的模型，然后单击 `Import glTF 2.0`

![选择模型导入截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d31881d006854150b0391b16fce6533c~tplv-k3u1fbpfcp-zoom-1.image)

### 将模型转换为 fbx 格式

在将添加任何动画添加到我们的模型之前，我们需要首先将其转换为**FBX**格式。

#### 选择模型

要在 blender 中选择 3D 模型，只需单击键盘`a`或者您可以使用**鼠标**选择。

![选择 3D 模型](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b73b2610c01546e8ba7292988a9aa6a8~tplv-k3u1fbpfcp-zoom-1.image)

#### 将模型导出为 FBX

![将模型导出为FBX第一步](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e03e80de7118442e98ca27e9dbf7889c~tplv-k3u1fbpfcp-zoom-1.image)

![将模型导出为FBX第二步](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67eade047b064edebf634433620e140f~tplv-k3u1fbpfcp-zoom-1.image)

确保选择的 `Path Mode` 是 `Copy`, 然后点击 `Embed textures` 这个选项.

### 添加动画 [mixamo](https://www.mixamo.com)

[**Mixamo**](https://www.mixamo.com) 是一项免费的在线服务，用于自动装配和动画 3d 角色.它由 Mixamo 公司开发， 由 Adobe 于 2015 年收购。Mixamo 允许用户上传 FBX、OBJ 或 Zip 文件，然后网站尝试在两分钟内自动操纵角色。

#### 将模型上传到 mixamo

![将模型上传到 mixamo 截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/213a0e6a661c4137a12596ec351db55c~tplv-k3u1fbpfcp-zoom-1.image)

![将模型上传到 mixamo 截图第二步](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b469ef24383c4912997c35ab92871922~tplv-k3u1fbpfcp-zoom-1.image)

#### 选择动画并下载动画模型

![选择动画](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c4b49497d1a435591e54364cb942422~tplv-k3u1fbpfcp-zoom-1.image)

![下载动画模型](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/679dda70a0cb4a99b96c41cb8b6d6348~tplv-k3u1fbpfcp-zoom-1.image)

### 将动画模型转换回 glb 格式

为了能够在 react 中使用需要转换会 **glb** 格式。

#### 将动画模型导入 blender

![将动画模型导入 blender 截图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b08b87efa7d4ee29fe24d580ba0db58~tplv-k3u1fbpfcp-zoom-1.image)

#### 将动画模型导出为 glb

![将动画模型导出为 glb](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cc63717d1ab4705bcae5c8a5e2c8539~tplv-k3u1fbpfcp-zoom-1.image)

### 在 react 中渲染动画模型

在 public 文件夹下替换这个 `model.glb` 文件使用动画模型 ，然后在 `src/Model.js` 修改以下代码.

```javascript
import React, { useRef, useEffect } from 'react' /* highlight-line */
import { useGLTF, useAnimations } from '@react-three/drei' /* highlight-line */

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/model.glb')

  const { actions } = useAnimations(animations, group) /* highlight-line */

  // 'Armature|mixamo.com|Layer0' is the name of the animation we need to run.
  // console.log(actions);

  useEffect(() => {
    /* highlight-line */
    actions['Armature|mixamo.com|Layer0'].play() /* highlight-line */
  }) /* highlight-line */

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={nodes.EyeLeft.material}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={nodes.EyeRight.material}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  )
}

useGLTF.preload('/model.glb')
```

**最终展示效果**

![最终展示效果.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a1f96b206e945d2a4cc5134c1c8b888~tplv-k3u1fbpfcp-watermark.image?)

源码链接

[https://codesandbox.io/s/3d-model-animation-d41e9u](https://codesandbox.io/s/3d-model-animation-d41e9u?file=/src/Model.js:271-281)

---

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/use-threejs-and-react-to-render-a-3d-model-of-your-self)
