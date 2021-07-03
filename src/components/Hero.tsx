import React, { ReactElement, useEffect } from 'react';
import { renderCanvas } from '../utils/renderCanvas';

interface Props {}

export default function Hero({}: Props): ReactElement {
  useEffect(() => {
    renderCanvas();
  }, []);
  return (
    <div>
      <canvas
        className="absolute inset-0 pointer-events-none"
        id="canvas"
      ></canvas>
      <div className="h-screen relative z-10 flex justify-center items-center">
        <h1 className="text-4xl animation-fadeInDown">
          自在，轻盈，我本不想停留
        </h1>
      </div>
    </div>
  );
}
