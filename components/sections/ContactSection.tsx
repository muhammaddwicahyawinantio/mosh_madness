"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { AutoVideo } from "@/components/shared/AutoVideo";
import { SplitText } from "@/components/shared/SplitText";
import { ASSETS, BRAND, SOCIAL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  contactCreateSchema,
  type ContactCreateInput,
} from "@/lib/validators";
import {
  duration,
  easeBrand,
  revealStagger,
  revealUp,
  viewportOnce,
  wipeUp,
} from "@/lib/motion";

type SubmitStatus = "idle" | "sending" | "sent" | "error";

/** Label tombol per status — swap dengan slide-y signature, bukan spinner */
const BUTTON_LABEL: Record<SubmitStatus, string> = {
  idle: "Kirim pesan",
  sending: "Mengirim…",
  sent: "Diterima — 666",
  error: "Gagal — coba lagi",
};

type ContactSectionProps = {
  /** Link & alamat dari DB (SiteContent contact.*) — fallback konstanta */
  whatsapp?: string;
  instagram?: string;
  address?: string;
};

/**
 * S4 Contact — form name/kontak/pesan dengan input bottom-border
 * (DESIGN.md §8): focus → border & label accent-666 + glyph "//".
 * Submit tersimpan ke DB via /api/contact (REFACTOR-06, keputusan
 * Ilham) — validasi react-hook-form + zod, error inline in-system.
 *
 * REVISI: ukuran distandarkan (form di tengah, lebih ramping), diberi
 * background on-brand (about-section.png) + scrim gelap biar teks tetap
 * kebaca, dan 2 video reel dekoratif — kiri.mp4 pojok kiri-atas,
 * kanan.mp4 pojok kanan-bawah — loop tanpa henti & TIDAK menutupi form
 * (pointer-events-none, di gutter samping saat desktop; menumpuk rapi
 * di atas/bawah form saat mobile).
 */
