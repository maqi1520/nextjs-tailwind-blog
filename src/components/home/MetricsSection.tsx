import { metrics } from '@/data/homeData'

export default function MetricsSection() {
  return (
    <section className="bg-skin-dark py-20 text-white">
      <div className="relative mx-auto max-w-site px-6">
        <p className="mb-5 text-sm text-white/70">{metrics.eyebrow}</p>
        <h2 className="mb-14 text-3xl font-black leading-tight tracking-tight md:text-5xl">
          {metrics.title}
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {metrics.items.map((item, index) => (
            <div
              key={item.label}
              className={index < metrics.items.length - 1 ? 'md:border-r md:border-white/25' : ''}
            >
              <div
                className={`serif text-5xl ${
                  index % 2 === 0 ? 'text-skin-accent' : 'text-skin-accent-2'
                }`}
              >
                {item.value}
              </div>
              <p className="mt-3 font-bold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
