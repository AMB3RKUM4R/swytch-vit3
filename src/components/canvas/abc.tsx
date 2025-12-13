import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Grid } from '@react-three/drei';
import * as THREE from 'three';

export default function CyberScene() {
  const gridRef = useRef<THREE.Group>(null);

  // Animation Loop: Move the grid slowly to create "forward motion" feeling
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 1;
    }
  });

  return (
    <>
      {/* 1. ATMOSPHERE */}
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 5, 20]} /> 

      {/* 2. PARTICLES */}
      <Sparkles 
        count={150} 
        scale={[10, 10, 10]} 
        size={2} 
        speed={0.2} 
        opacity={0.5}
        color="#39FF14" 
      />

      {/* 3. STARS */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* 4. THE GRID */}
      <group position={[0, -1, 0]} ref={gridRef}>
        <Grid 
          infiniteGrid 
          fadeDistance={25} 
          sectionSize={1} 
          sectionThickness={1.5} 
          sectionColor="#39FF14" 
          cellSize={0.5} 
          cellThickness={0.5} 
          cellColor="#111111" 
        />
      </group>

      {/* 5. LIGHTING */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#39FF14" />
    </>
  );
}