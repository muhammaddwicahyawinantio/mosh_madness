"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, type ShaderMaterial, type Texture } from "three";
import type { MotionValue } from "motion/react";
import { ASSETS } from "@/lib/constants";
import { heroShader } from "@/lib/motion";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexBlack;
  uniform sampler2D uTexWhite;
  uniform float uProgress;
  uniform float uTime;
  uniform float uPlaneAspect;
  uniform float uImageAspect;
  uniform vec2 uMouse;
  uniform float uRippleSpeed;
  uniform float uRippleFreq;
  uniform float uRippleStrength;
  uniform float uWipeFeather;
  uniform float uMouseParallax;
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

    /* Parallax halus mengikuti mouse */
    uv += (uMouse - 0.5) * uMouseParallax;

    /* Ripple radial di sekitar kursor */
    vec2 p = (vUv - uMouse) * vec2(uPlaneAspect, 1.0);
    float d = length(p);
    float ripple = sin(d * uRippleFreq - uTime * uRippleSpeed)
      * uRippleStrength * smoothstep(0.6, 0.0, d);
    uv += normalize(p + 1e-6) * ripple;

    /* Idle wave sangat halus — kain bernafas */
    uv.y += sin(uv.x * 6.0 + uTime * 0.4) * 0.0015;

    vec4 cBlack = texture2D(uTexBlack, uv);
    vec4 cWhite = texture2D(uTexWhite, uv);

    /* Soft wipe mengikuti progress, tepinya di-warp ripple */
    float t = mix(-uWipeFeather, 1.0 + uWipeFeather, uProgress);
    float m = 1.0 - smoothstep(t - uWipeFeather, t + uWipeFeather, vUv.x + ripple * 6.0);

    vec3 color = mix(cBlack.rgb, cWhite.rgb, m);

    /* Vignette tipis — fokus ke tengah garment */
    float vig = 1.0 - 0.22 * smoothstep(0.5, 1.1, length(vUv - 0.5) * 1.5);
    gl_FragColor = vec4(color * vig, 1.0);
  }
`;

type SceneProps = {
  /** Target crossfade 0 (hitam) → 1 (putih) — di-lerp di shader loop */
  progress: MotionValue<number>;
  /** Posisi pointer relatif section, 0..1 */
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

function GarmentPlane({ progress, mouseX, mouseY }: SceneProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const [texBlack, texWhite] = useTexture(
    [ASSETS.hero.black, ASSETS.hero.white],
    (textures: Texture[]) => {
      for (const t of textures) t.colorSpace = SRGBColorSpace;
    },
  ) as [Texture, Texture];

  const image = texBlack.image as { width: number; height: number };

  const uniforms = useMemo(
    () => ({
      uTexBlack: { value: texBlack },
      uTexWhite: { value: texWhite },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPlaneAspect: { value: 1 },
      uImageAspect: { value: image.width / image.height },
      uMouse: { value: { x: 0.5, y: 0.5 } },
      uRippleSpeed: { value: heroShader.rippleSpeed },
      uRippleFreq: { value: heroShader.rippleFrequency },
      uRippleStrength: { value: heroShader.rippleStrength },
      uWipeFeather: { value: heroShader.wipeFeather },
      uMouseParallax: { value: heroShader.mouseParallax },
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

    // Lerp menuju target — gerak organik tanpa spring eksternal
    if (u.uProgress) {
      u.uProgress.value +=
        (progress.get() - (u.uProgress.value as number)) *
        heroShader.progressLerp * (delta * 60);
    }
    if (u.uMouse) {
      const m = u.uMouse.value as { x: number; y: number };
      m.x += (mouseX.get() - m.x) * heroShader.mouseLerp * (delta * 60);
      m.y += (1 - mouseY.get() - m.y) * heroShader.mouseLerp * (delta * 60);
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
 * Background WebGL hero — crossfade garment hitam↔putih di fragment
 * shader: soft wipe mengikuti pointer, ripple radial di kursor, idle
 * wave halus. DPR capped [1, 1.5] (DESIGN.md §6).
 */
export default function HeroScene(props: SceneProps & { active: boolean }) {
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
        <GarmentPlane {...scene} />
      </Suspense>
    </Canvas>
  );
}
