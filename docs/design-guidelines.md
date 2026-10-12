# Design Guidelines

All styles are written using **Tailwind CSS** utility classes (e.g. `rounded-full`, `text-lg`, `px-6`).

## Colors

| Token | Hex | Usage |
|---|---|---|
| Primary Background | `#FFFEF8` | Page backgrounds, light sections |
| Secondary Background | `#CCA077` | Brand accent — buttons, highlights, active states, glows |
| Primary Text | `#070401` | All body and heading text on light backgrounds |
| Neutral | `#BFB9B5` | Inactive UI elements, borders, muted states |

### Dark surface color
| Usage | Hex |
|---|---|
| Darkest surface | `#0A0A0A` |
| Dark card | `#0F0F0F` |
| Dark card (lighter) | `#1A1A1A` |

### Light section background
| Usage | Hex |
|---|---|
| Warm off-white sections | `#F7F2EA` |

---

## Typography

### Typefaces
| Role | Font |
|---|---|
| Primary (sans) | **Inter** |
| Serif / Accent | **Source Serif 4** |

Inter is used for all body copy, UI labels, and headings. Source Serif 4 is used exclusively for italic accent text — chapter labels, pull quotes, brand moments (e.g. *"Company X"*, *Chapter 01*).

### Source Serif 4 weights loaded
`400`, `600`, `700` — normal and italic styles.

### Type scale (as used in the results page)
| Element | Size | Weight | Notes |
|---|---|---|---|
| Hero heading | `text-8xl` (desktop) / `text-4xl` (mobile) | Bold | Tight tracking |
| Chapter heading | `text-7xl` (desktop) / `text-5xl` (mobile) | Bold | `leading-tighter tracking-tighter` |
| Section subheading | `text-5xl` / `text-3xl` | Bold | |
| Chapter label | `text-2xl` | Regular italic | Source Serif 4, `text-secondary-background` |
| Body copy | `text-lg`–`text-xl` | Medium (500) | `leading-relaxed` |
| UI labels / tags | `text-xs`–`text-sm` | Black (900) | `uppercase tracking-[0.2em]` or `tracking-widest` |

---

## Border Radius

| Usage | Value |
|---|---|
| Small UI elements (pills, tags) | `rounded-full` |
| Cards, modals | `rounded-[32px]`–`rounded-[48px]` |
| Video player container | `rounded-[40px]` |
| Base radius token | `0.625rem` (10px) |

---

## Spacing & Layout

- Max content width: `max-w-7xl` (1280px)
- Page horizontal padding: `px-6` (mobile) / `px-16` (desktop)
- Section vertical rhythm: `py-20`–`py-32`, chapter gaps `space-y-32 md:space-y-48`
- Two-column layout breakpoint: `lg` (1024px)
- Card grid breakpoint: `xl` (1280px) — switches from 2×2 grid to single row

---

## Shadows & Depth

- Standard card shadow: `shadow-2xl`
- Video glow effect: `bg-secondary-background/20` blurred behind the player container (`blur-2xl`)
- Dark section ambient glow: large `blur-[120px]`–`blur-[150px]` circles at low opacity (`/5`–`/10`)

---

## Motion

Animations are done with **Framer Motion**. Scroll-driven animations use **GSAP + ScrollTrigger**. Smooth scrolling uses **Lenis**.

| Pattern | Values |
|---|---|
| Standard fade-in | `opacity: 0→1`, `y: 30→0`, `duration: 0.8` |
| Card entrance | `opacity + scale 0.9→1 + x offset`, `duration: 0.8` |
| Hero transition | `duration: 1.5`, custom cubic easing |
| Scroll thread animation | GSAP `strokeDashoffset` scrub, `start: "top center"`, `end: "center center"` |

---

## Key UI Patterns

### Video player
Portrait aspect ratio `9:16`, rounded `32px`, dark background, `border border-white/10`. Glowing halo behind it using `secondary-background` at low opacity.

### Chapter cards (dark)
Background `#0F0F0F`–`#1A1A1A`, `rounded-[48px]`, `border border-white/5`–`border-white/10`, large padding `p-8 md:p-16`. Ambient glow blobs in corners.

### Light sections
Background `#F7F2EA`. Cards and content on `bg-primary-background` (`#FFFEF8`).

### Progress / status pills
`rounded-full`, `bg-secondary-background`, white text, `text-xs font-bold uppercase tracking-[0.2em]`.
