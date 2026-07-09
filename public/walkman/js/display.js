// 机身点阵显示屏：低分辨率画布 → 最近邻放大 → LED 圆点蒙版，复古又未来
import * as THREE from 'three'

const SW = 192,
  SH = 40,
  SCALE = 4 // 小画布尺寸与放大倍数
const AMBER = '#ffb054'
const AMBER_DIM = 'rgba(255,176,84,0.42)'

export class DotDisplay {
  constructor() {
    this.small = document.createElement('canvas')
    this.small.width = SW
    this.small.height = SH
    this.sctx = this.small.getContext('2d')

    this.big = document.createElement('canvas')
    this.big.width = SW * SCALE
    this.big.height = SH * SCALE
    this.bctx = this.big.getContext('2d')

    this.mid = document.createElement('canvas')
    this.mid.width = this.big.width
    this.mid.height = this.big.height
    this.mctx = this.mid.getContext('2d')

    this._buildDotPattern()

    this.texture = new THREE.CanvasTexture(this.big)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4

    this.scrollX = 0
    this.msg = null // { text, until }
    this._acc = 0
    this.t = 0
  }

  _buildDotPattern() {
    const cell = SCALE
    const pat = document.createElement('canvas')
    pat.width = cell
    pat.height = cell
    const p = pat.getContext('2d')
    p.fillStyle = '#fff'
    p.beginPath()
    p.arc(cell / 2, cell / 2, cell * 0.42, 0, Math.PI * 2)
    p.fill()
    this.dotPattern = this.mctx.createPattern(pat, 'repeat')
  }

  flash(text, ms = 1000) {
    this.msg = { text, until: performance.now() + ms }
  }

  // state: { playing, seekDir, time, duration, index, count, title, tapeIn, vu }
  update(dt, state) {
    this.t += dt
    this._acc += dt
    if (this._acc < 1 / 30) return // 30fps 刷新足够
    this._acc = 0

    const c = this.sctx
    c.clearRect(0, 0, SW, SH)
    c.textBaseline = 'top'

    const msgActive = this.msg && performance.now() < this.msg.until

    if (msgActive) {
      c.fillStyle = AMBER
      c.font = 'bold 13px "SF Mono", Menlo, monospace'
      const w = c.measureText(this.msg.text).width
      c.fillText(this.msg.text, Math.round((SW - w) / 2), 13)
    } else if (!state.tapeIn) {
      const blink = Math.floor(this.t * 1.6) % 2 === 0
      c.fillStyle = blink ? AMBER : AMBER_DIM
      c.font = 'bold 12px "SF Mono", Menlo, monospace'
      const txt = 'INSERT TAPE'
      const w = c.measureText(txt).width
      c.fillText(txt, Math.round((SW - w) / 2), 14)
    } else {
      // 顶行：状态图标 + 曲目号 + 时间
      c.fillStyle = AMBER
      this._drawStateIcon(c, 2, 2, state)
      c.font = '9px "SF Mono", Menlo, monospace'
      c.fillStyle = AMBER_DIM
      const trk = `TRK ${String(state.index + 1).padStart(2, '0')}/${String(
        Math.max(state.count, 1)
      ).padStart(2, '0')}`
      c.fillText(trk, 16, 2)
      const tm = fmtTime(state.time)
      c.fillStyle = AMBER
      const tw = c.measureText(tm).width
      c.fillText(tm, SW - tw - 2, 2)

      // 中行：滚动标题
      const title = (state.title || 'UNTITLED').toUpperCase()
      c.font = 'bold 12px "SF Mono", Menlo, monospace'
      const titleW = c.measureText(title).width
      c.fillStyle = AMBER
      if (titleW <= SW - 6) {
        this.scrollX = 0
        c.fillText(title, 3, 14)
      } else {
        this.scrollX += (state.playing ? 14 : 7) * (1 / 30)
        const span = titleW + 42
        const off = -(this.scrollX % span)
        c.fillText(title, Math.round(off + 3), 14)
        c.fillText(title, Math.round(off + 3 + span), 14)
      }

      // 底行：进度块 + VU
      const pBlocks = 14
      const filled = Math.round((state.duration ? state.time / state.duration : 0) * pBlocks)
      for (let i = 0; i < pBlocks; i++) {
        c.fillStyle = i < filled ? AMBER : 'rgba(255,176,84,0.16)'
        c.fillRect(3 + i * 7, 31, 5, 5)
      }
      const vu = state.vu
      if (vu) {
        const bx = SW - 2 - 12 * 6
        for (let i = 0; i < 12; i++) {
          const h = Math.max(1, Math.round(vu[i] * 9))
          c.fillStyle = i > 8 ? '#ff7a3d' : AMBER
          c.globalAlpha = 0.35 + vu[i] * 0.65
          c.fillRect(bx + i * 6, 37 - h, 4, h)
        }
        c.globalAlpha = 1
      }
    }

    this._composite()
    this.texture.needsUpdate = true
  }

  _drawStateIcon(c, x, y, state) {
    c.save()
    c.translate(x, y)
    c.fillStyle = AMBER
    c.beginPath()
    if (state.seekDir > 0) {
      c.moveTo(0, 0)
      c.lineTo(4.5, 3.5)
      c.lineTo(0, 7)
      c.moveTo(5, 0)
      c.lineTo(9.5, 3.5)
      c.lineTo(5, 7)
    } else if (state.seekDir < 0) {
      c.moveTo(4.5, 0)
      c.lineTo(0, 3.5)
      c.lineTo(4.5, 7)
      c.moveTo(9.5, 0)
      c.lineTo(5, 3.5)
      c.lineTo(9.5, 7)
    } else if (state.playing) {
      c.moveTo(1, 0)
      c.lineTo(8, 3.5)
      c.lineTo(1, 7)
    } else {
      c.rect(1, 0, 2.6, 7)
      c.rect(5.4, 0, 2.6, 7)
    }
    c.fill()
    c.restore()
  }

  _composite() {
    const B = this.bctx,
      M = this.mctx
    const W = this.big.width,
      H = this.big.height

    // 蒙版层：放大 + 圆点栅格
    M.clearRect(0, 0, W, H)
    M.imageSmoothingEnabled = false
    M.drawImage(this.small, 0, 0, W, H)
    M.globalCompositeOperation = 'destination-in'
    M.fillStyle = this.dotPattern
    M.fillRect(0, 0, W, H)
    M.globalCompositeOperation = 'source-over'

    // 输出：底色 + 辉光 + 点阵
    B.clearRect(0, 0, W, H)
    B.fillStyle = '#120c06'
    B.fillRect(0, 0, W, H)
    B.save()
    B.filter = 'blur(7px)'
    B.globalAlpha = 0.55
    B.drawImage(this.mid, 0, 0)
    B.restore()
    B.drawImage(this.mid, 0, 0)
  }
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0))
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
}
