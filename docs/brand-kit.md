# Company X — Brand Kit
> Visual system for the questionnaire and report. Company name, logo, and favicon live in `instance.config.json` and do not change these components.

---

## Colors

### Primary Palette

| Name | Hex | Tailwind Class | Usage |
|---|---|---|---|
| Cream | `#FFFEF8` | `bg-primary-background` | Page background |
| Warm Beige | `#F7F2EA` | `bg-[#F7F2EA]` | Section backgrounds, light chapters |
| Tan (Brand Accent) | `#CCA077` | `bg-secondary-background` | Buttons, CTAs, chapter labels, glows, active nav |
| Near-Black | `#070401` | `text-primary-text` | All body and heading text |
| Neutral | `#BFB9B5` | — | Borders, muted/inactive states |
| Cyan | `#4DF5F5` | `bg-accent` | Sparingly only — special callouts |

### Dark Surface Palette

| Hex | Usage |
|---|---|
| `#0A0A0A` | Darkest backgrounds (Ch4) |
| `#0F0F0F` | Dark chapter cards (Ch2) |
| `#1A1A1A` | Dark cards, lighter dark surfaces |
| `#141414` | CTA boxes on dark sections |

### Supporting Tones

| Hex | Usage |
|---|---|
| `#EFE9DE` | Alternate warm off-white (glow zones) |
| `#F2EDE4` | Progress nav background |

### Opacity Variants (used in code)
- `bg-secondary-background/5` → very subtle warm glow
- `bg-secondary-background/10` → soft glow
- `bg-secondary-background/20` → visible glow behind video
- `bg-black/40`, `/60`, `/80`, `/95` → dark overlays
- `border-white/5`, `/10`, `/20` → subtle borders on dark surfaces
- `border-black/5` → subtle borders on light surfaces

---

## Typography

### Fonts

| Font | Role | Where |
|---|---|---|
| **Inter** | Primary — all UI, body, headings | Everything except accent moments |
| **Source Serif 4** | Accent — italic only | Chapter labels, pull quotes, brand moments |

### Source Serif 4 weights loaded: `400`, `600`, `700` — normal + italic

### Type Scale

| Element | Size (desktop) | Size (mobile) | Weight | Style | Notes |
|---|---|---|---|---|---|
| Hero heading | `text-8xl` | `text-4xl` | `font-bold` | Inter | Tight tracking |
| Chapter heading | `text-7xl` | `text-5xl` | `font-bold` | Inter | `leading-[0.9] tracking-tighter` |
| Section heading | `text-6xl`–`text-5xl` | `text-4xl` | `font-bold` | Inter | |
| Subheading | `text-4xl`–`text-3xl` | `text-2xl` | `font-bold` | Inter | |
| Chapter label | `text-2xl` | `text-xl` | Regular italic | Source Serif 4 | `text-secondary-background` |
| Body copy | `text-xl`–`text-lg` | `text-lg` | `font-medium` | Inter | `leading-relaxed` |
| UI tags / pills | `text-xs`–`text-sm` | `text-xs` | `font-black` | Inter | `uppercase tracking-[0.2em]`–`tracking-[0.5em]` |
| Metadata / mono | `text-[10px]`–`text-xs` | same | `font-mono` | Inter | Card metadata |
| Watermark numbers | `text-9xl` | — | — | Inter | Very low opacity |

### Letter Spacing
- `tracking-tight` — headings
- `tracking-tighter` — chapter headings
- `tracking-[0.2em]` — standard uppercase labels
- `tracking-[0.3em]`–`tracking-[0.5em]` — wide uppercase labels (section markers)
- `tracking-widest` — maximum spread labels

### Line Heights
- `leading-[0.85]`–`leading-[0.9]` — display/hero headings
- `leading-tight` — standard headings
- `leading-normal` — default
- `leading-relaxed` — body copy

---

## Border Radius

| Value | Usage |
|---|---|
| `rounded-full` | Pills, tags, nav items, play buttons, circles |
| `rounded-[40px]` | Video player containers |
| `rounded-[40px]` | Cards, section containers |
| `rounded-[48px]` | Large chapter cards |
| `rounded-[3rem]` (48px) | CTA boxes |
| `rounded-[1.5rem]`–`rounded-[2.5rem]` | Section cards (responsive) |
| `rounded-3xl` | Overlays |

---

## Spacing & Layout

### Container
```
max-w-7xl mx-auto px-6 md:px-12 lg:px-16
```

### Section Rhythm
- Section vertical padding: `py-20`–`py-32`
- Chapter gaps: `space-y-32 md:space-y-48`
- Card padding (light): `p-12`
- Card padding (dark): `p-8 md:p-16`
- CTA box padding: `p-12`–`p-16`

### Gaps
- Card grid: `gap-8`–`gap-12`
- Inline elements: `gap-3`–`gap-6`
- Major sections: `gap-24`

---

## Shadows & Depth

