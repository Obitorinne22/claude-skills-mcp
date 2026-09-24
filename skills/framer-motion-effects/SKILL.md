---
name: framer-motion-effects
description: Ready-made Framer Motion (React) animation components to drop into web projects — scroll-triggered text reveal, and more added over time. Use when the user asks for scroll animations, text reveal effects, fade/reveal-on-scroll UI in a React/Next.js/Vite project, or shares a Framer.com component (framer.com/m/... or framerusercontent.com/modules/...) they want ported to plain code. Default to Framer Motion for animation in every web project unless told otherwise.
---

# Framer Motion Effects

A small, growing library of tested Framer Motion components. Most originate as
ports of Framer.com "code components" — those only run inside Framer's own
site builder (`import ... from "framer"`, `addPropertyControls`), so they're
useless in a normal React/Next.js/Vite project. This skill's job is to keep
plain-React, Framer-Motion-based equivalents ready to drop in anywhere.

## When to use
- User asks for a scroll-triggered animation, text reveal, fade-in-on-scroll,
  parallax, stagger reveal, etc. in a web project.
- User pastes a Framer.com component URL and wants the effect usable outside
  Framer.com.
- Any web project by default should use Framer Motion (`motion`/`framer-motion`
  npm package) for animation — this is a standing preference, not just for
  requests that mention animation explicitly.

## Available components

### TextRevealScroll — `assets/TextRevealScroll.tsx`
Reveals text character-by-character or word-by-word as the page scrolls past
it, using `useScroll` + `useTransform` bound to a scroll-linked progress value
per segment (no manual scroll listeners, no IntersectionObserver — Framer
Motion's `useScroll` handles all of that).

Props:
| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | required | The text to reveal |
| `revealMode` | `"chars" \| "words"` | `"chars"` | Reveal granularity |
| `startOffset` | `number` (0-100) | `90` | Viewport % from top where reveal begins |
| `endOffset` | `number` (0-100) | `30` | Viewport % from top where reveal completes |
| `dimOpacity` | `number` (0-1) | `0.2` | Opacity of unrevealed segments |
| `className` / `style` | — | — | Passed to the wrapper `div` |

Usage:
```tsx
import { TextRevealScroll } from "./assets/TextRevealScroll";

<TextRevealScroll
  text="Every word appears as you scroll."
  revealMode="words"
  dimOpacity={0.15}
/>
```

Ported from: https://framer.com/m/text-reveal-scroll-helper-16vc5F.js (Framer.com
code component by Soyeb), reimplemented without any Framer.com-only APIs.

### ScrollRevealTextAdvanced — `assets/ScrollRevealTextAdvanced.tsx`
Richer sibling of TextRevealScroll: same char/word scroll reveal, plus
per-segment blur, scale, 3D `rotateX` tilt, and a `color-mix` transition
from a hidden color to a revealed color. Use this one when you need more
than opacity; use TextRevealScroll when you don't.
Props: `text`, `splitMode` ("chars"|"words"), `direction` ("ltr"|"rtl"),
`startOffset`, `endOffset`, `colorHidden`, `colorRevealed`, `xOffset`,
`yOffset`, `blur`, `rotateX`, `scale`, `htmlTag`.
Ported from: https://framer.com/m/ScrollRevealText-vXBxyx.js (by
AliThemes.com). Dropped: the "Lines" masked-line split mode and the
"On Load" trigger (scroll-only here) — add them back per the porting
recipe below if needed.

### PresetTextReveal — `assets/PresetTextReveal.tsx`
A preset library for text-reveal animations — pass a `preset` name and a
whole per-character/word/line motion recipe (offset, rotation, scale,
blur, stagger order) applies via framer-motion variants + `useInView`.
Presets: `fade`, `rise`, `drop`, `slide`, `split`, `blur`, `focus`, `mask`,
`curtain`, `unfold`, `pop`, `punch`, `zoom`, `shrink`, `stretch`, `flip`,
`swivel`, `tilt`, `spin`, `shear`, `wave`, `cascade`, `scatter` (see
`PRESETS` in the file for the exact recipe of each).
Props: `text`, `preset`, `trigger` ("onView"|"onMount"|"hover"), `delay`,
`replay`, `threshold`, `textColor`.
Ported from: https://framer.com/m/TextMotion-VPcWBf.js (by KollinaStudio,
37 presets). Dropped 9 presets that need extra machinery this port
doesn't carry: `wipe`, `scramble`, `type` (content-mutating, needs a wall
clock), `liquid`/`dissolve`/`melt` (SVG `feTurbulence` displacement
filters), `chroma`/`shine`/`neon` (glow/shadow tricks). Add them back per
the porting recipe below if needed.

### InteractiveDots — `assets/InteractiveDots.tsx`
A grid of dots (and/or grid lines) that brighten within a radius of the
cursor. No framer-motion needed — plain CSS opacity transitions.
Props: `dotColor`, `dotSize`, `spacing`, `proximityRadius`, `maxOpacity`,
`backgroundOpacity`, `gridType` ("dots"|"lines"|"dots-lines"),
`backgroundColor`.
Ported from: https://framer.com/m/Dots-1-9hMKym.js.

