// 极简补间动画系统 —— 无外部依赖
const active = new Set()

export const Ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => {
    const c1 = 1.35,
      c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  outElastic: (t) => {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -9 * t) * Math.sin((t * 9 - 0.75) * ((2 * Math.PI) / 3)) + 1
  },
}

export function tween({
  from = 0,
  to = 1,
  dur = 0.5,
  delay = 0,
  ease = Ease.inOutCubic,
  onUpdate,
  onComplete,
}) {
  const item = {
    t: -delay,
    dur,
    from,
    to,
    ease,
    onUpdate,
    onComplete,
    done: false,
    cancel() {
      active.delete(item)
    },
  }
  active.add(item)
  return item
}

// Promise 版，便于串联动画序列
export function tweenAsync(opts) {
  return new Promise((resolve) => {
    tween({
      ...opts,
      onComplete: () => {
        opts.onComplete?.()
        resolve()
      },
    })
  })
}

export const wait = (sec) => new Promise((r) => setTimeout(r, sec * 1000))

export function updateTweens(dt) {
  for (const item of active) {
    item.t += dt
    if (item.t < 0) continue
    const k = Math.min(item.t / item.dur, 1)
    const v = item.from + (item.to - item.from) * item.ease(k)
    item.onUpdate?.(v, k)
    if (k >= 1) {
      active.delete(item)
      item.onComplete?.()
    }
  }
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const damp = (cur, target, lambda, dt) => lerp(cur, target, 1 - Math.exp(-lambda * dt))
