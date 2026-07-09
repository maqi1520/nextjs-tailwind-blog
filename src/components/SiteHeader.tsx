import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import ThemePicker from '@/components/ThemePicker'
import { useEffect, useState } from 'react'
import { ArrowRight, Horse, List, X } from '@/components/icons'

export default function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [navOpen])

  return (
    <>
      <header className="bg-skin-surface/95 sticky top-0 z-50 flex h-[74px] items-center border-b border-skin-border backdrop-blur">
        <div className="mx-auto flex w-full max-w-site items-center justify-between gap-5 px-6">
          <Link
            href="/"
            aria-label={siteMetadata.headerTitle}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-skin-dark bg-skin-card">
              <Horse size={28} weight="regular" />
            </div>
            <span className="text-2xl font-black tracking-tight">{siteMetadata.headerTitle}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-[15px] font-medium lg:flex">
            {headerNavLinks.map((link, index) => (
              <span key={link.title} className="flex items-center gap-6">
                {index > 0 ? <span className="text-black/25">|</span> : null}
                <Link href={link.href} className="hover:opacity-60">
                  {link.title}
                </Link>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemePicker />

            <Link
              href="/#contact"
              className="hidden rounded-full bg-skin-dark px-5 py-3 text-sm font-semibold text-white sm:inline-flex"
            >
              联系咨询
            </Link>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-skin-border bg-skin-card lg:hidden"
              aria-label="打开菜单"
              onClick={() => setNavOpen(true)}
            >
              <List size={22} />
            </button>
          </div>
        </div>
      </header>
      <div
        className={`fixed inset-0 z-[60] bg-skin-surface transition-transform duration-300 lg:hidden ${
          navOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-skin-border px-6 py-5">
          <span className="text-xl font-black">{siteMetadata.headerTitle}</span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-skin-border"
            aria-label="关闭菜单"
            onClick={() => setNavOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-6 py-8">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="rounded-2xl px-4 py-4 text-2xl font-bold hover:bg-skin-hero-soft"
              onClick={() => setNavOpen(false)}
            >
              {link.title}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-skin-dark px-5 py-4 text-base font-semibold text-white"
            onClick={() => setNavOpen(false)}
          >
            联系咨询
            <ArrowRight size={18} />
          </Link>
        </nav>
      </div>
    </>
  )
}
