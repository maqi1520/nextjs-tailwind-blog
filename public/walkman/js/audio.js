// 音频引擎：播放 / 暂停 / 停止 / 快进(可听变调) / 快退(倒带音效) / 切歌 / 音量 / VU 频谱
import { clamp } from './tween.js'

export class AudioEngine {
  constructor() {
    this.el = new Audio()
    this.el.preload = 'metadata'
    // 快进时保留"磁带变调"的味道
    this.el.preservesPitch = false
    this.el.mozPreservesPitch = false
    this.el.webkitPreservesPitch = false

    this.playlist = []
    this.base = 'music/'
    this.index = 0
    this.playing = false
    this.seekDir = 0 // -1 快退 / 0 正常 / 1 快进
    this.volume = 0.8
    this._wasPlaying = false
    this._rewTimer = null
    this._ffTimer = null
    this._whir = null
    this._vu = new Float32Array(12)

    this.onTrackChange = null // (track, index) => {}
    this.onStateChange = null

    this.el.volume = this.volume
    this.el.addEventListener('ended', () => this._onEnded())
  }

  // 需要用户手势后才能创建 AudioContext
  ensureCtx() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.srcNode = this.ctx.createMediaElementSource(this.el)
    this.duck = this.ctx.createGain()
    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.75
    this._fft = new Uint8Array(this.analyser.frequencyBinCount)
    this.srcNode.connect(this.duck)
    this.duck.connect(this.analyser)
    this.analyser.connect(this.ctx.destination)
  }

  setPlaylist(list, base = 'music/', name = "MIXTAPE '26") {
    this.playlist = list || []
    this.base = base
    this.tapeName = name
    this.index = 0
    this.stopSeek(true)
    this.playing = false
    this.el.pause()
    if (this.playlist.length) this._load(0)
    this.onStateChange?.()
  }

  get track() {
    return this.playlist[this.index] || null
  }
  get duration() {
    return this.el.duration || 0
  }
  get time() {
    return this.el.currentTime || 0
  }
  get progress() {
    return this.duration ? clamp(this.time / this.duration, 0, 1) : 0
  }

  _load(i) {
    this.index = ((i % this.playlist.length) + this.playlist.length) % this.playlist.length
    const t = this.playlist[this.index]
    this.el.src = t.url || this.base + encodeURIComponent(t.file).replace(/%2F/g, '/')
    this.el.load()
    this.onTrackChange?.(t, this.index)
  }

  async toggle() {
    if (!this.playlist.length) return false
    this.ensureCtx()
    if (this.playing) {
      this.el.pause()
      this.playing = false
    } else {
      try {
        await this.el.play()
        this.playing = true
      } catch {
        this.playing = false
      }
    }
    this.onStateChange?.()
    return this.playing
  }

  stop() {
    this.stopSeek(true)
    this.el.pause()
    this.el.currentTime = 0
    this.playing = false
    this.onStateChange?.()
  }

  pause() {
    if (this.playing) {
      this.el.pause()
      this.playing = false
      this.onStateChange?.()
    }
  }

  skip(dir) {
    if (!this.playlist.length) return
    const keep = this.playing
    this._load(this.index + dir)
    if (keep) {
      this.ensureCtx()
      this.el.play().catch(() => {})
    }
    this.sfx('chunk')
    this.onStateChange?.()
  }

  // ---- 快进 / 快退（按住） ----
  startSeek(dir) {
    if (!this.playlist.length || this.seekDir === dir) return
    this.stopSeek(true)
    this.seekDir = dir
    this._wasPlaying = this.playing
    this.ensureCtx()

    if (dir > 0) {
      if (this.playing) {
        // 可听的高速播放（cue）：变速 + 压低音量
        this.el.playbackRate = 6
        if (this.duck) this.duck.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.05)
      } else {
        // 停止状态下静默快进
        this._ffTimer = setInterval(() => {
          if (this.duration) {
            this.el.currentTime = Math.min(this.el.currentTime + 0.35, this.duration - 0.05)
          }
        }, 50)
      }
    } else {
      // 倒带：暂停正片，步进回退 + 合成倒带呼啸声
      this.el.pause()
      this._rewTimer = setInterval(() => {
        this.el.currentTime = Math.max(this.el.currentTime - 0.35, 0)
      }, 50)
      this._startWhir()
    }
    this.onStateChange?.()
  }

  stopSeek(silent = false) {
    if (this.seekDir === 0) return
    const dir = this.seekDir
    this.seekDir = 0
    clearInterval(this._ffTimer)
    this._ffTimer = null
    clearInterval(this._rewTimer)
    this._rewTimer = null
    this._stopWhir()
    this.el.playbackRate = 1
    if (this.duck && this.ctx) this.duck.gain.setTargetAtTime(1, this.ctx.currentTime, 0.04)
    if (dir < 0 && this._wasPlaying) this.el.play().catch(() => {})
    if (!silent) this.sfx('click')
    this.onStateChange?.()
  }

  setVolume(v) {
    this.volume = clamp(v, 0, 1)
    this.el.volume = Math.pow(this.volume, 1.5)
    this.onStateChange?.()
  }

  _onEnded() {
    const wasSeeking = this.seekDir > 0
    if (wasSeeking) this.stopSeek(true)
    // 自动下一首并继续播放
    this._load(this.index + 1)
    if (this.playing || this._wasPlaying || wasSeeking) {
      this.el
        .play()
        .then(() => {
          this.playing = true
          this.onStateChange?.()
        })
        .catch(() => {})
    }
  }

  // ---- VU 频谱（12 段） ----
  vuLevels() {
    if (this.analyser && (this.playing || this.seekDir !== 0)) {
      this.analyser.getByteFrequencyData(this._fft)
      const bins = this._fft.length
      for (let i = 0; i < 12; i++) {
        // 对数取段，低频权重高
        const a = Math.floor(Math.pow(bins, i / 12) * 0.9)
        const b = Math.max(a + 1, Math.floor(Math.pow(bins, (i + 1) / 12) * 0.9))
        let sum = 0
        for (let j = a; j < b; j++) sum += this._fft[j]
        const v = sum / (b - a) / 255
        this._vu[i] = Math.max(v, this._vu[i] * 0.82)
      }
    } else {
      for (let i = 0; i < 12; i++) this._vu[i] *= 0.86
    }
    return this._vu
  }

  // ---- 合成音效（无需素材文件） ----
  sfx(type) {
    if (!this.ctx) return
    const t0 = this.ctx.currentTime
    const g = this.ctx.createGain()
    g.connect(this.ctx.destination)
    if (type === 'click' || type === 'chunk') {
      const dur = type === 'chunk' ? 0.09 : 0.045
      const buf = this._noiseBuf(dur)
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      const bp = this.ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = type === 'chunk' ? 900 : 2400
      bp.Q.value = 1.2
      src.connect(bp)
      bp.connect(g)
      g.gain.setValueAtTime(type === 'chunk' ? 0.5 : 0.3, t0)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
      src.start(t0)
      src.stop(t0 + dur)
    } else if (type === 'thunk') {
      const o = this.ctx.createOscillator()
      o.type = 'sine'
      o.frequency.setValueAtTime(160, t0)
      o.frequency.exponentialRampToValueAtTime(52, t0 + 0.12)
      o.connect(g)
      g.gain.setValueAtTime(0.55, t0)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22)
      o.start(t0)
      o.stop(t0 + 0.24)
      this.sfx('click')
    } else if (type === 'eject') {
      const o = this.ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.setValueAtTime(220, t0)
      o.frequency.linearRampToValueAtTime(430, t0 + 0.16)
      o.connect(g)
      g.gain.setValueAtTime(0.18, t0)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3)
      o.start(t0)
      o.stop(t0 + 0.3)
      this.sfx('chunk')
    } else if (type === 'deny') {
      const o = this.ctx.createOscillator()
      o.type = 'square'
      o.frequency.setValueAtTime(140, t0)
      o.connect(g)
      g.gain.setValueAtTime(0.12, t0)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16)
      o.start(t0)
      o.stop(t0 + 0.18)
    }
  }

  _noiseBuf(dur) {
    const len = Math.floor(this.ctx.sampleRate * dur)
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  _startWhir() {
    if (!this.ctx || this._whir) return
    const src = this.ctx.createBufferSource()
    src.buffer = this._noiseBuf(1.2)
    src.loop = true
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2600
    bp.Q.value = 2.2
    const lfo = this.ctx.createOscillator()
    lfo.frequency.value = 11
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 700
    lfo.connect(lfoGain)
    lfoGain.connect(bp.frequency)
    const g = this.ctx.createGain()
    g.gain.value = 0
    g.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.06)
    src.connect(bp)
    bp.connect(g)
    g.connect(this.ctx.destination)
    src.start()
    lfo.start()
    this._whir = { src, lfo, g }
  }

  _stopWhir() {
    if (!this._whir) return
    const { src, lfo, g } = this._whir
    const t = this.ctx.currentTime
    g.gain.setTargetAtTime(0, t, 0.04)
    setTimeout(() => {
      try {
        src.stop()
        lfo.stop()
      } catch {}
    }, 200)
    this._whir = null
  }

  // 提供给渲染层的状态快照
  get state() {
    return {
      playing: this.playing,
      seekDir: this.seekDir,
      progress: this.progress,
      time: this.time,
      duration: this.duration,
      index: this.index,
      count: this.playlist.length,
      title: this.track?.title || '',
      volume: this.volume,
      tapeName: this.tapeName || "MIXTAPE '26",
    }
  }
}
