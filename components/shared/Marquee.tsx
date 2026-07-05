import { marqueeDuration } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** Teks yang di-loop, mis. "MOSH MADNESS — EST. 16.05.24" */
  text: string;
  /** Berapa kali teks diulang per track (track diduplikat 2x untuk loop mulus) */
  repeat?: number;
  className?: string;
};

/**
 * Marquee strip putih / teks hitam mono (DESIGN.md §8). Pure CSS
 * (keyframes `marquee` di globals.css) — pause otomatis di
 * prefers-reduced-motion. Server component, zero JS.
 */
export function Marquee({ text, repeat = 6, className }: MarqueeProps) {
  const items = Array.from({ length: repeat }, (_, i) => (
    <span key={i} className="type-label px-6 py-2 text-on-primary">
      {text}
    </span>
  ));

  return (
    <div
      className={cn(
        "overflow-hidden border-y border-surface-lowest bg-primary",
        className,
      )}
      aria-label={text}
      role="marquee"
      style={{ "--marquee-duration": `${marqueeDuration}s` } as React.CSSProperties}
    >
      <div className="marquee-track flex w-max">
        <div className="flex shrink-0">{items}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {items}
        </div>
      </div>
    </div>
  );
}
