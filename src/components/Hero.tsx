import React, { ReactElement, useEffect, useRef } from 'react';
import { renderCanvas } from '../utils/renderCanvas';
import { welcome } from '../config';

interface Props {}

export default function Hero({}: Props): ReactElement {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    renderCanvas();
    ref.current?.classList.add('transition-in');
  }, []);
  return (
    <div>
      <canvas
        className="absolute inset-0 pointer-events-none bg-skin-base"
        id="canvas"
      ></canvas>
      <div className="h-screen relative z-10 flex justify-center items-center">
        <div ref={ref} className="text-4xl">
          {welcome.split('').map((latter, index) => (
            <span
              style={{ transitionDelay: 0.2 * (index + 1) + 's' }}
              className="transition-opacity opacity-0"
              key={index}
            >
              {latter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