### ScrollZoomReveal — `assets/ScrollZoomReveal.tsx`
The "Apple showreel" effect: a small rounded box grows to fill the
viewport as you scroll through a tall section, with flanking captions and
a center play button that fades in mid-zoom. Optionally plays an inline
video on click.
Props: `imageSrc`, `videoUrl`, `leftText`, `rightText`, `buttonText`,
`buttonLink`, `textColor`, `buttonTextColor`, `buttonBgColor`,
`stiffness`/`damping`/`mass` (corner-radius spring), `icon`
("play"|"arrow"|"none").
Ported from: https://framer.com/m/scroll-zoom-reveal-9JxzBS.js.

### FloatingPillNav — `assets/FloatingPillNav.tsx`
A pill-shaped nav where the active item's background slides smoothly
between links on click, via framer-motion's shared-layout `layoutId`.
Props: `items` (`{label, href?, target?}[]`), `defaultActive`,
`backgroundColor`, `textColor`, `activeBackgroundColor`,
`activeTextColor`, `padding`, `gap`, `linkPadding`.
Ported from: https://framer.com/m/FloatingPillNavigation-s92k8M.js.

### StickyScrollGallery — `assets/StickyScrollGallery.tsx`
A full-bleed sticky image gallery: scrolling through a tall section
crossfades between images, with a caption and a clickable thumbnail dock
showing which one is active (animated outline via `layoutId`).
Props: `items` (`{image, alt?, text?}[]`), `transitionType`
("fade"|"scale"), `backgroundColor`, `textColor`, `dockPosition`
("left"|"right"|"top"|"bottom"), `thumbSize`.
Ported from: https://framer.com/m/ImageScroller-kjnj.js. Simplified: dock
is fixed-position (original let you drag it anywhere); only fade/scale
transitions ported (original also had rotate/spiral/blur/zoom/pixellated/
saturate).

### HoverBloom — `assets/HoverBloom.tsx`
Move the pointer over the canvas and procedural plant stems grow from the
cursor path, blooming into soft watercolor-style flowers. Pure HTML5
Canvas 2D + React refs — no framer-motion, it's a manual rAF loop.
Props: `backgroundColor`, `paperTint`, `palette`
("mixed"|"warm"|"cool"|"pink"), `spawnRate`, `maxBlooms`, `resetOnLeave`,
`stemHue`, `bloomScale`, `blur`.
Ported from: https://framer.com/m/HoverBloom-FI7SXI.js. Trimmed: dropped
the grid background, drag-to-reposition dock (n/a here), and the
per-flower custom-palette array editor — the core generative algorithm
(random-walk stems + blob-petal rendering) is intact.

### LiquidGlassNavbar — `assets/LiquidGlassNavbar.tsx`
Glassmorphic pill navbar: logo, nav links, CTA button, and a mobile
hamburger that animates into an X via framer-motion. **Concept port**, not
a reverse-engineer — see note below.
Props: `logoName`, `links` (`{label, href}[]`), `ctaLabel`, `ctaHref`.
Needs a small global CSS media query for the mobile breakpoint — see the
comment at the bottom of the file.
Inspired by: https://framer.com/m/Liquid-Glass-Navbar-6gh01a.js.

### LiquidGlassFooter — `assets/LiquidGlassFooter.tsx`
Glassmorphic footer: brand blurb + newsletter form, link columns, social
icon row. **Concept port**, static layout, no framer-motion needed.
Props: `brandName`, `tagline`, `columns` (`{title, links}[]`), `social`
(`{label, href, icon}[]`), `onSubscribe`.
Inspired by: https://framer.com/m/Liquid-Glass-Footer-PpecQS.js.

### TabsCard — `assets/TabsCard.tsx`
A column of clickable tabs (title + description) that swap the image
shown alongside them, with a crossfade on change. **Concept port**.
Props: `items` (`{title, description, image, alt?}[]`), `defaultIndex`.
Inspired by: https://framer.com/m/Tabs-card-f58s7K.js.

**A note on "concept ports":** LiquidGlassNavbar, LiquidGlassFooter and
TabsCard are not reverse-engineered from their Framer.com source — those
three are Framer *canvas-generated* exports (not hand-written "code
components" like everything else above), each wired to half a dozen more
Framer-internal sub-component modules (`RichText`, `Link`,
`useVariantState`, `SmartComponentScopedContainer`, ...) that don't exist
outside Framer.com and aren't worth pulling in. When a fetched component
looks like this — `// Generated by Framer` at the top, obfuscated
variable names, imports from more `framerusercontent.com/modules/...`
URLs — rebuild the visual idea from scratch in plain React/CSS instead of
trying to port it line-by-line; note it as a "concept port" like these
three, and link the original as "Inspired by" rather than "Ported from."

## How to port another Framer.com component into this skill

1. Fetch the component's `.js` module (the `framer.com/m/...` URL re-exports
   from `framerusercontent.com/modules/.../<name>.js` — fetch that final URL
   for the real source).
2. Identify the actual visual/interaction logic and strip anything
   Framer-canvas-only: `addPropertyControls`, `ControlType`,
   `useIsStaticRenderer`, the `@framerSupportedLayoutWidth`-style JSDoc
   annotations, and the property-panel config at the bottom.
3. Reimplement the behavior with Framer Motion primitives (`useScroll`,
   `useTransform`, `useSpring`, `motion.*`, `whileInView`, `AnimatePresence`)
   instead of manual DOM/scroll-listener code where possible.
4. Save as a new `.tsx` file under `assets/`, add a row for it in this
   SKILL.md's "Available components" table, and note the source URL it was
   ported from.
