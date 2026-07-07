"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, type ShaderMaterial, type Texture } from "three";
import type { MotionValue } from "motion/react";
import { ASSETS } from "@/lib/constants";
import { aboutShader } from "@/lib/motion";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uPlaneAspect;
  uniform float uImageAspect;
  uniform vec2 uMouse;
  uniform float uWaveSpeed;
  uniform float uWaveFreq;
  uniform float uWaveStrength;
  uniform float uMouseRadius;
  uniform float uMouseStrength;
  varying vec2 vUv;

  void main() {
    /* Cover-fit UV (object-fit: cover) */
    vec2 ratio = vec2(
      min(uPlaneAspect / uImageAspect, 1.0),
      min(uImageAspect / uPlaneAspect, 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    /* Displacement idle — beton "bernafas", nyaris subliminal */
    float wave =
      sin(uv.y * uWaveFreq + uTime * uWaveSpeed) *
      cos(uv.x * uWaveFreq * 0.8 - uTime * uWaveSpeed * 0.7);
    uv += wave * uWaveStrength;

    /* Warp halus di sekitar pointer — permukaan seolah melengkung */
    vec2 p = (vUv - uMouse) * vec2(uPlaneAspect, 1.0);
    float d = length(p);
    float influence = smoothstep(uMouseRadius, 0.0, d);
    uv -= normalize(p + 1e-6) * influence * uMouseStrength;

    gl_FragColor = texture2D(uTex, uv);
  }
`;

type SceneProps = {
  /** Posisi pointer relatif section, 0..1 */
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

function ConcretePlane({ mouseX, mouseY }: SceneProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const texture = useTexture(ASSETS.about, (t: Texture) => {
    t.colorSpace = SRGBColorSpace;
  }) as Texture;

  const image = texture.image as { width: number; height: number };

  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uTime: { value: 0 },
      uPlaneAspect: { value: 1 },
      uImageAspect: { value: image.width / image.height },
      uMouse: { value: { x: 0.5, y: 0.5 } },
      uWaveSpeed: { value: aboutShader.waveSpeed },
      uWaveFreq: { value: aboutShader.waveFrequency },
      uWaveStrength: { value: aboutShader.waveStrength },
      uMouseRadius: { value: aboutShader.mouseRadius },
      uMouseStrength: { value: aboutShader.mouseStrength },
    }),
    // Texture stabil setelah load pertama — uniforms cukup dibuat sekali
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms;

    if (u.uTime) u.uTime.value += delta;
    if (u.uPlaneAspect) u.uPlaneAspect.value = size.width / size.height;
    if (u.uMouse) {
      const m = u.uMouse.value as { x: number; y: number };
      m.x += (mouseX.get() - m.x) * aboutShader.mouseLerp * (delta * 60);
      m.y += (1 - mouseY.get() - m.y) * aboutShader.mouseLerp * (delta * 60);
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

/**
 * Layer Three.js About (REFACTOR-02) — BUKAN 3D scene penuh: satu plane
 * dengan foto beton sebagai texture + displacement shader halus reaktif
 * waktu & pointer. Dimuat dynamic ssr:false, hanya saat section terlihat;
 * frameloop mati saat off-view. Foto statis di bawahnya tetap ada sebagai
 * fallback (reduced motion / tanpa WebGL).
 */
export default function AboutScene(props: SceneProps & { active: boolean }) {
  const { active, ...scene } = props;
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 1] }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <ConcretePlane {...scene} />
      </Suspense>
    </Canvas>
  );
}