export function ContactSection({
  whatsapp = SOCIAL.whatsapp,
  instagram = SOCIAL.instagram,
  address = BRAND.location,
}: ContactSectionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactCreateInput>({
    resolver: zodResolver(contactCreateSchema),
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const onSubmit = async (data: ContactCreateInput) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Contact API ${res.status}`);
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      aria-label="Kontak"
      className="relative isolate overflow-hidden"
    >
      {/* Background on-brand (studio garment) + scrim gelap biar form kebaca */}
      <SafeImage
        src={ASSETS.about}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-surface-lowest/88"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-lowest via-transparent to-surface-lowest"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-28">
        {/* kiri.mp4 — mobile: blok di atas form; desktop: pojok kiri-atas */}
        <ContactReel
          src="/assets/videos/kiri.mp4"
          label="Reel / kiri"
          className="mx-auto mb-8 w-full max-w-[200px] lg:absolute lg:left-0 lg:top-6 lg:mb-0 lg:w-52 lg:max-w-none xl:w-60"
        />

        {/* Konten form — standar, di tengah, di antara kedua reel */}
        <motion.div
          variants={revealStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-xl"
        >
          <motion.p variants={revealUp} className="type-label mb-6 text-accent-666">
            003 / Kontak
          </motion.p>
          <h2 className="type-headline-lg text-primary max-md:text-4xl">
            <SplitText text="Masuk ke" />
            <br />
            <SplitText text="barisan" delay={0.2} />
          </h2>
          <motion.p
            variants={revealUp}
            className="type-body-lg mt-6 text-on-surface-variant md:mt-8"
          >
            Kolaborasi, stok, atau sekadar teriak — tulis di sini, kami balas
            lewat kontak yang lo tinggalin. Mau instan? Tembak langsung ke
            WhatsApp.
          </motion.p>
          <motion.p variants={revealUp} className="type-label mt-8 text-on-surface-variant">
            Basecamp — {address}
          </motion.p>

          <motion.div variants={revealUp} className="mt-4 flex gap-6">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label hover-invert -mx-2 inline-flex items-center gap-1 px-2 py-1 text-primary"
            >
              WhatsApp <ArrowUpRight size={12} />
            </a>
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label hover-invert -mx-2 inline-flex items-center gap-1 px-2 py-1 text-primary"
            >
              Instagram <ArrowUpRight size={12} />
            </a>
          </motion.div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-8 flex flex-col gap-7 md:mt-12 md:gap-10"
          >
            <ContactField
              label="Nama"
              htmlFor="contact-name"
              index="01"
              error={errors.name?.message}
            >
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                placeholder="Siapa lo"
                aria-invalid={errors.name ? true : undefined}
                className="w-full bg-transparent pb-3 pt-2 text-on-surface outline-none placeholder:text-outline-variant"
                {...register("name")}
              />
            </ContactField>

            <ContactField
              label="Email / WhatsApp"
              htmlFor="contact-contact"
              index="02"
              error={errors.email?.message}
            >
              <input
                id="contact-contact"
                type="text"
                autoComplete="email"
                placeholder="Biar bisa dibalas"
                aria-invalid={errors.email ? true : undefined}
                className="w-full bg-transparent pb-3 pt-2 text-on-surface outline-none placeholder:text-outline-variant"
                {...register("email")}
              />
            </ContactField>

            {/* Honeypot — bot ngisi, manusia nggak lihat */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              {...register("website")}
            />

            <ContactField
              label="Pesan"
              htmlFor="contact-message"
              index="03"
              error={errors.message?.message}
            >
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Teriak di sini"
                aria-invalid={errors.message ? true : undefined}
                className="w-full resize-none bg-transparent pb-3 pt-2 text-on-surface outline-none placeholder:text-outline-variant"
                {...register("message")}
              />
            </ContactField>

            <motion.div variants={revealUp} className="flex items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="type-label group inline-flex items-center gap-2 overflow-hidden border border-primary bg-primary px-8 py-4 text-on-primary hover:bg-transparent hover:text-primary disabled:opacity-70"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={status}
                    initial={{ y: "120%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-120%", opacity: 0 }}
                    transition={{ duration: duration.fast, ease: easeBrand }}
                    className="inline-block"
                  >
                    {BUTTON_LABEL[status]}
                  </motion.span>
                </AnimatePresence>
                <ArrowUpRight size={14} />
              </button>
              <p className="type-label text-on-surface-variant" role="status">
                {status === "sent" &&
                  "Pesan masuk barisan — kami balas secepatnya."}
                {status === "error" &&
                  "Ada yang macet di jalur kami. Coba lagi, atau tembak WhatsApp."}
              </p>
            </motion.div>
          </form>
        </motion.div>

        {/* kanan.mp4 — mobile: blok di bawah form; desktop: pojok kanan-bawah */}
        <ContactReel
          src="/assets/videos/kanan.mp4"
          label="Reel / kanan"
          className="mx-auto mt-8 w-full max-w-[200px] lg:absolute lg:bottom-6 lg:right-0 lg:mt-0 lg:w-52 lg:max-w-none xl:w-60"
        />
      </div>
    </section>
  );
}

/**
 * Reel dekoratif — video loop tanpa henti (AutoVideo eager) di dalam kartu
 * bertepi tajam. pointer-events-none → dijamin TIDAK memblokir form.
 * Reveal wipe on-scroll sebagai "sedikit animasi".
 */
function ContactReel({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  return (
    <motion.figure
      variants={wipeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      aria-hidden="true"
      className={cn(
        "pointer-events-none border border-outline-variant bg-white/5 p-2 backdrop-blur-sm",
        className,
      )}
    >
      <AutoVideo
        src={src}
        eager
        className="aspect-video w-full border border-outline-variant"
      />
      <figcaption className="type-label px-1 pb-1 pt-2 text-on-surface-variant">
        {label} — 666
      </figcaption>
    </motion.figure>
  );
}

/** Field bottom-border — label mono kiri-atas, focus → accent-666 + glyph,
 *  error zod inline di bawah garis (REFACTOR-06) */
function ContactField({
  label,
  htmlFor,
  index,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  index: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={revealUp}>
      <div
        className={`group/field border-b ${
          error
            ? "border-error"
            : "border-outline-variant focus-within:border-accent-666"
        }`}
      >
        <label
          htmlFor={htmlFor}
          className="type-label flex items-center justify-between text-on-surface-variant group-focus-within/field:text-accent-666"
        >
          <span>
            {index} / {label}
          </span>
          <span
            aria-hidden="true"
            className="opacity-0 group-focus-within/field:opacity-100"
          >
            {"//666"}
          </span>
        </label>
        {children}
      </div>
      {error && (
        <p className="type-label mt-2 text-error" role="alert">
          {error}
        </p>
      )}
    </motion.div>
  );
}
