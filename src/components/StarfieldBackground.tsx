// src/components/StarfieldBackground.tsx
import { FC, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Define the colors from your CSS for a cohesive look
const primaryColor = new THREE.Color("hsl(260, 80%, 65%)");
const secondaryColor = new THREE.Color("hsl(200, 100%, 55%)");
const cyanColor = new THREE.Color("hsl(180, 100%, 50%)");
const purpleColor = new THREE.Color("hsl(280, 65%, 60%)");


const DynamicStarfield = () => {
    const { camera } = useThree();
    const lightRef = useRef<THREE.PointLight>(null);
    const starsRef1 = useRef<any>(null);
    const starsRef2 = useRef<any>(null);
    const starsRef3 = useRef<any>(null);
    const starsRef4 = useRef<any>(null);


    useFrame(({ clock }) => {
        // Animate camera position for a subtle drift
        camera.position.x = Math.sin(clock.getElapsedTime() * 0.05) * 2;
        camera.position.y = Math.cos(clock.getElapsedTime() * 0.05) * 2;
        camera.lookAt(0, 0, 0);

        // Animate stars for a more dynamic parallax effect
        if (starsRef1.current && starsRef2.current && starsRef3.current && starsRef4.current) {
            starsRef1.current.rotation.y += 0.0001;
            starsRef2.current.rotation.y += 0.0002;
            starsRef3.current.rotation.y += 0.0003;
            starsRef4.current.rotation.y -= 0.0004;
        }

        // Animate light color for a hypnotic glow
        if (lightRef.current) {
            const time = clock.getElapsedTime();
            const t = (Math.sin(time * 0.5) + 1) / 2; // Oscillate between 0 and 1
            lightRef.current.color.lerpColors(primaryColor, secondaryColor, t);
        }
    });

    return (
        <>
            <pointLight ref={lightRef} position={[0, 0, 0]} intensity={1.5} distance={100} />
            <Stars ref={starsRef1} radius={100} depth={50} count={5000} factor={4} saturation={0.8} fade speed={1} />
            <Stars ref={starsRef2} radius={80} depth={30} count={1500} factor={6} saturation={0.6} fade speed={2} />
            <Stars ref={starsRef3} radius={60} depth={20} count={1000} factor={5} saturation={1} fade speed={3} material-color={cyanColor} />
            <Stars ref={starsRef4} radius={120} depth={60} count={2000} factor={3} saturation={1} fade speed={0.5} material-color={purpleColor} />
        </>
    );
};

const StarfieldBackground: FC = () => {
    return (
        <div className="fixed inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <color attach="background" args={['black']} />
                <ambientLight intensity={0.2} />
                <DynamicStarfield />
            </Canvas>
        </div>
    );
};

export default StarfieldBackground;