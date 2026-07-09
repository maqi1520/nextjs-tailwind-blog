import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { friendLinks } from '@/data/homeData'
import { EnvelopeSimple, Horse, MapPin } from '@/components/icons'
import SocialIcon from '@/components/social-icons'

export default function SiteFooter() {
  return (
    <footer className="border-t border-skin-border bg-skin-surface">
      <div className="mx-auto max-w-site px-6 pb-10 pt-6">
        {friendLinks.length > 1 && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="mr-4 font-black">友情链接</span>
            {friendLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-skin-border bg-skin-card px-5 py-2"
              >
                {link.title}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-col justify-between gap-5 text-black/65 md:flex-row">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-8">
              <a href={`mailto:${siteMetadata.email}`} className="flex items-center gap-2">
                <EnvelopeSimple size={18} />
                {siteMetadata.email}
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={18} />
                中国 · 杭州
              </span>
            </div>
            <div className="flex items-center gap-4">
              <SocialIcon kind="github" href={siteMetadata.github} size={5} />
              <SocialIcon kind="x" href={siteMetadata.x} size={5} />
              <SocialIcon kind="juejin" href={siteMetadata.juejin} size={5} />
              <SocialIcon kind="zhihu" href={siteMetadata.zhihu} size={5} />
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="flex items-center gap-3">
              <span>
                © {new Date().getFullYear()} {siteMetadata.headerTitle} · 保留所有权利
              </span>
              <Horse size={20} />
            </div>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="text-sm hover:opacity-70"
            >
              浙ICP备17007919号-1
            </a>
            <Link href="/" className="text-sm hover:opacity-70">
              {siteMetadata.title}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
