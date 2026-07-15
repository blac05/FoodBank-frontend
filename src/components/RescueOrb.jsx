import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Torus,
  Points,
  PointMaterial,
  Billboard,
  useTexture,
} from "@react-three/drei";
import logoSrc from "../assets/logo.jpg";

// Ambient particle field drifting behind the medallion - suggests rescued
// food items in motion through a logistics network.
function Drift() {
  const ref = useRef();
  const count = 220;
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 9)
    )
  ).current;

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#3E9EFF"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// The actual uploaded logo, rendered on a circular plane that always faces
// the camera (Billboard) so it reads clearly while everything spins around it.
function LogoMedallion() {
  const texture = useTexture(logoSrc);
  return (
    <Billboard>
      <mesh>
        <circleGeometry args={[1.15, 64]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent />
      </mesh>
    </Billboard>
  );
}

function RescueCore({ mouse }) {
  const groupRef = useRef();
  const outerRingRef = useRef();
  const innerRingRef = useRef();

  useFrame((state, delta) => {
    if (outerRingRef.current) outerRingRef.current.rotation.z += delta * 0.25;
    if (innerRingRef.current) innerRingRef.current.rotation.z -= delta * 0.35;

    // Subtle parallax: the whole assembly gently leans toward the cursor.
    if (groupRef.current) {
      const targetX = mouse.current.y * 0.25;
      const targetY = mouse.current.x * 0.25;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
        <LogoMedallion />

        <Torus ref={outerRingRef} args={[1.9, 0.018, 16, 100]}>
          <meshStandardMaterial
            color="#3E9EFF"
            emissive="#3E9EFF"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </Torus>

        <Torus ref={innerRingRef} args={[1.55, 0.012, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
          <meshStandardMaterial
            color="#39FF6A"
            emissive="#39FF6A"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </Torus>
      </Float>
      <Drift />
    </group>
  );
}

export default function RescueOrb({ className = "" }) {
  const mouse = useRef({ x: 0, y: 0 });

  function handlePointerMove(e) {
    const bounds = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.current.y = ((e.clientY - bounds.top) / bounds.height) * 2 - 1;
  }

  return (
    <div className={className} onPointerMove={handlePointerMove}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.35} />
        <pointLight position={[4, 4, 4]} intensity={40} color="#3E9EFF" />
        <pointLight position={[-4, -2, 2]} intensity={20} color="#39FF6A" />
        <Suspense fallback={null}>
          <RescueCore mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
