// WALKMAN '26 —— 3D 模型与机械动画
// 横置磁带机身，造型尽可能复刻 Teenage Engineering TP-7：
// 白色涂装铝一体机身、尖锐切边、侧边实体传输键、橙色滚轮、微型点阵屏、外露螺丝
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { tween, tweenAsync, Ease, lerp, damp } from './tween.js'

// 松键回弹：单次过冲 ~25% 再落回，模拟机械键簧
const easeKeyRelease = (t) => {
  const c1 = 2.6,
    c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

const C = {
  body: 0xedeff0,
  shell: 0xf6f5f1,
  ink: 0x141517,
  cavity: 0x0c0d0f,
  tape: 0x1c1916,
  hub: 0xf2f1ec,
  orange: 0xff6a1a,
  amber: 0xff8a3d,
}

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape()
  const x = -w / 2,
    y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}

function roundedRectPath(w, h, r, cx = 0, cy = 0) {
  const p = new THREE.Path()
  const x = cx - w / 2,
    y = cy - h / 2
  p.moveTo(x + r, y)
  p.lineTo(x + w - r, y)
  p.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  p.lineTo(x + w, y + h - r)
  p.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  p.lineTo(x + r, y + h)
  p.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  p.lineTo(x, y + r)
  p.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return p
}

function iconMesh(kind, size, color) {
  const shapes = []
  const tri = (dx = 0, dir = 1) => {
    const s = new THREE.Shape()
    s.moveTo(dx - 0.5 * size * dir, -0.58 * size)
    s.lineTo(dx - 0.5 * size * dir, 0.58 * size)
    s.lineTo(dx + 0.62 * size * dir, 0)
    s.closePath()
    return s
  }
  const rect = (cx, cy, w, h) => {
    const s = new THREE.Shape()
    s.moveTo(cx - w / 2, cy - h / 2)
    s.lineTo(cx + w / 2, cy - h / 2)
    s.lineTo(cx + w / 2, cy + h / 2)
    s.lineTo(cx - w / 2, cy + h / 2)
    s.closePath()
    return s
  }
  if (kind === 'play') shapes.push(tri(0.06 * size, 1))
  else if (kind === 'pause') {
    shapes.push(rect(-0.3 * size, 0, 0.32 * size, 1.1 * size))
    shapes.push(rect(0.3 * size, 0, 0.32 * size, 1.1 * size))
  } else if (kind === 'stop') shapes.push(rect(0, 0, 0.95 * size, 0.95 * size))
  else if (kind === 'ff') {
    shapes.push(tri(-0.42 * size, 1))
    shapes.push(tri(0.52 * size, 1))
  } else if (kind === 'rew') {
    shapes.push(tri(0.42 * size, -1))
    shapes.push(tri(-0.52 * size, -1))
  } else if (kind === 'eject') {
    const t = new THREE.Shape()
    t.moveTo(-0.55 * size, 0.02 * size)
    t.lineTo(0.55 * size, 0.02 * size)
    t.lineTo(0, 0.75 * size)
    t.closePath()
    shapes.push(t)
    shapes.push(rect(0, -0.38 * size, 1.1 * size, 0.24 * size))
  }
  const geo = new THREE.ShapeGeometry(shapes)
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  return new THREE.Mesh(geo, mat)
}

function textPlane(text, w, h, opts = {}) {
  const px = 110
  const cv = document.createElement('canvas')
  cv.width = Math.round(w * px)
  cv.height = Math.round(h * px)
  const c = cv.getContext('2d')
  c.fillStyle = opts.bg || 'rgba(0,0,0,0)'
  c.fillRect(0, 0, cv.width, cv.height)
  c.fillStyle = opts.color || '#8b8e94'
  c.font = `${opts.weight || 500} ${Math.round((opts.size || 0.3) * px)}px ${
    opts.font || '"Space Grotesk", "Helvetica Neue", sans-serif'
  }`
  c.textAlign = opts.align || 'center'
  c.textBaseline = 'middle'
  const tx = opts.align === 'left' ? 0 : cv.width / 2
  c.fillText(text, tx, cv.height / 2 + (opts.dy || 0))
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: opts.opacity ?? 1 })
  )
}

