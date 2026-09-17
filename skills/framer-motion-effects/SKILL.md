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
