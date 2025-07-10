import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

const ThreeCanvasBackdrop = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <Box>
            <meshStandardMaterial color="#00A8FF" wireframe />
          </Box>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCanvasBackdrop;
