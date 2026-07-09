import Link from '@/components/Link'
import { heroContent, heroStats } from '@/data/homeData'
import { useCallback, useEffect, useRef } from 'react'

const WALKMAN_KEYS = new Set([
  'Space',
  'ArrowRight',
  'ArrowLeft',
  'ArrowUp',
  'ArrowDown',
  'KeyE',
  'KeyS',
])

const SHORTCUTS = [
  { keys: ['空格'], label: '播放 / 暂停' },
  { keys: ['←', '→'], label: '长按快退快进 · 短按切歌' },
  { keys: ['E'], label: '弹出 / 插入磁带' },
  { keys: ['↑', '↓'], label: '音量' },
]

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export default function HomeHero() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const postKey = useCallback((event: 'keydown' | 'keyup', code: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'walkman-key', event, code },
      window.location.origin
    )
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || !WALKMAN_KEYS.has(e.code)) return
      if (isTypingTarget(e.target)) return
      // 焦点已在 iframe 内时由 iframe 自己处理，避免重复触发
      if (document.activeElement === iframeRef.current) return
      e.preventDefault()
      postKey('keydown', e.code)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (!WALKMAN_KEYS.has(e.code)) return
      if (isTypingTarget(e.target)) return
      if (document.activeElement === iframeRef.current) return
      postKey('keyup', e.code)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [postKey])

  return (
    <section className="grain relative overflow-hidden bg-skin-hero">
      <div className="mx-auto max-w-site px-6 pb-14 pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.02fr]">
          <div className="relative z-10">
            <p className="mb-6 text-[15px] font-semibold">{heroContent.eyebrow}</p>
            <h1 className="mb-7 text-[54px] font-black leading-none tracking-tight md:text-[72px]">
              {heroContent.title}
            </h1>
            <div className="mb-7 text-xl font-semibold md:text-2xl">{heroContent.roles}</div>
            <p className="mb-9 max-w-[560px] text-[17px] leading-9 text-black/70">
              {heroContent.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/#services"
                className="rounded-full bg-skin-dark px-7 py-4 font-bold text-white"
              >
                查看合作方案
              </Link>
              <Link
                href="/#contact"
                className="rounded-full border border-skin-dark px-7 py-4 font-bold hover:bg-white/30"
              >
                联系咨询
              </Link>
            </div>
          </div>

          <div className="relative" aria-label="WALKMAN 播放器">
            <div className="spark left-[-30px] top-[-18px] scale-75" />
            <div className="spark bottom-[-14px] right-[-16px] scale-90" />
            <div className="walkman-frame relative aspect-[4/3] w-full overflow-hidden rounded-[30px] bg-[#0b0c10]">
              <iframe
                ref={iframeRef}
                src="/walkman/walkman.html?embed"
                title="WALKMAN '26 · 交互式 3D 磁带随身听"
                loading="lazy"
                allow="autoplay"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] leading-none text-black/60">
              {SHORTCUTS.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  {item.keys.map((key) => (
                    <kbd key={key} className="walkman-kbd">
                      {key}
                    </kbd>
                  ))}
                  <span>{item.label}</span>
                </span>
              ))}
              <span className="text-black/35">拖入 MP3 可换带</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid overflow-hidden rounded-2xl border-2 border-skin-dark bg-skin-card md:grid-cols-3">
          {heroStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center gap-7 p-6 md:p-8 ${
                index < heroStats.length - 1
                  ? 'border-b border-black/30 md:border-b-0 md:border-r'
                  : ''
              }`}
            >
              <div className="serif text-6xl">{stat.value}</div>
              <div>
                <div className="text-xl font-black">{stat.label}</div>
                <div className="mt-1 text-skin-muted">{stat.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
