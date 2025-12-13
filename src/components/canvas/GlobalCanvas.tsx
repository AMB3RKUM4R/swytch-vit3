import { FC, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import CyberScene from './abc';

const GlobalCanvas: FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]} 
      >
        <Suspense fallback={null}>
          <CyberScene />
          <Preload all />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[0] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
    </div>
  );
};

export default GlobalCanvas;