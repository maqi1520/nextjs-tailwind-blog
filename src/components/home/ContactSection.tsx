import { useState } from 'react'
import { contactContent } from '@/data/homeData'
import { ChatCircle, Code, Handshake, Horse, Lightbulb, RocketLaunch } from '@/components/icons'

function CapabilityIcon({ icon }: { icon: string }) {
  if (icon === 'chat') return <ChatCircle size={24} />
  if (icon === 'lightbulb') return <Lightbulb size={24} />
  if (icon === 'code') return <Code size={24} />
  return <RocketLaunch size={24} />
}

export default function ContactSection() {
  const [showFallback, setShowFallback] = useState(false)

  return (
    <section id="contact" className="bg-skin-hero-soft">
      <div className="relative mx-auto grid max-w-site items-center gap-10 overflow-hidden p-8 px-6 md:grid-cols-[1fr_330px] md:p-10">
        <div className="spark right-8 top-8 scale-75" />

        <div>
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-skin-dark bg-white/45 text-3xl">
              <Handshake size={28} />
            </div>
            <h2 className="text-3xl font-black">{contactContent.title}</h2>
          </div>

          <h3 className="mb-3 text-3xl font-black md:text-4xl">{contactContent.headline}</h3>
          <p className="mb-8 text-lg text-black/65">{contactContent.description}</p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {contactContent.capabilities.map((item) => (
              <div key={item.label} className="flex items-center gap-2 font-semibold">
                <CapabilityIcon icon={item.icon} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="h-40 w-40 rounded-2xl border border-black/10 bg-white p-4 shadow-soft">
            {!showFallback ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contactContent.qrImage}
                alt="微信二维码"
                className="h-full w-full rounded-lg object-cover"
                onError={() => setShowFallback(true)}
              />
            ) : (
              <div className="qr relative h-full w-full rounded-lg">
                <div className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white">
                  <Horse size={20} />
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-2xl font-black">扫码联系我</h4>
            <p className="mb-3 font-sans text-2xl font-black">{contactContent.wechat}</p>
            <p className="leading-7 text-skin-muted">{contactContent.qrHint}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