// TE 极简风磁带标签
function drawCassetteLabel(cv, name) {
  const c = cv.getContext('2d')
  const W = cv.width,
    H = cv.height
  c.clearRect(0, 0, W, H)
  c.fillStyle = '#eeede8'
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#ff6a1a'
  c.fillRect(0, 0, W, H * 0.09)
  c.fillStyle = '#141414'
  c.textBaseline = 'middle'
  c.textAlign = 'left'
  c.font = `600 ${H * 0.34}px "Space Grotesk", "Helvetica Neue", sans-serif`
  c.fillText(String(name).toLowerCase(), W * 0.035, H * 0.42)
  c.textAlign = 'right'
  c.font = `500 ${H * 0.2}px "Space Grotesk", sans-serif`
  c.fillText('side a', W * 0.965, H * 0.4)
  c.fillStyle = 'rgba(20,20,20,0.55)'
  c.textAlign = 'left'
  c.font = `500 ${H * 0.15}px "SF Mono", Menlo, monospace`
  c.fillText('type i · normal bias · 90 min · w–26', W * 0.036, H * 0.8)
  c.strokeStyle = 'rgba(20,20,20,0.25)'
  c.lineWidth = Math.max(1, H * 0.012)
  c.beginPath()
  c.moveTo(W * 0.035, H * 0.62)
  c.lineTo(W * 0.965, H * 0.62)
  c.stroke()
}

export class Walkman {
  constructor(displayTexture) {
    this.group = new THREE.Group()
    this.tapeIn = false // 初始出仓，等待开场插带动画
    this.busy = false
    this.t = 0
    this.hover = null
    this.hitTargets = []
    this._buttons = {}
    this._reelSpeed = 0

    this.bayC = new THREE.Vector2(-1.7, 0.35) // 磁带舱中心

    this._mats()
    this._body()
    this._display(displayTexture)
    this._keys()
    this._roller()
    this._cassette()
    this._door()
    this._detail()

    // 初始姿态：盖子敞开，磁带悬浮在机身前方
    this._setDoor(this.doorOpenAngle)
    this.cassette.position.copy(this.cassetteOutPos)
    this.cassette.rotation.x = -0.12

    this.group.scale.setScalar(0.66)
  }

  _mats() {
    this.matBody = new THREE.MeshStandardMaterial({
      color: C.body,
      metalness: 0.32,
      roughness: 0.4,
    })
    this.matBodyDeep = new THREE.MeshStandardMaterial({
      color: 0xcfd3d6,
      metalness: 0.45,
      roughness: 0.35,
    })
    this.matCavity = new THREE.MeshStandardMaterial({
      color: C.cavity,
      metalness: 0.15,
      roughness: 0.88,
      side: THREE.BackSide,
      envMapIntensity: 0.3,
    })
    this.matShell = new THREE.MeshStandardMaterial({
      color: 0xe9e7e1,
      metalness: 0.04,
      roughness: 0.66,
      envMapIntensity: 0.6,
    })
    this.matTape = new THREE.MeshStandardMaterial({
      color: C.tape,
      metalness: 0.12,
      roughness: 0.4,
    })
    this.matHub = new THREE.MeshStandardMaterial({ color: C.hub, metalness: 0.08, roughness: 0.42 })
    this.matOrange = new THREE.MeshStandardMaterial({
      color: C.orange,
      metalness: 0.5,
      roughness: 0.38,
    })
    this.matAmber = new THREE.MeshStandardMaterial({
      color: C.amber,
      emissive: C.amber,
      emissiveIntensity: 0.45,
      metalness: 0.3,
      roughness: 0.4,
    })
  }

