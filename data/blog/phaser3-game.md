---
title: '使用 phaser3 从零实现一个战疫小游戏'
date: '2022/4/14'
lastmod: '2022/4/14'
tags: [游戏]
draft: false
summary: ''
images: []
authors: ['default']
layout: PostLayout
---

## 前言

在本文中，我将从零开发一个 H5 游戏，主要使用 phaser3 来制作的游戏。结合当下疫情的严峻形式，我也将一些元素融入到这款游戏中，同时希望疫情早日结束，早点摘下口罩，可以看到彼此脸上洋溢的笑容。

- 元素一：出门要戴口罩
- 元素二：为生活打拼，是收集粮食
- 元素三：奋勇平博，要打死恶魔怪物，与各种黑势力做斗争

单纯从这款游戏看，认为不是很好玩，因为我并没有设计过多的关卡，但看这篇文章，绝对是一篇很好的教程，通过阅读本篇文章，你可以掌握 H5 游戏开发的整体流程，从而也能够快速开发出一款类似的 RPC 游戏。让我们先来看下效果吧！

<iframe src="https://game.runjs.cool/" width="100%" height="400"/>

演示地址：https://game.runjs.cool/

代码仓库：https://github.com/maqi1520/phaser3-game

## 使用技术栈

- Phaser: 游戏引擎
- Vite: 项目脚手架，可快速启动 web 开发服务器，可以快速热更新
- Typescript: 使用 ts 可以有非常强大类型提示功能，可以减少我们查 api 文档的次数

## Phaser 简介

Phaser 是一个开源的 JavaScript 2D 游戏开发框架。它使用了 Canvas 和 WebGL 来渲染我们的游戏，同时我们又不必直接使用 canvas 和 WebGL 的 api，它封装了大量时候游戏开发的类和方法，非常易于入门，对于那些希望使用 JS 来开发游戏的人来说，是一个很好的选择。

## 初始化工程

```bash
yarn create vite@latest game-phaser3 --template vanilla-ts

yarn add phaser

cd game-phaser3

mkdir public/assets src src/classes src/scenes
```

使用 `vite` 创建一个原生的 `typescript` 模板，并且安装`phaser`,

