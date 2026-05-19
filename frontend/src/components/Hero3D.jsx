import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, TorusKnot } from '@react-three/drei';

const FloatingShape = ({ position, color, speed, factor, type }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(time / 4);
    mesh.current.rotation.y = Math.cos(time / 4);
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position} ref={mesh}>
        {type === 'sphere' ? (
          <Sphere args={[1, 64, 64]}>
            <MeshDistortMaterial
              color={color}
              speed={speed}
              distort={0.4}
              radius={1}
            />
          </Sphere>
        ) : (
          <TorusKnot args={[1, 0.3, 128, 32]}>
            <MeshWobbleMaterial
              color={color}
              speed={speed}
              factor={factor}
            />
          </TorusKnot>
        )}
      </mesh>
    </Float>
  );
};

const Hero3D = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} color="#4A5C6A" />
        
        <FloatingShape 
          position={[-2, 1, 0]} 
          color="#4A5C6A" 
          speed={2} 
          factor={0.6} 
          type="torus" 
        />
        <FloatingShape 
          position={[2, -1, -1]} 
          color="#9BA8AB" 
          speed={1.5} 
          factor={0.4} 
          type="sphere" 
        />
        <FloatingShape 
          position={[0, 2, -2]} 
          color="#253745" 
          speed={3} 
          factor={0.5} 
          type="torus" 
        />
      </Canvas>
    </div>
  );
};

export default Hero3D;
