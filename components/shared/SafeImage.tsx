"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SafeImageProps = ImageProps & {
  /** Label di placeholder kalau asset belum ada. Default: alt. */
  fallbackLabel?: string;
};

/**
 * next/image dengan fallback dark-editorial kalau file belum ditaruh Ilham
 * (CLAUDE.md — jangan crash kalau asset kosong). Placeholder mengikuti
 * ukuran/className yang sama supaya layout tidak geser.
 */
export function SafeImage({
  fallbackLabel,
  className,
  alt,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "bg-blueprint flex items-center justify-center border border-outline-variant bg-surface-low",
          props.fill && "absolute inset-0",
          className,
        )}
        style={
          !props.fill && props.width && props.height
            ? { aspectRatio: `${props.width} / ${props.height}` }
            : undefined
        }
      >
        <span className="type-label px-4 text-center text-on-surface-variant">
          {fallbackLabel ?? alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
