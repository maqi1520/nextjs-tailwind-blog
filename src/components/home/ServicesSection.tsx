import { services } from '@/data/homeData'
import { Briefcase, ChatCircleDots, Info, Presentation } from '@/components/icons'

export default function ServicesSection() {
  return (
    <section id="services" className="bg-skin-accent-2">
      <div className="mx-auto max-w-site p-8 px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-skin-dark bg-skin-card text-3xl">
              <Briefcase size={28} />
            </div>
            <h2 className="text-3xl font-black">{services.title}</h2>
          </div>
          <p className="flex items-center gap-2 text-base text-skin-muted">
            <Info size={18} />
            {services.notice}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {services.items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-5 rounded-2xl border border-skin-border bg-skin-card p-7 transition hover:shadow-soft"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                  item.accent === 'accent' ? 'bg-skin-accent' : 'bg-skin-accent-2'
                }`}
              >
                {item.icon === 'chat' ? <ChatCircleDots size={24} /> : <Presentation size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-skin-muted">{item.description}</p>
                <div className="serif mt-4 text-4xl">
                  {item.price}
                  <span className="font-sans text-base text-skin-muted"> {item.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
