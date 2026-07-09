import Link from '@/components/Link'
import { heroContent, heroStats } from '@/data/homeData'

export default function HomeHero() {
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

          <div className="relative">
            <div className="spark left-[-30px] top-[-18px] scale-75" />
            <div className="spark bottom-[-14px] right-[-16px] scale-90" />
            <div className="walkman-frame relative aspect-[4/3] w-full overflow-hidden rounded-[30px] bg-[#0b0c10]">
              <iframe
                src="/walkman/walkman.html?embed"
                title="WALKMAN '26 · 交互式 3D 磁带随身听"
                loading="lazy"
                allow="autoplay"
                className="absolute inset-0 h-full w-full border-0"
              />
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