- `assets` — 用于存放游戏素材，关于游戏素材，我们可以在游戏共享网站，如：[itch.io](https://itch.io/) 上面下载。
- `classes` — 用于存放游戏角色怪物等单独的类
- `scenes` — 用于存放游戏场景

## 初始化游戏

接下来我们需要在 `src/index.ts` 中初始化一个游戏对象

```typescript
import { Game, Types, WEBGL } from 'phaser'
import { LoadingScene } from './scenes'

export const gameConfig: Types.Core.GameConfig = {
  type: WEBGL,
  parent: 'app',
  backgroundColor: '#9bd4c3',
  scale: {
    mode: Scale.ScaleModes.NONE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
  callbacks: {
    postBoot: () => {
      sizeChanged()
    },
  },
  canvasStyle: `display: block; width: 100%; height: 100%;`,
  autoFocus: true,
  audio: {
    disableWebAudio: false,
  },
  scene: [LoadingScene, GameScene, UIScene],
}

window.game = new Game(gameConfig)
```

- `type`： 游戏渲染类型，可以是 `CANVAS`、 `WEBGL` 或 `AUTO`，许多效果可能在 `CANVAS` 模式下不支持， 所以我们使用 `WEBGL`

- `parent`: 游戏渲染 canvas 元素的父级 DOM ID

- `backgroundColor`：canvas 的背景颜色

- `scale`： 调整游戏画布大小的比例。

- `physics`：设定游戏物理引擎

- `render`：游戏渲染的附加属性

- `callbacks`：将在游戏初始化之前(preBoot)或之后(postBoot)触发的回调

- `canvasStyle`：canvas 元素的 CSS 样式
- `autoFocus`：游戏画布上的自动对焦

- `audio`： 游戏音频设置

- `scene`：游戏中要加载的场景列表。

window 没有 game 对象，需要在 `vite-env.d.ts` 中扩展 window 对象

```ts
interface Window {
  game: Phaser.Game
}
```

添加一个方法，让浏览器缩放的时候可以自适应

```ts
function sizeChanged() {
  if (window.game.isBooted) {
    setTimeout(() => {
      window.game.scale.resize(window.innerWidth, window.innerHeight)

      window.game.canvas.setAttribute(
        'style',
        `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`
      )
    }, 100)
  }
}

window.onresize = () => sizeChanged()
```

## 新建一个场景

游戏是有许多场景组成的，一款游戏至少添加一个场景，通常会把游戏场景分为三个 loading、game 和 UI

- loading 场景用于加载游戏资源
- game 场景是游戏的主要部分，可以分为多个
- UI 场景用于页面 UI 元素，文字提示等

下面代码是以简单的场景实例

```ts
import { Scene } from 'phaser'
export class LoadingScene extends Scene {
  constructor() {
    super('loading-scene')
  }
  init(data) {}
  preload() {
    this.load.baseURL = 'assets/'
    this.load.image('king', 'sprites/king.png')
  }
  create(data): void {
    this.add.sprite(100, 100, 'king')
  }
  update(time, delta) {}
}
```

场景也有生命周期函数

- init： 场景初始化执行
- preload： 在场景加载前，需要加载什么资源
- create： 场景被创建的时候触发
- update：场景每个渲染帧更新时触发（大约每秒 60 帧）

运行 `yarn dev` 启动，至此，你应该可以在浏览器看到如下效果

![第一个场景](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/938534cf6faf412d8ec3ae1457e667a1~tplv-k3u1fbpfcp-watermark.image?)

## 创建角色

场景搭建好了，接下来英雄就该出场了，建立 `src/classes/player.ts`文件

```ts
import { Physics } from 'phaser'

export class Player extends Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'king')
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setSize(30, 30)
    this.body.setOffset(8, 0)
    this.cursors = this.scene.input.keyboard.createCursorKeys()
  }

  protected checkFlip(): void {
    if (this.body.velocity.x < 0) {
      this.scaleX = -1
    } else {
      this.scaleX = 1
    }
  }
  update(): void {
    this.setVelocity(0)

    if (this.cursors.up.isDown) {
      this.body.velocity.y = -110
    }

    if (this.cursors.left.isDown) {
      this.body.velocity.x = -110
      this.checkFlip()
      this.setOffset(48, 15)
    }

    if (this.cursors.down.isDown) {
      this.body.velocity.y = 110
    }

    if (this.cursors.right.isDown) {
      this.body.velocity.x = 110
      this.checkFlip()
      this.setOffset(15, 15)
    }
  }
}
```

**键盘事件**

Player 继承`Physics.Arcade.Sprite`类，在实例化中传入坐标 x、 y 和资源 ID，
通过 `this.scene.input.keyboard.createCursorKeys` 获得键盘方向键，当方向键被按下时，改变 Player x 、y 方向上的速度。

在添加一个场景 game `src/scenes/game.ts`

```ts
import { Scene } from 'phaser'
import { Player } from '../../classes/Player'

export class GameScene extends Scene {
  private player!: Player
  constructor() {
    super('game-scene')
  }

  create(): void {
    this.player = new Player(this, 100, 100)
  }

  update(): void {
    this.player.update()
  }
}
```

初始化一个英雄 PLayer，在 update 函数中调用 player 的 update 方法。

然后修改 loading 场景中的 create 方法，从 loading 场景过度到 game 场景。

```ts
create(): void {
   this.scene.start("game-scene");
}
```

至此，我们就可以通过键盘方向控制英雄了。
![2022-04-13 13-41-22.2022-04-13 13_42_23.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/954dabb3ca2541d6b734133c5c675b7d~tplv-k3u1fbpfcp-watermark.image?)

## 使用 Tiled 画出瓦片地图

接下来就是地图了， 我们先需要下载 Tiled （免费），来创建游戏地图

![Tiled 创建地图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/159ad908f7a74adabbed1b0725f3bbd2~tplv-k3u1fbpfcp-watermark.image?)

首先新建项目，图库层必须选择 CSV ，不然 phaser3 无法解析。

![Tiled 创建地图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a54e588c961f4bae9a7ec2e82b83b92d~tplv-k3u1fbpfcp-watermark.image?)

接下来建立图块集，注意必须要选择嵌入地图，不然也无法解析。

![Tiled 创建地图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27b44b1b6ebb4ea88d59e38aa0b53def~tplv-k3u1fbpfcp-watermark.image?)

Tiled 分为属性区，图层区和图块区， 可以先`commond+A`选择图块，然后通过图章工具和矩形工具等自由的设计游戏地图，

为了不让角色移动到地图外部，将图层分为`Ground`和 `Walls`。

![Tiled 创建地图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93ed21f8658f45a4856eb90b9a21d075~tplv-k3u1fbpfcp-watermark.image?)
为了不让角色怪物等运动对象离开地图，我们徐要编辑图块属性。

![Tiled 创建地图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96327765339a4357a815ef609f27db2d~tplv-k3u1fbpfcp-watermark.image?)
在一些图块上设置自定义属性 `collides` 为 `true`，后面代码可以这个属性开启碰撞检测。

**添加怪物和食物的锚点**

![Tiled 创建地图](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/684dcd2b31614cb7b3cda0fbc966c63c~tplv-k3u1fbpfcp-watermark.image?)

右键新建对象层重命名成 `Enimes` 添加一些锚点，这些锚点位置可以在游戏中渲染成怪物的点，同理也需要添加一些食物的点。

![Tiled 创建地图](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38b6148e346d4760a6c10ba4b33a7a6f~tplv-k3u1fbpfcp-watermark.image?)

选择对象层，锚点可以修改名称，根据名称，我们可以渲染出不同的对象。

最后一步将文件导出成 JSON， 到我们的 assets 文件夹下，. **文件 -> 导出为 … -> format .json.** ，至此游戏题图创建成功！

## 加载瓦片地图

地图设计好了，接下来就需要在游戏中渲染我们的地图。

首先在 loading 场景中 preload 方法中加载资源。

```ts
this.load.image({
  key: 'Grass',
  url: 'tilemaps/json/Grass.png',
})

this.load.tilemapTiledJSON('tilemapGrass', 'tilemaps/json/Grass.json')

this.load.spritesheet('water', 'spritesheets/Water.png', {
  frameWidth: 64,
  frameHeight: 16,
})
```

然后在 game 中添加一个 `initMap` 方法，用于初始化地图

```ts
private initMap(): void {
   //添加水作为背景
   this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, "water");
   this.map = this.make.tilemap({
     key: "tilemapGrass",
     tileWidth: 16,
     tileHeight: 16,
   });
   this.tileset = this.map.addTilesetImage("Grass", "Grass");// 第一个参数是图块名称，第二个参数是图片的 key
   this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
   this.wallsLayer = this.map.createLayer("Walls", this.tileset, 0, 0);
   // 通过图块属性设置墙，碰撞属性开启
   this.wallsLayer.setCollisionByProperty({ collides: true });
   // 设置世界的边缘
   this.physics.world.setBounds(
     0,
     0,
     this.wallsLayer.width,
     this.wallsLayer.height
   );
 }
```

**注意**这里 `addTilesetImage` 的第一个名称必须是和设计时的图块名称相同。

然后在 create 方法中初始化地图。

```ts
create(): void {
  this.initMap();
  this.player = new Player(this, 100, 100);
}
```

在 phaser 中,函数执行也有先后顺序，先执行的方法优先渲染，在底部。所以这里要先加载地图， 再初始化 Player 对象。

至此你可以看到一个英雄在游戏场景中了。

![phaser 游戏效果](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e536822e221a4d2ba3c14d7275c67f91~tplv-k3u1fbpfcp-watermark.image?)

## 碰撞检测

但是移动角色，角色会走到水中，因此我们就需要开启碰撞检测，

在 create 方法中，添加如下代码开启碰撞检测，这样英雄就无法通过键盘走出到水中。

```js
this.physics.add.collider(this.player, this.wallsLayer)
```

为了防止在设计地图时候，一些图块遗留设置 `collides` 属性，我们可以将碰撞的墙设置为高亮，这样可以方便调试.

```ts
private initMap(): void {
    ...
    this.showDebugWalls();
}
...
private showDebugWalls(): void {
  const debugGraphics = this.add.graphics().setAlpha(0.7);
  this.wallsLayer.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(24, 234, 48, 255),
  });
}
```

效果如下:

![phaser 游戏效果](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ae89c2265524326a2f662905646b222~tplv-k3u1fbpfcp-watermark.image?)

## 使用精灵图创建逐帧动画

当前我们的英雄是静态的，想让我们的英雄移动的时候跑起来，我们可以使用精灵图，先来看下我们的精灵图，特意给精灵图加上了**口罩**。

![phaser 游戏效果](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76108f2f7a6348fcb488165f7f6f4a3e~tplv-k3u1fbpfcp-watermark.image?)

还需要加载一个描述精灵图的 json ，我们一起来看下 json 的数据结构

![phaser 游戏效果](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f9b3926ac3447dbaa3be8ed844d2ee2~tplv-k3u1fbpfcp-watermark.image?)

JSON 描述了精灵图每一帧的位置和中心点，当然这个 JSON 不是手写的，我们可以借助 `Texture Packer` 这个工具打包生成。

在 preload 中加载精灵图和 json

```js
···
this.load.atlas(
      "a-king",
      "spritesheets/a-king_withmask.png",
      "spritesheets/a-king_atlas.json"
    );
···
```

然后在 player.js 中加载初始化动画

```ts
constructor(scene: Phaser.Scene, x: number, y: number) {
  ...
   this.initAnimations();
 }

 private initAnimations(): void {
   this.scene.anims.create({
     key: "run",
     frames: this.scene.anims.generateFrameNames("a-king", {
       prefix: "run-",
       end: 7,
     }),
     frameRate: 8,
   });

   this.scene.anims.create({
     key: "attack",
     frames: this.scene.anims.generateFrameNames("a-king", {
       prefix: "attack-",
       end: 2,
     }),
     frameRate: 8,
   });
 }
```

最后在 update 函数中，待方向键按下就调用动画。

```js
update(): void {
    this.setVelocity(0);

    if (this.cursors.up.isDown) {
      this.body.velocity.y = -110;
      !this.anims.isPlaying && this.anims.play("run", true);
    }
    ...
    if (this.cursors.space.isDown) {
      this.anims.play("attack", true);
    }
}
```

至此角色的动画成功！

![2022-04-13 16-49-25.2022-04-13 16_50_09.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/440921ce4218453c977264f94fa77f87~tplv-k3u1fbpfcp-watermark.image?)

## 创建怪物

如同 Player 一样，我们可以创建一个相同的类，命名成 Enemy，用来写怪物的逻辑。只不过需要加载不同的精灵图资源。
还有一点不同的是，怪物的行动不是由键盘控制的，而是自动的。所以我们需要实现下怪物自动跑的逻辑。

怪物自动运动主要有以下两点：

- 怪物未发现角色的时候，会在原地走来走去。
- 发现英雄的时候怪会追英雄，其**原理**就是判断怪物和玩家的距离，小于一定值，就设置下怪物的移动速度。

```ts
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}
//  随机生成不同的方向
const randomDirection = (exclude: Direction) => {
  let newDirection = Phaser.Math.Between(0, 3);
  while (newDirection === exclude) {
    newDirection = Phaser.Math.Between(0, 3);
  }

  return newDirection;
};

...
// 每隔2秒改变怪物行走的方向
this.moveEvent = this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.direction = randomDirection(this.direction);
      },
      loop: true,
    });

...
```

```ts
private AGRESSOR_RADIUS = 100;

preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt);
    // 距离小于100 ，设置一个速度
    if (
      Math.Distance.BetweenPoints(
        { x: this.x, y: this.y },
        { x: this.target.x, y: this.target.y }
      ) < this.AGRESSOR_RADIUS
    ) {
      this.getBody().setVelocityX(this.target.x - this.x);
      this.getBody().setVelocityY(this.target.y - this.y);
    } else {
       // 大于100 在上下左右随机走到
      const speed = 50;

      switch (this.direction) {
        case Direction.UP:
          this.getBody().setVelocity(0, -speed);
          break;

        case Direction.DOWN:
          this.getBody().setVelocity(0, speed);
          break;

        case Direction.LEFT:
          this.getBody().setVelocity(-speed, 0);
          break;

        case Direction.RIGHT:
          this.getBody().setVelocity(speed, 0);
          break;
      }
    }
  }

```

在 `preUpdate` 函数中设置怪物自动走动的逻辑，距离小于 100 ，设置朝英雄一个速度，大于 100，随机 4 个方向自动走动。

## 根据锚点渲染怪物

接下来我们需要根据地图上创建的锚点实例化怪物。在 Game 场景中添加一个 `initEnemies` 方法用于初始化怪物。

```ts
private initEnemies(): void {
//  过去地图上的 EnemyPoint 点
    const enemiesPoints = this.map.filterObjects(
      "Enemies",
      (obj) => obj.name === "EnemyPoint"
    );
    // 实例化怪物
    this.enemies = enemiesPoints.map(
      (enemyPoint) =>
        new Enemy(
          this,
          enemyPoint.x as number,
          enemyPoint.y as number,
          "lizard",
          this.player
        )
    );
    //  怪物和墙增加碰撞检查
    this.physics.add.collider(this.enemies, this.wallsLayer);
    // 怪物和怪物增加碰撞检查
    this.physics.add.collider(this.enemies, this.enemies);
    // 怪物和角色增加碰撞检查
    this.physics.add.collider(
      this.player,
      this.enemies,
      (obj1, obj2) => {
          //碰撞后的回调，角色收到伤害 -1
        (obj1 as Player).getDamage(1);
      },
      undefined,
      this
    );
  }
```

这里需要注意碰撞检查和碰撞后的回调
到此，我们可以在地图上创建角色和怪物，并且怪物可以攻击英雄了，但我们的英雄攻击怪物，却打不死。

![2022-04-13 17-54-50.2022-04-13 17_55_52.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c9d1c44d003b4693bad6a05d9fba5f13~tplv-k3u1fbpfcp-watermark.image?)

## 事件通知

因此我们需要给怪物添加事件监听，当怪物和角色的距离小于角色的宽度，说明击中

```ts
this.attackHandler = () => {
  if (
    Math.Distance.BetweenPoints({ x: this.x, y: this.y }, { x: this.target.x, y: this.target.y }) <
    this.target.width
  ) {
    this.getDamage()
    this.disableBody(true, false) // 停止怪物对象主体，但不消失

    this.scene.time.delayedCall(300, () => {
      this.destroy() // 300 毫秒后消失
    })
  }
}

// EVENTS
this.scene.game.events.on(EVENTS_NAME.attack, this.attackHandler, this)
//销毁后取消监听
this.on('destroy', () => {
  this.scene.game.events.removeListener(EVENTS_NAME.attack, this.attackHandler)
})
```

当按需键盘空格键，就播放 Player 的工具动画，并且发送一个全局事件

```js
if (this.cursors.space.isDown) {
  this.anims.play('attack', true)
  this.scene.game.events.emit(EVENTS_NAME.attack)
}
```

## 根据锚点显示食物

与渲染怪物类似，我们可以在地图上渲染一些食物。

![phaser 游戏效果](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d12bfc4927b84e739ab3d93f85c66b6b~tplv-k3u1fbpfcp-watermark.image?)

这些素材是通过 iconfont 上下载的，下载后通过 figma 拼接成精灵图。

```ts
private initChests(): void {
    const chestPoints = this.map.filterObjects(
      "Chests",
      (obj) => obj.name === "ChestPoint"
    );

    this.chests = chestPoints.map((chestPoint) =>
      this.physics.add
        .sprite(
          chestPoint.x as number,
          chestPoint.y as number,
          "food",
          Math.floor(Math.random() * 8)
        )
        .setScale(0.5)
    );

    this.chests.forEach((chest) => {
      this.physics.add.overlap(this.player, chest, (obj1, obj2) => {
        this.game.events.emit(EVENTS_NAME.chestLoot);
        obj2.destroy();
      });
    });
  }
```

同怪物一样根据锚点先渲染出食物，不同的是当英雄和食物碰撞检测的回调不同，当英雄与食物重合，玩家可以获得 10 分

## 文本显示

现在让我们在角色头部上方显示一个 HP 值。

```js
import { Text } from './text';
...
private hpValue: Text;
...
this.hpValue = new Text(this.scene, this.x, this.y - this.height, this.hp.toString())
  .setFontSize(12)
  .setOrigin(0.8, 0.5);
...
update() {
	...
  this.hpValue.setPosition(this.x, this.y - this.height * 0.4);
  this.hpValue.setOrigin(0.8, 0.5);
}
...
public getDamage(value?: number): void {
  super.getDamage(value);
  this.hpValue.setText(this.hp.toString());
}
```

现在 HP 值将显示在游戏角色的上方，在 update 方法中，我们更新了 HP 文本值的位置，这样即使 PLayer 移动也不会有问题。

![phaser 游戏效果](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c0302c22626401ba54c45237186af6e~tplv-k3u1fbpfcp-watermark.image?)

## UI 显示

最后我们来添加一个 UI 场景，用于显示系统提示。

```ts
import { Scene } from 'phaser'

import { EVENTS_NAME, GameStatus } from '../../consts'
import { Score, ScoreOperations } from '../../classes/score'
import { Text } from '../../classes/text'
import { gameConfig } from '../../'

export class UIScene extends Scene {
  private score!: Score
  private gameEndPhrase!: Text

  private chestLootHandler: () => void
  private gameEndHandler: (status: GameStatus) => void

  constructor() {
    super('ui-scene')

    this.chestLootHandler = () => {
      this.score.changeValue(ScoreOperations.INCREASE, 10)

      if (this.score.getValue() === gameConfig.winScore) {
        this.game.events.emit(EVENTS_NAME.gameEnd, 'win')
      }
    }

    this.gameEndHandler = (status) => {
      this.cameras.main.setBackgroundColor('rgba(0,0,0,0.6)')
      this.game.scene.pause('game-scene')

      this.gameEndPhrase = new Text(
        this,
        this.game.scale.width / 2,
        this.game.scale.height * 0.4,
        status === GameStatus.LOSE ? `失败!\n\n点击屏幕重新开始` : `胜利!\n\n点击屏幕重新开始`
      )
        .setAlign('center')
        .setColor(status === GameStatus.LOSE ? '#ff0000' : '#ffffff')

      this.gameEndPhrase.setPosition(
        this.game.scale.width / 2 - this.gameEndPhrase.width / 2,
        this.game.scale.height * 0.4
      )

      this.input.on('pointerdown', () => {
        this.game.events.off(EVENTS_NAME.chestLoot, this.chestLootHandler)
        this.game.events.off(EVENTS_NAME.gameEnd, this.gameEndHandler)
        this.scene.get('game-scene').scene.restart()
        this.scene.restart()
      })
    }
  }

  create(): void {
    this.score = new Score(this, 20, 20, 0)

    this.initListeners()
  }

  private initListeners(): void {
    this.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler, this)
    this.game.events.once(EVENTS_NAME.gameEnd, this.gameEndHandler, this)
  }
}
```

在 loading 场景中和 game 场景一起加载。

```ts
···
this.scene.start("game-scene");
this.scene.start("ui-scene");
···
```

这样等英雄的 HP 只为 0 时候，屏幕会显示“失败”

![phaser 游戏效果](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ddc35de0dc043d8a664f9aaf56c3763~tplv-k3u1fbpfcp-watermark.image?)

## 部署

我使用 vercel 部署，只需要上传 github，vercel 就会自动部署，然后域名 CNAME 到 cname.vercel-dns.com 就可以了。

演示地址：https://game.runjs.cool/

代码仓库：https://github.com/maqi1520/phaser3-game

同理我还部署了以下应用

https://editor.runjs.cool/ MDX 排版编辑器
https://cv.runjs.cool/ 在线简历生成器
https://low-code.runjs.cool/ 简易版低代码平台
并且都是开源的，若对你有帮助记得点个 star，感谢！

## 小结

至此 Phaser 3 小游戏开发完成了 90%， 剩下的 10 % 需要我们继续打磨和优化，这样才可以让游戏更好玩，还需要设计更多的关卡，通过关卡了来让用户更有成就感。通过本文，我们从零实现了一个 Phaser.js 开发 H5 游戏。包括精灵图，精灵表，设计地图，动画、碰撞检查、事件通知等。

相信通过以上的学习，在以后的工作中，对类似的 H5 游戏，有一定认知，并且能够快速开发出一款小游戏。

## 最后

感谢[@大帅老猿](https://juejin.cn/user/2955079655898093/posts 'https://juejin.cn/user/2955079655898093/posts')帮忙设计的口罩精灵图， 大帅还创建了“猿创营”，群里有很多开发大佬可以互相帮忙答疑和交流技术，同时大帅还会分享做外包，搞副业等，感兴趣的小伙伴可以留言“入群”。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

本文首发掘金平台，来源[小马博客](https://maqib.cn/blog/phaser3-game)