  // 横置机身：尖锐切边的白色板材，左侧开磁带舱
  _body() {
    const W = 11.8,
      H = 7.4,
      D = 1.5,
      BV = 0.06
    this.bodyW = W
    this.bodyH = H
    const shape = roundedRectShape(W, H, 0.5)
    this.bayW = 6.6
    this.bayH = 4.35
    shape.holes.push(roundedRectPath(this.bayW, this.bayH, 0.22, this.bayC.x, this.bayC.y))
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: D,
      curveSegments: 26,
      bevelEnabled: true,
      bevelThickness: BV,
      bevelSize: BV,
      bevelSegments: 2,
    })
    geo.computeBoundingBox()
    const bb = geo.boundingBox
    const halfD = (bb.max.z - bb.min.z) / 2
    geo.translate(0, 0, -(bb.min.z + bb.max.z) / 2)
    this.frontZ = halfD
    this.backZ = -halfD
    this.sideX = W / 2 + BV

    const body = new THREE.Mesh(geo, this.matBody)
    body.castShadow = true
    body.receiveShadow = true
    this.group.add(body)

    // 舱体内腔（略小于舱口的深色内衬，盖住白色孔壁）
    const cavity = new THREE.Mesh(
      new THREE.BoxGeometry(this.bayW - 0.02, this.bayH - 0.02, halfD * 2 - 0.1),
      this.matCavity
    )
    cavity.position.set(this.bayC.x, this.bayC.y, -0.03)
    this.group.add(cavity)
    for (const side of [-1, 1]) {
      const spindle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.26, 20).rotateX(Math.PI / 2),
        this.matBodyDeep
      )
      spindle.position.set(this.bayC.x + side * 1.13, this.bayC.y - 0.35, this.backZ + 0.24)
      this.group.add(spindle)
      for (let i = 0; i < 3; i++) {
        const pin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.045, 0.3, 8).rotateX(Math.PI / 2),
          this.matBodyDeep
        )
        const a = (i / 3) * Math.PI * 2
        pin.position.set(
          this.bayC.x + side * 1.13 + Math.cos(a) * 0.14,
          this.bayC.y - 0.35 + Math.sin(a) * 0.14,
          this.backZ + 0.27
        )
        this.group.add(pin)
      }
    }
  }

  _display(texture) {
    const w = 2.75,
      h = 0.575
    const cx = 3.35,
      cy = 2.42
    const back = new THREE.Mesh(
      new RoundedBoxGeometry(w + 0.2, h + 0.2, 0.08, 2, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x08080a, metalness: 0.3, roughness: 0.45 })
    )
    back.position.set(cx, cy, this.frontZ + 0.01)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: 1.15,
        roughness: 0.35,
        metalness: 0,
      })
    )
    screen.position.set(cx, cy, this.frontZ + 0.056)
    this.group.add(back, screen)
  }

  // 侧边实体键：右缘 REW/PLAY/FF 竖排，左缘 STOP/EJECT（TP-7 式）
  _keys() {
    const defs = [
      { action: 'rew', side: 1, y: 2.1, h: 1.3, icon: 'rew' },
      { action: 'play', side: 1, y: 0.42, h: 1.72, icon: 'play', accent: true },
      { action: 'ff', side: 1, y: -1.32, h: 1.3, icon: 'ff' },
      { action: 'stop', side: -1, y: 1.55, h: 1.3, icon: 'stop' },
      { action: 'eject', side: -1, y: -0.15, h: 1.3, icon: 'eject' },
    ]
    for (const d of defs) {
      const g = new THREE.Group()
      g.position.set(d.side * this.sideX, d.y, 0)
      g.userData.action = d.action
      g.userData.pressAxis = -d.side

      const pressGroup = new THREE.Group()
      const capMat = new THREE.MeshStandardMaterial({
        color: C.body,
        metalness: 0.32,
        roughness: 0.36,
        emissive: 0x000000,
      })
      const key = new THREE.Mesh(new RoundedBoxGeometry(0.6, d.h, 0.94, 2, 0.06), capMat)
      key.position.x = d.side * 0.08
      key.castShadow = true
      pressGroup.add(key)

      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, d.h + 0.4, 1.6),
        new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
      )
      hit.position.x = d.side * 0.3
      pressGroup.add(hit)

      g.add(pressGroup)
      g.userData.pressGroup = pressGroup
      g.userData.capMat = capMat
      this.group.add(g)
      this._buttons[d.action] = g
      this.hitTargets.push(g)

      // 前面板丝印图标（对应侧键位置）
      const ic = iconMesh(d.icon, 0.15, d.accent ? C.orange : C.ink)
      ic.position.set(d.side * (this.bodyW / 2 - 0.4), d.y, this.frontZ + 0.011)
      this.group.add(ic)
    }
  }

  // 右缘下方橙色音量滚轮
  _roller() {
    const g = new THREE.Group()
    g.position.set(this.sideX - 0.08, -2.58, 0)
    g.userData.action = 'knob'
    const spin = new THREE.Group()
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.42, 36).rotateX(Math.PI / 2),
      this.matOrange
    )
    wheel.castShadow = true
    spin.add(wheel)
    for (let i = 0; i < 16; i++) {
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.42), this.matBodyDeep)
      const a = (i / 16) * Math.PI * 2
      groove.position.set(Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0)
      groove.rotation.z = a
      spin.add(groove)
    }
    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.9, 16).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
    )
    g.add(spin, hit)
    this.knobSpin = spin
    this.group.add(g)
    this.hitTargets.push(g)

    const label = textPlane('vol', 0.7, 0.22, { size: 0.13, color: '#9a9da3' })
    label.position.set(4.92, -2.58, this.frontZ + 0.011)
    this.group.add(label)
  }

  // 白色外壳磁带（透窗可见双卷带轮）
  _cassette() {
    const g = new THREE.Group()
    const W = 6.4,
      H = 4.15,
      D = 0.72

    const shape = roundedRectShape(W, H, 0.12)
    shape.holes.push(roundedRectPath(3.4, 1.5, 0.1, 0, -0.35))
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: D,
      curveSegments: 14,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
    })
    geo.computeBoundingBox()
    const bb = geo.boundingBox
    geo.translate(0, 0, -(bb.min.z + bb.max.z) / 2)
    const shellHalfD = (bb.max.z - bb.min.z) / 2
    const shell = new THREE.Mesh(geo, this.matShell)
    shell.castShadow = true
    g.add(shell)

    // 内部背板
    const backplate = new THREE.Mesh(
      new THREE.PlaneGeometry(W - 0.3, H - 0.3),
      new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.9, envMapIntensity: 0.3 })
    )
    backplate.position.z = -shellHalfD + 0.05
    g.add(backplate)

    // 卷带轮：左供带、右收带
    this.reels = []
    for (const side of [-1, 1]) {
      const reel = new THREE.Group()
      reel.position.set(side * 1.13, -0.35, 0)
      const spool = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.32, 44).rotateX(Math.PI / 2),
        this.matTape
      )
      const hub = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 10, 26), this.matHub)
      hub.position.z = 0.19
      for (let i = 0; i < 6; i++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.16, 0.09), this.matHub)
        const a = (i / 6) * Math.PI * 2
        tooth.position.set(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.19)
        tooth.rotation.z = a
        hub.add(tooth)
      }
      reel.add(spool, hub)
      reel.userData.spool = spool
      reel.userData.side = side
      g.add(reel)
      this.reels.push(reel)
    }

    // 窗口玻璃
    const winGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.5),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0,
        transparent: true,
        opacity: 0.09,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      })
    )
    winGlass.position.set(0, -0.35, shellHalfD - 0.02)
    winGlass.renderOrder = 9
    g.add(winGlass)

    // 标签
    this.labelCanvas = document.createElement('canvas')
    this.labelCanvas.width = 1024
    this.labelCanvas.height = 200
    drawCassetteLabel(this.labelCanvas, "mixtape '26")
    this.labelTex = new THREE.CanvasTexture(this.labelCanvas)
    this.labelTex.colorSpace = THREE.SRGBColorSpace
    this.labelTex.anisotropy = 8
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(5.9, 1.15),
      new THREE.MeshStandardMaterial({ map: this.labelTex, roughness: 0.9, metalness: 0 })
    )
    label.position.set(0, 1.12, shellHalfD + 0.012)
    g.add(label)

    // 底部定位孔
    for (const side of [-1, 1]) {
      const hole = new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 18),
        new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
      )
      hole.position.set(side * 2.4, -1.6, shellHalfD - 0.005)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 18), this.matShell)
      ring.position.set(side * 2.4, -1.6, shellHalfD - 0.01)
      g.add(hole, ring)
    }

    g.userData.action = 'cassette'
    this.cassette = g
    this.cassetteInPos = new THREE.Vector3(this.bayC.x, this.bayC.y, this.frontZ - 0.38)
    this.cassetteOutPos = new THREE.Vector3(this.bayC.x, 3.55, this.frontZ + 1.1)
    g.position.copy(this.cassetteInPos)
    this.group.add(g)
    this.hitTargets.push(g)
  }

  // 前装式仓门：白色边框 + 烟熏视窗，底部铰链（真实随身听机构）
  _door() {
    this.doorOpenAngle = 1.22
    this.hingeY = this.bayC.y - this.bayH / 2 - 0.075 // 铰链在舱口下缘
    this.hingeZ = this.frontZ + 0.06
    // 磁带在盖子托架中的局部坐标（合盖时正好落在舱内）
    this.seatLY = this.bayC.y - this.hingeY
    this.seatLZ = this.cassetteInPos.z - this.hingeZ

    const pivot = new THREE.Group()
    pivot.position.set(this.bayC.x, this.hingeY, this.hingeZ)
    pivot.userData.action = 'door'

    const fw = 6.92,
      fh = 4.62
    const frameShape = roundedRectShape(fw, fh, 0.24)
    frameShape.holes.push(roundedRectPath(fw - 0.52, fh - 0.52, 0.16))
    const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.1,
      curveSegments: 16,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    })
    const frame = new THREE.Mesh(frameGeo, this.matBody)
    frame.castShadow = true
    frame.position.y = fh / 2

    // 烟熏视窗（合盖时仍能看到卷带轮）
    const glass = new THREE.Mesh(
      new RoundedBoxGeometry(fw - 0.44, fh - 0.44, 0.06, 2, 0.04),
      new THREE.MeshPhysicalMaterial({
        color: 0x30333a,
        metalness: 0,
        roughness: 0.06,
        transparent: true,
        opacity: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    )
    glass.position.set(0, fh / 2, 0.075)
    glass.renderOrder = 10

    // 顶部开盖指扣
    const tab = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.13, 0.16, 2, 0.04), this.matBody)
    tab.position.set(0, fh - 0.05, 0.14)

    // 底部两个外露铰链筒
    for (const side of [-1, 1]) {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.52, 16).rotateZ(Math.PI / 2),
        this.matBodyDeep
      )
      barrel.position.set(side * (fw / 2 - 0.42), 0.02, 0)
      pivot.add(barrel)
    }

    pivot.add(frame, glass, tab)
    this.door = pivot
    this.group.add(pivot)
    this.hitTargets.push(pivot)
  }

  // 设置盖子角度；seated=true 时磁带随托架联动
  _setDoor(theta, seated = false) {
    this.door.rotation.x = theta
    if (seated) {
      const cos = Math.cos(theta),
        sin = Math.sin(theta)
      this.cassette.position.set(
        this.bayC.x,
        this.hingeY + this.seatLY * cos - this.seatLZ * sin,
        this.hingeZ + this.seatLY * sin + this.seatLZ * cos
      )
      this.cassette.rotation.x = theta
      this.cassette.rotation.z = 0
    }
  }

  _detail() {
    // 前面板丝印
    const brand = textPlane('walkman w–26', 2.2, 0.28, {
      size: 0.185,
      color: '#3f4247',
      weight: 600,
    })
    brand.position.set(2.98, 1.66, this.frontZ + 0.011)
    const model = textPlane('field deck · 3 head stereo', 2.6, 0.2, {
      size: 0.12,
      color: '#8b8e94',
    })
    model.position.set(3.18, -2.42, this.frontZ + 0.011)
    const serial = textPlane('est. 2026 · made for the future', 2.8, 0.19, {
      size: 0.11,
      color: '#a3a6ab',
    })
    serial.position.set(3.28, -2.78, this.frontZ + 0.011)
    this.group.add(brand, model, serial)

    // 状态 LED
    const led = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.06, 20).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: C.amber, emissive: C.amber, emissiveIntensity: 0.3 })
    )
    led.position.set(4.72, 2.42, this.frontZ + 0.02)
    this.led = led
    const ledRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 10, 24), this.matBodyDeep)
    ledRing.position.set(4.72, 2.42, this.frontZ + 0.02)
    this.group.add(led, ledRing)

    // 四角外露螺丝
    const screwMat = new THREE.MeshStandardMaterial({
      color: 0x8a8d93,
      metalness: 0.95,
      roughness: 0.32,
    })
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6 })
    for (const [sx, sy] of [
      [-5.42, 3.08],
      [5.42, 3.08],
      [-5.42, -3.08],
      [5.42, -3.08],
    ]) {
      const s = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.05, 18).rotateX(Math.PI / 2),
        screwMat
      )
      s.position.set(sx, sy, this.frontZ + 0.012)
      const g1 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.026, 0.02), grooveMat)
      g1.rotation.z = 0.6 + sx * 0.2
      g1.position.set(sx, sy, this.frontZ + 0.04)
      this.group.add(s, g1)
    }

    // 顶缘：耳机孔 + 麦克风阵列
    const topY = this.bodyH / 2 + 0.06
    const jackRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.05, 10, 24).rotateX(Math.PI / 2),
      this.matBodyDeep
    )
    jackRing.position.set(-4.9, topY, 0)
    const jackHole = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, 20).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    jackHole.position.set(-4.9, topY + 0.001, 0)
    this.group.add(jackRing, jackHole)
    for (let i = 0; i < 3; i++) {
      const mic = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 12).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
      )
      mic.position.set(3.6 + i * 0.32, topY + 0.001, 0)
      this.group.add(mic)
    }

    // 底缘 USB-C
    const usb = new THREE.Mesh(
      new RoundedBoxGeometry(0.9, 0.06, 0.3, 2, 0.026),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
    )
    usb.position.set(0, -this.bodyH / 2 - 0.061, 0)
    this.group.add(usb)

    // 背面铭牌
    const back = textPlane('walkman w–26 · field deck', 3.6, 0.34, {
      size: 0.19,
      color: '#7d8085',
      weight: 600,
    })
    back.position.set(0, 0.55, this.backZ - 0.011)
    back.rotation.y = Math.PI
    const back2 = textPlane('dc 3v ⎓ · type i · teenage spirit inside', 3.4, 0.24, {
      size: 0.13,
      color: '#9a9da2',
    })
    back2.position.set(0, 0.05, this.backZ - 0.011)
    back2.rotation.y = Math.PI
    this.group.add(back, back2)
  }

  setTapeName(name) {
    drawCassetteLabel(this.labelCanvas, name)
    this.labelTex.needsUpdate = true
  }

  // ---------- 交互动画 ----------
  pressVisual(action) {
    const b = this._buttons[action]
    if (!b) return
    const pg = b.userData.pressGroup
    b.userData.keyTween?.cancel()
    // 快速压入
    b.userData.keyTween = tween({
      from: pg.position.x,
      to: (b.userData.pressAxis ?? 0) * 0.15,
      dur: 0.07,
      ease: Ease.outCubic,
      onUpdate: (v) => (pg.position.x = v),
    })
  }

  releaseVisual(action) {
    const b = this._buttons[action]
    if (!b) return
    const pg = b.userData.pressGroup
    b.userData.keyTween?.cancel()
    // 弹回并过冲一下再落座
    b.userData.keyTween = tween({
      from: pg.position.x,
      to: 0,
      dur: 0.32,
      ease: easeKeyRelease,
      onUpdate: (v) => (pg.position.x = v),
    })
  }

  async eject() {
    if (this.busy || !this.tapeIn) return
    this.busy = true
    this.tapeIn = false
    // 1. 掀盖：磁带留在托架里随盖子一起翻出
    await tweenAsync({
      from: 0,
      to: this.doorOpenAngle,
      dur: 0.6,
      ease: Ease.outBack,
      onUpdate: (v) => this._setDoor(Math.min(v, this.doorOpenAngle + 0.06), true),
    })
    // 2. 磁带从托架滑出，抬升到悬浮位
    const p0 = this.cassette.position.clone()
    const r0 = this.cassette.rotation.x
    await tweenAsync({
      dur: 0.72,
      ease: Ease.outCubic,
      onUpdate: (k) => {
        this.cassette.position.lerpVectors(p0, this.cassetteOutPos, k)
        this.cassette.position.z += Math.sin(k * Math.PI) * 0.7 // 弧线越过盖沿
        this.cassette.rotation.x = lerp(r0, -0.32, k)
      },
    })
    this.busy = false
  }

  async insert() {
    if (this.busy || this.tapeIn) return
    this.busy = true
    // 1. 磁带落进打开的盖子托架
    const cos = Math.cos(this.doorOpenAngle),
      sin = Math.sin(this.doorOpenAngle)
    const seatPos = new THREE.Vector3(
      this.bayC.x,
      this.hingeY + this.seatLY * cos - this.seatLZ * sin,
      this.hingeZ + this.seatLY * sin + this.seatLZ * cos
    )
    const p0 = this.cassette.position.clone()
    const r0 = this.cassette.rotation.x
    await tweenAsync({
      dur: 0.62,
      ease: Ease.inOutCubic,
      onUpdate: (k) => {
        this.cassette.position.lerpVectors(p0, seatPos, k)
        this.cassette.position.z += Math.sin(k * Math.PI) * 0.7
        this.cassette.rotation.x = lerp(r0, this.doorOpenAngle, k)
        this.cassette.rotation.z *= 1 - k
      },
    })
    // 2. 合盖：磁带随托架一起收进舱内（带一点落座回弹）
    await tweenAsync({
      from: this.doorOpenAngle,
      to: 0,
      dur: 0.55,
      ease: Ease.outBack,
      onUpdate: (v) => this._setDoor(Math.max(v, 0), true),
    })
    this.cassette.position.copy(this.cassetteInPos)
    this.cassette.rotation.set(0, 0, 0)
    this.tapeIn = true
    this.busy = false
  }

  setKnob(v) {
    this.knobSpin.rotation.z = 1.5 - v * 3
  }

  setHover(action) {
    this.hover = action
  }

  // ---------- 每帧更新 ----------
  update(dt, s, reduced) {
    this.t += dt

    if (!reduced) {
      this.group.position.y = Math.sin(this.t * 0.85) * 0.05
      this.group.rotation.y = Math.sin(this.t * 0.21) * 0.026
      this.group.rotation.x = Math.sin(this.t * 0.3) * 0.01
    }

    // 出仓时磁带悬浮
    if (!this.tapeIn && !this.busy) {
      this.cassette.position.y = this.cassetteOutPos.y + Math.sin(this.t * 1.25) * 0.05
      this.cassette.rotation.z = Math.sin(this.t * 0.6) * 0.01
    }

    // 卷带轮转速：播放 1x，快进/快退高速（反向）
    let target = 0
    if (this.tapeIn) {
      if (s.seekDir !== 0) target = 7.5 * s.seekDir
      else if (s.playing) target = 1.7
    }
    this._reelSpeed = damp(this._reelSpeed, target, 9, dt)
    const p = s.progress || 0
    const rMin = 0.42,
      rMax = 1.28
    for (const reel of this.reels) {
      const supply = reel.userData.side < 0
      const r = supply ? lerp(rMax, rMin, p) : lerp(rMin, rMax, p)
      reel.userData.spool.scale.set(r, r, 1)
      // 恒定线速度 → 角速度与卷径成反比
      reel.rotation.z -= (this._reelSpeed / r) * dt * 2.2
    }

    // 播放键强调色 & LED 呼吸
    const ringT = s.seekDir !== 0 ? 1.1 : s.playing ? 0.85 : 0.45
    this.matAmber.emissiveIntensity = damp(this.matAmber.emissiveIntensity, ringT, 6, dt)
    const vuAvg = s.vu ? (s.vu[0] + s.vu[1] + s.vu[2]) / 3 : 0
    const ledT = this.tapeIn ? (s.playing ? 0.9 + vuAvg * 1.6 : 0.35) : 0.12
    this.led.material.emissiveIntensity = damp(this.led.material.emissiveIntensity, ledT, 8, dt)

    // 侧键 hover 高亮
    for (const [action, b] of Object.entries(this._buttons)) {
      b.userData.capMat.emissive.setHex(this.hover === action ? 0x17181c : 0x000000)
    }
  }
}
