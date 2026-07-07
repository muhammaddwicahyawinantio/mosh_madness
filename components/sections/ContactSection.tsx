"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { SplitText } from "@/components/shared/SplitText";
import { BRAND, DUMMY_IMAGES, SOCIAL } from "@/lib/constants";
import {
  contactCreateSchema,
  type ContactCreateInput,
} from "@/lib/validators";
import {
  duration,
  easeBrand,
  imageZoom,
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

/**
 * S4 Contact — form name/kontak/pesan dengan input bottom-border
 * (DESIGN.md §8): focus → border & label accent-666 + glyph "//".
 * Submit tersimpan ke DB via /api/contact (REFACTOR-06, keputusan
 * Ilham) — validasi react-hook-form + zod, error inline in-system.
 */
export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    [imageZoom.from, imageZoom.to],
  );

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
      ref={sectionRef}
      id="contact"
      aria-label="Kontak"
      className="relative mx-auto max-w-[1600px] px-4 py-32 md:px-8"
    >
      <span
        aria-hidden="true"
        className="type-label text-vertical absolute left-2 top-32 hidden text-outline lg:block"
      >
        Kontak / {BRAND.sku}
      </span>

      <motion.div
        variants={revealStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid gap-12 lg:grid-cols-12 lg:gap-8"
      >
        {/* Copy + direct links */}
        <div className="lg:col-span-5 lg:col-start-2">
          <motion.p variants={revealUp} className="type-label mb-6 text-accent-666">
            003 / Kontak
          </motion.p>
          <h2 className="type-headline-lg text-primary">
            <SplitText text="Masuk ke" />
            <br />
            <SplitText text="barisan" delay={0.2} />
          </h2>
          <motion.p
            variants={revealUp}
            className="type-body-lg mt-8 max-w-md text-on-surface-variant"
          >
            Kolaborasi, stok, atau sekadar teriak — tulis di sini, kami balas
            lewat kontak yang lo tinggalin. Mau instan? Tembak langsung ke
            WhatsApp.
          </motion.p>
          {/* Foto dummy — parallax zoom, kebaca sebagai depth layer */}
          <motion.div
            variants={wipeUp}
            className="relative mt-10 hidden aspect-[4/3] max-w-sm overflow-hidden border border-outline-variant lg:block"
          >
            <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
              <SafeImage
                src={DUMMY_IMAGES.contact}
                alt="Studio Mosh Madness"
                fallbackLabel="Kontak / asset menyusul"
                fill
                sizes="(min-width: 1024px) 30vw, 0px"
                className="object-cover"
              />
            </motion.div>
            <span className="type-label absolute bottom-3 left-3 bg-surface-lowest px-2 py-1 text-on-surface-variant">
              Basecamp — Banjarmasin
            </span>
          </motion.div>

          <motion.div variants={revealUp} className="mt-10 flex gap-6">
            <a
              href={SOCIAL.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label hover-invert -mx-2 inline-flex items-center gap-1 px-2 py-1 text-primary"
            >
              WhatsApp <ArrowUpRight size={12} />
            </a>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="type-label hover-invert -mx-2 inline-flex items-center gap-1 px-2 py-1 text-primary"
            >
              Instagram <ArrowUpRight size={12} />
            </a>
          </motion.div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-10 lg:col-span-5 lg:col-start-8"
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
    </section>
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