| Usage | Value |
|---|---|
| Standard card | `shadow-2xl` |
| Light card | `shadow-sm` |
| Video container | `shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]` |
| CTA box | `shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]` |
| Warm button | `shadow-[0_20px_40px_-10px_rgba(204,160,119,0.4)]` |
| Section divider | `shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)]` |
| Progress nav | `shadow-[0_20px_50px_rgba(0,0,0,0.15)]` |

### Glow Effects
- Video halo: `bg-secondary-background/20 blur-2xl` behind player
- Ambient section glow: `bg-secondary-background/5 blur-[120px]`–`blur-[150px]`
- Dark chapter corner blobs: large, very low opacity

---

## Borders

| Usage | Value |
|---|---|
| Light card subtle | `border border-black/5` |
| Dark card subtle | `border border-white/5`–`border-white/10` |
| Video player rim | `border-[6px] border-secondary-background` |
| Dark overlay | `border border-white/50` |
| Divider line | `h-px bg-black/10` |

---

## Motion & Animation

### Libraries
- **Framer Motion** — component animations
- **GSAP + ScrollTrigger** — scroll-driven animations (SVG threads, parallax)
- **Lenis** — smooth scrolling (`duration: 1.2`, exponential easing)

### Framer Motion Patterns

| Pattern | Config |
|---|---|
| Standard fade-in | `initial={{ opacity: 0, y: 30 }}` → `whileInView={{ opacity: 1, y: 0 }}` `duration: 0.8` |
| Card entrance | `initial={{ opacity: 0, scale: 0.9, x: 50 }}` → same target `duration: 0.8` |
| Hero entrance | `initial={{ opacity: 0, scale: 0.92, filter: "blur(20px)", y: -20 }}` `duration: 1.5` `ease: [0.43, 0.13, 0.23, 0.96]` |
| Slide from left | `initial={{ opacity: 0, x: -50 }}` `duration: 1.2` `ease: [0.22, 1, 0.36, 1]` |
| Spring pop | `type: "spring"` `stiffness: 250–300` `damping: 20–30` |
| Nav pill | `type: "spring"` `bounce: 0.2` `duration: 0.6` + `layoutId` |
| Button hover | Slide-up text: `y: 0→30` old text, `y: -30→0` new text, `delay: 0.05` |
| Progress bar | `width: 0 → "100%"` `ease: "circOut"` `duration: 0.8` |

### Viewport Settings
- `viewport={{ once: true, margin: "-100px" }}` — most elements
- `viewport={{ once: false, margin: "-10%" }}` — parallax sections

### GSAP Patterns

| Pattern | Config |
|---|---|
| SVG thread draw | `strokeDashoffset: length → 0` `scrub: 0.5–1` `start: "top center"` `end: "center center"` |
| Parallax | `yPercent: bgSpeed * 100` `ease: "none"` `start: "top bottom"` `end: "bottom top"` `scrub: true` |

### Transition Durations
- `200ms` — micro interactions
- `300ms`–`500ms` — standard UI feedback
- `700ms`–`1000ms` — page-level transitions

---

## UI Component Patterns

### Buttons
- Shape: `rounded-full`
- Padding: `px-12 py-6`
- Primary: `bg-primary-text text-primary-background` (near-black bg, cream text)
- Accent: `bg-secondary-background text-white` (tan bg)
- Text: `uppercase font-bold tracking-[0.3em]` small size
- Hover: text slides up/down with `ease-[cubic-bezier(0.23,1,0.32,1)]`

### Progress Nav Pills
- `rounded-full bg-secondary-background` (active)
- `bg-white/5 border border-primary-text/10` (inactive)
- `font-black uppercase text-[14px]`
- Spring animation with `layoutId` for active state transition

### Cards — Light
- `bg-white` or `bg-primary-background`
- `rounded-[40px] p-12`
- `border border-black/5 shadow-sm`

### Cards — Dark
- `bg-[#1A1A1A]` or `bg-[#0F0F0F]`
- `rounded-[48px] p-8 md:p-16`
- `border border-white/5`–`border-white/10`
- Ambient glow blobs in corners

### Video Player Container
- Aspect ratio: `9:16` (portrait)
- `rounded-[32px]`
- `border-[6px] border-secondary-background` or `border border-white/10`
- `bg-black overflow-hidden`
- Warm glow behind: `bg-secondary-background/20 blur-2xl`

### Section Cards (Chapters)
- Dark bg with video thumbnail
- Gradient overlay: `linear-gradient(to bottom, transparent → rgba(0,0,0,0.9))`
- Chapter number watermark: `text-9xl` very low opacity
- `font-serif italic` title
- `rounded-[1.5rem] md:rounded-[2.5rem]`

### SVG Thread / Scroll Line
- Color: `#CCA077` with gradient fade (opacity `1 → 0.4`)
- `strokeWidth: 3–4`, `strokeLinecap: "round"`
- Animated on scroll with GSAP `strokeDashoffset`

---

## Photography Direction
- Dark, moody, cinematic — high contrast, underexposed
- Psychological / introspective subjects
- Close-up eyes, hands, silhouettes in light
- Dark teal, near-black, warm shadow tones
- No bright lifestyle photography
