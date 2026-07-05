"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, type Mesh, type Texture } from "three";
import { ambientFloat } from "@/lib/motion";

type LogoPlaneProps = {
  url: string;
  position: [number, number, number];
  /** Offset fase float — beda per logo supaya tidak osilasi sinkron */
  phase: number;
  /** Tinggi plane (unit scene) — lebar mengikuti aspect ratio texture */
  height?: number;
};

function LogoPlane({ url, position, phase, height = 1.5 }: LogoPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(url, (t: Texture) => {
    t.colorSpace = SRGBColorSpace;
  });

  const image = texture.image as { width: number; height: number } | undefined;
  const aspect = image ? image.width / image.height : 1;

  useFrame(({ clock, pointer }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Float idle — ambient loop (DESIGN.md §6)
    mesh.position.y =
      position[1] +
      Math.sin(clock.elapsedTime * ambientFloat.speed + phase) *
        ambientFloat.amplitude;
    // Tilt mengejar pointer, lerp per-frame
    const targetX = -pointer.y * ambientFloat.tiltMax;
    const targetY = pointer.x * ambientFloat.tiltMax;
    mesh.rotation.x += (targetX - mesh.rotation.x) * ambientFloat.tiltLerp;
    mesh.rotation.y += (targetY - mesh.rotation.y) * ambientFloat.tiltLerp;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

export type SponsorSceneProps = {
  logos: { url: string; label: string }[];
  /** false saat section keluar viewport → rAF three berhenti total */
  active: boolean;
};

/**
 * S5 Sponsor — signature moment #3 (DESIGN.md §6): logo sponsor sebagai
 * textured plane, tilt-on-pointer + float idle. DPR capped [1, 1.5].
 */
export default function SponsorScene({ logos, active }: SponsorSceneProps) {
  const spread = 2.1;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 4], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        {logos.map((logo, i) => (
          <LogoPlane
            key={logo.url}
            url={logo.url}
            phase={i * Math.PI * 0.7}
            position={[(i - (logos.length - 1) / 2) * spread, 0, 0]}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}
