"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { SplitText } from "@/components/shared/SplitText";
import { BRAND, DUMMY_IMAGES, SOCIAL } from "@/lib/constants";
import {
  imageZoom,
  revealStagger,
  revealUp,
  viewportOnce,
  wipeUp,
} from "@/lib/motion";

/**
 * S4 Contact — form name/kontak/pesan dengan input bottom-border
 * (DESIGN.md §8): focus → border & label accent-666 + glyph "//".
 * Submit membuka WhatsApp dengan pesan terisi (tidak ada API contact).
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

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = [
      `Halo ${BRAND.name}, saya ${name.trim()}.`,
      `Kontak: ${contact.trim()}`,
      "",
      message.trim(),
    ].join("\n");
    const waNumber = SOCIAL.whatsapp.replace(/\D+/g, "");
    window.open(
      `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSent(true);
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
            Kolaborasi, stok, atau sekadar teriak — pesan lo langsung tembus
            ke WhatsApp kami. Tanpa formalitas.
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
          onSubmit={handleSubmit}
          className="flex flex-col gap-10 lg:col-span-5 lg:col-start-8"
        >
          <ContactField label="Nama" htmlFor="contact-name" index="01">
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Siapa lo"
              className="w-full bg-transparent pb-3 pt-2 text-on-surface outline-none placeholder:text-outline-variant"
            />
          </ContactField>

          <ContactField
            label="Email / WhatsApp"
            htmlFor="contact-contact"
            index="02"
          >
            <input
              id="contact-contact"
              name="contact"
              type="text"
              required
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Biar bisa dibalas"
              className="w-full bg-transparent pb-3 pt-2 text-on-surface outline-none placeholder:text-outline-variant"
            />
          </ContactField>

          <ContactField label="Pesan" htmlFor="contact-message" index="03">
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Teriak di sini"
              className="w-full resize-none bg-transparent pb-3 pt-2 text-on-surface outline-none placeholder:text-outline-variant"
            />
          </ContactField>

          <motion.div variants={revealUp} className="flex items-center gap-4">
            <button
              type="submit"
              className="type-label group inline-flex items-center gap-2 border border-primary bg-primary px-8 py-4 text-on-primary hover:bg-transparent hover:text-primary"
            >
              Kirim via WhatsApp
              <ArrowUpRight size={14} />
            </button>
            {sent && (
              <p className="type-label text-on-surface-variant" role="status">
                WhatsApp kebuka — tinggal kirim.
              </p>
            )}
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
}

/** Field bottom-border — label mono kiri-atas, focus → accent-666 + glyph */
function ContactField({
  label,
  htmlFor,
  index,
  children,
}: {
  label: string;
  htmlFor: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={revealUp}
      className="group/field border-b border-outline-variant focus-within:border-accent-666"
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
    </motion.div>
  );
}
