---
name: Mosh Madness Editorial
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#ffb3b1'
  on-secondary: '#680010'
  secondary-container: '#b60025'
  on-secondary-container: '#ffc2c0'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001b'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Death Stinger
    fontSize: 120px
    fontWeight: '400'
    lineHeight: 110px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 60px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 44px
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  meta:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  accent-metal:
    fontFamily: Metal Mania
    fontSize: 20px
    fontWeight: '400'
    letterSpacing: 0.04em
  price:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 24px
spacing:
  grid-margin: 2rem
  gutter: 1rem
  section-gap: 8rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
---

## Brand & Style
The brand personality is aggressive, raw, and uncompromisingly urban. This design system focuses on a **Dark Editorial / Minimalist Grunge** aesthetic, characterized by high-contrast layouts that mirror physical streetwear lookbooks. 

The visual language utilizes heavy, industrial-grade typography and a rigid, structural grid that occasionally breaks for "chaotic" grunge accents—mimicking the energy of a mosh pit. The target audience is youth-culture-centric, valuing authenticity over polish. The emotional response should be one of intensity and exclusivity.

## Colors
The palette is intentionally restricted to maintain a stark, authoritative presence.
- **Primary (White):** Used for maximum legibility of headlines and critical CTAs against the dark background.
- **Background (Pure Black):** The canvas for all content, providing a deep, immersive experience.
- **Secondary (Red):** Reserved strictly for urgency—discounts, "Sold Out" tags, and sale-specific UI elements.
- **Neutral (Grey Scale):** Darker greys (`#1A1A1A`) are used for product card containers to distinguish them slightly from the pure black backdrop. Mid-greys are used for secondary metadata to reduce visual noise.

## Typography
Typography is the primary driver of the brand's attitude. Five roles, each mapped to a CSS token in `globals.css` (`--font-display`, `--font-headline`, `--font-body`, `--font-mono`, `--font-metal`).
- **Death Stinger** (`--font-display`) is the "voice" of the brand — a bold blackletter/gothic display face reserved for **hero-scale display only**: the hero headline (`display-xl`) and the navbar "MOSH MADNESS" logo. Big-text moments that overlap imagery or bleed off the edge. Never body/labels. Self-hosted `.otf` at `app/fonts/death-stinger.otf`.
- **Bebas Neue** (`--font-headline`) carries the regular **section headlines** — `headline-lg`, `headline-lg-mobile`, `headline-md` (e.g. "Pilihan barisan depan", footer brand, admin header). Condensed, uppercase, high-impact but calmer than Death Stinger.
- **Hanken Grotesk** (`--font-body`) is the readable **body** face — manifesto/typewriter copy in About, product descriptions (`body-lg`, `body-md`). Natural case.
- **JetBrains Mono** (`--font-mono`) is the **utility/data** face — technical labels (`label-caps`, uppercase), price (`price`), and natural-case metadata (`meta`): counters (`004 /`), nav index, footer links, "Sponsored by", copyright.
- **Metal Mania** (`--font-metal`) is a decorative accent used in **exactly two places**: all marquee strips and the slogan ("Inovasi Digital Untuk Kemandirian UMKM Lokal"). Nowhere else.

> Bebas Neue, Hanken Grotesk, JetBrains Mono, and Metal Mania load via `next/font/google` (auto self-hosted at build — no external `<link>` at runtime). Death Stinger stays a local `.otf`.
> ✅ **Licensing note:** Bebas Neue, Hanken Grotesk, JetBrains Mono, Metal Mania are all OFL (free for commercial use). Confirm the commercial license status of Death Stinger before launch.
> 🗑️ **Removed:** Creepster is no longer used anywhere. The old `app/fonts/creepster-regular.woff2` (and `hold-money-regular.ttf`) remain on disk but are unreferenced.

## Layout & Spacing
The layout follows a **Fixed 12-Column Grid** for desktop and a **4-Column Grid** for mobile. 
- **Editorial Overlaps:** High-impact sections should use negative margins to allow "Death Stinger" headlines to sit behind or over product imagery.
- **Brutalist Bordering:** Use 1px solid borders (`#333333`) to define grid cells, especially in product listings, creating a structural "blueprint" feel.
- **Breathing Room:** While the typography is loud, the section gaps are massive (`8rem`) to prevent the design from feeling cluttered. Content should feel like it has been "placed" with intent on a large dark stage.

## Elevation & Depth
This design system avoids traditional shadows and soft blurs. Depth is achieved through **Tonal Layering** and **Bold Outlines**:
- **Flat Stack:** All elements exist on the same physical plane. Hierarchy is defined by color (White on Black) rather than Z-index shadows.
- **Dividers:** Use sharp 1px or 2px lines to separate content blocks. 
- **Inverted Surfaces:** Hover states should involve total color inversion (e.g., a white button becomes black with white text) rather than a shadow lift.
- **Texture:** Subtle film grain or noise overlays can be applied to the background to break the digital perfection and enhance the "grunge" feel.

## Shapes
The shape language is strictly **Sharp (0px)**. Rounded corners are prohibited as they soften the brand's aggressive edge. 
- **Buttons:** Perfectly rectangular with no radius.
- **Product Cards:** Defined by sharp borders or high-contrast edge-to-edge imagery.
- **Image Treatment:** Use hard-cropped edges. Avoid masks or soft fades.

## Components
- **Buttons:** Primary buttons are solid white rectangles with black all-caps text. Secondary buttons use a 1px white border with no fill. All hover states should be an immediate, non-transitioned color inversion.
- **Product Cards:** Image-centric. The price and title should appear in the `label-caps` or `price` style below a sharp divider line.
- **Input Fields:** Bottom-border only (`1px white`). Place labels in the top-left in the `label-caps` style using `Hold Money`.
- **Chips/Tags:** Used for "New Arrival" or "Limited Edition". These should look like industrial labels—black fill with white 1px border and monospaced text.
- **Marquee:** Use a scrolling horizontal marquee for "Sale" announcements or brand slogans to add dynamic motion to the rigid grid.
- **Navigation:** A minimalist top-bar with a centered logo. The "Catalog" trigger should be a simple text link with a "plus" icon, adhering to the monospaced utility style.