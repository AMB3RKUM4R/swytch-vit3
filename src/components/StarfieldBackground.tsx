// src/components/StarfieldBackground.tsx
import { FC, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Define the colors from your CSS for a cohesive look
const primaryColor = new THREE.Color("hsl(260, 80%, 65%)");
const secondaryColor = new THREE.Color("hsl(200, 100%, 55%)");

const DynamicStarfield = () => {
    const lightRef = useRef<THREE.PointLight>(null);
    const starsRef1 = useRef<any>(null);
    const starsRef2 = useRef<any>(null);

    useFrame(({ clock, camera }) => {
        // Subtle camera drift for a sense of movement
        camera.position.x = Math.sin(clock.getElapsedTime() * 0.03) * 0.5;
        camera.position.y = Math.cos(clock.getElapsedTime() * 0.04) * 0.5;
        camera.lookAt(0, 0, 0);

        // Animate the star layers for a gentle parallax effect
        if (starsRef1.current) {
            starsRef1.current.rotation.y += 0.00015;
        }
        if (starsRef2.current) {
            starsRef2.current.rotation.y += 0.00025;
        }

        // Animate the central light color for a hypnotic glow
        if (lightRef.current) {
            const time = clock.getElapsedTime();
            const t = (Math.sin(time * 0.4) + 1) / 2; // Slower oscillation
            lightRef.current.color.lerpColors(primaryColor, secondaryColor, t);
        }
    });

    return (
        <>
            <pointLight ref={lightRef} position={[0, 0, 0]} intensity={1.2} distance={150} />
            
            {/* Layer 1: Fewer, slower, background stars */}
            <Stars 
                ref={starsRef1} 
                radius={120} 
                depth={60} 
                count={2000} // Reduced star count
                factor={4} 
                saturation={0.8} 
                fade 
                speed={0.8} 
            />
            
            {/* Layer 2: Fewer, slightly faster foreground stars for parallax */}
            <Stars 
                ref={starsRef2} 
                radius={90} 
                depth={40} 
                count={1000} // Reduced star count
                factor={5} 
                saturation={1} 
                fade 
                speed={1.5} 
            />
        </>
    );
};

const StarfieldBackground: FC = () => {
    return (
        <div className="fixed inset-0 z-0 bg-black">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.1} />
                <EffectComposer multisampling={0}>
                    <DynamicStarfield />
                    {/* A very subtle bloom effect for a gentle glow, without adding grain */}
                    <Bloom 
                        intensity={0.6}      // Reduced intensity
                        luminanceThreshold={0.7} // Only brightest parts will bloom
                        luminanceSmoothing={0.5}
                        mipmapBlur
                    /> 
                </EffectComposer>
            </Canvas>
        </div>
    );
};

export default StarfieldBackground;