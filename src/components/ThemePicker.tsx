import { useEffect, useRef, useState } from 'react'
import { useColorTheme } from '@/components/ColorThemeProvider'
import { Palette } from '@/components/icons'
import type { ThemeKey } from '@/data/homeData'

type ThemePickerProps = {
  /** 移动端菜单内联展开，不使用绝对定位弹层 */
  inline?: boolean
  onPick?: () => void
}

export default function ThemePicker({ inline = false, onPick }: ThemePickerProps) {
  const { theme, setTheme, themes } = useColorTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = themes.find((item) => item.key === theme)

  useEffect(() => {
    if (!open || inline) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, inline])

  const pick = (key: ThemeKey) => {
    setTheme(key)
    setOpen(false)
    onPick?.()
  }

  const swatches = (
    <div className={inline ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-3 gap-2 p-3'}>
      {themes.map((item) => {
        const active = theme === item.key
        return (
          <button
            key={item.key}
            type="button"
            className={`theme-swatch${active ? ' active' : ''}`}
            onClick={() => pick(item.key)}
            aria-pressed={active}
            aria-label={`切换到${item.label}主题`}
            title={item.label}
          >
            <span className="theme-swatch-dot" style={{ background: item.swatch }} />
            <span className="theme-swatch-label">{item.label}</span>
          </button>
        )
      })}
    </div>
  )

  if (inline) {
    return (
      <div className="rounded-2xl border border-skin-border bg-skin-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-skin-muted">
          <Palette size={18} />
          主题 · {current?.label}
        </div>
        {swatches}
      </div>
    )
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-skin-border bg-skin-card hover:bg-skin-hero-soft"
        aria-label="切换主题"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Palette size={20} />
        <span
          className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full border border-white"
          style={{ background: current?.swatch }}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="选择主题"
          className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[220px] overflow-hidden rounded-2xl border border-skin-border bg-skin-surface shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
          <div className="border-b border-skin-border px-3 py-2.5 text-xs font-semibold text-skin-muted">
            当前 · {current?.label}
          </div>
          {swatches}
        </div>
      ) : null}
    </div>
  )
}
