"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { typewriter } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

type TypewriterProps = {
  text: string;
  className?: string;
  /** Delay sebelum karakter pertama (detik) */
  delay?: number;
};

/**
 * Typewriter reveal (REFACTOR-02) — mengetik SEKALI saat masuk viewport,
 * tanpa loop delete/retype (looping = gimmick chat-bot, bukan editorial).
 * Reduced motion: teks langsung utuh. Teks penuh selalu tersedia untuk
 * screen reader via aria-label.
 */
export function Typewriter({ text, className, delay = 0 }: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    let intervalId = 0;
    const timeoutId = window.setTimeout(() => {
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) window.clearInterval(intervalId);
      }, typewriter.charDelay * 1000);
    }, delay * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [inView, reduced, text, delay]);

  const finished = count >= text.length;
  const shown = reduced ? text : text.slice(0, count);

  return (
    <span
      ref={ref}
      aria-label={text}
      role="text"
      className={cn("inline-block whitespace-pre-wrap", className)}
    >
      <span aria-hidden="true">{shown}</span>
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="inline-block w-[0.55em] select-none"
          animate={
            finished
              ? { opacity: 0, transition: { duration: typewriter.cursorBlink } }
              : { opacity: [1, 0, 1] }
          }
          transition={{ duration: typewriter.cursorBlink, repeat: Infinity }}
        >
          ▍
        </motion.span>
      )}
    </span>
  );
}
