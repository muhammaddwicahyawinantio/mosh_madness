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
    fontFamily: Death Stinger
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 60px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Death Stinger
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 44px
  headline-md:
    fontFamily: Death Stinger
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Hold Money
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hold Money
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hold Money
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  price:
    fontFamily: Hold Money
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
Typography is the primary driver of the brand's attitude.
- **Death Stinger** is the "voice" of the brand — a bold blackletter/gothic display face used exclusively for large-scale headlines: the hero headline, section titles (`display-xl`, `headline-lg`, `headline-lg-mobile`, `headline-md`). It should be used at large scales, often overlapping images or bleeding off the edge of the container to create a sense of scale. Reserved for "big text" moments only — never for body copy or small UI labels, since its density and grunge texture only read clearly at large sizes.
- **Hold Money** carries everything else — body copy, product descriptions, technical labels (SKUs, sizes, materials), and price tags (`body-lg`, `body-md`, `label-caps`, `price`). Its rough, distressed blackletter character keeps the grunge/technical utilitarian layer consistent even at smaller sizes.

> ⚠️ **Licensing note:** the `HoldMoney-Regular.ttf` currently on hand is a **demo build, personal-use only** (per the font's own ReadMe) — it is not licensed for a commercial storefront. The commercial license needs to be purchased at alitdesign.net before this typeface ships to production. Confirm the commercial license status of Death Stinger as well before launch.

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