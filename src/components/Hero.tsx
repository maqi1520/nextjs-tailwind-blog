import React, { ReactElement, useEffect, useRef } from 'react'
import { renderCanvas } from './renderCanvas'

interface Props {
  welcome: string
}

export default function Hero({ welcome }: Props): ReactElement {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    renderCanvas()
    ref.current?.classList.add('transition-in')
  }, [])
  return (
    <div>
      <canvas className="bg-skin-base pointer-events-none absolute inset-0" id="canvas"></canvas>
      <div className="relative z-10 flex h-[calc(100vh_-_135px)] items-center justify-center">
        <div ref={ref} className="px-4 text-3xl md:text-4xl">
          {welcome.split('').map((latter, index) => (
            <span
              style={{ transitionDelay: 0.2 * (index + 1) + 's' }}
              className="opacity-0 transition-opacity"
              key={index}
            >
              {latter}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
