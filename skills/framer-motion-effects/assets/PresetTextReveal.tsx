"use client";

/**
 * PresetTextReveal
 *
 * Port of a Framer.com "code component" (TextMotion.js, by KollinaStudio):
 * a text-reveal engine with a library of named presets, each a recipe of
 * per-segment transforms (x/y/z/rotate/scale/skew/blur/clip) played with a
 * stagger across characters, words, or lines.
 *
 * The original ships 37 presets, nine of which need machinery this port
 * drops for scope: `scramble`/`type` (content-mutating, needs a wall clock),
 * `liquid`/`dissolve`/`melt` (SVG feTurbulence displacement filters), and
 * `chroma`/`shine`/`neon` (glow/shadow tricks). Everything else — the pure
 * per-segment-transform presets, which is most of them — is ported as-is.
 * Add the dropped ones back here if you need them (the SKILL.md's "how to
 * port" section has the recipe).
 *
 * npm i framer-motion
 */

import React, { useMemo, useRef } from "react";
import { motion, useInView, type Transition } from "framer-motion";

export type SplitBy = "character" | "word" | "line";
export type StaggerOrder = "forward" | "reverse" | "center" | "random";
export type Trigger = "onView" | "onMount" | "hover";

interface PresetConfig {
  splitBy: SplitBy;
  x: number;
  y: number;
  z: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  blur: number;
  opacity: number;
  clip: boolean;
  origin: "center" | "top" | "bottom" | "left" | "right";
  order: StaggerOrder;
  duration: number;
  stagger: number;
}

const BASE: PresetConfig = {
  splitBy: "word",
  x: 0,
  y: 0,
  z: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  blur: 0,
  opacity: 0,
  clip: false,
  origin: "center",
  order: "forward",
  duration: 0.7,
  stagger: 0.03,
};

/** Transform-only presets from the original's 37 (the other 9 need extra machinery — see file header). */
export const PRESETS: Record<string, Partial<PresetConfig>> = {
  fade: { y: 18, duration: 0.6, stagger: 0.04 },
  rise: { splitBy: "line", y: 80, duration: 0.8, stagger: 0.12 },
  drop: { splitBy: "character", y: -60, duration: 0.7, stagger: 0.02 },
  slide: { x: -60, duration: 0.7, stagger: 0.05 },
  split: { splitBy: "character", y: 48, blur: 8, duration: 0.7, stagger: 0.02 },
  blur: { blur: 14, duration: 0.9, stagger: 0.06 },
  focus: { splitBy: "character", blur: 18, scale: 1.15, duration: 0.8, stagger: 0.02 },
  mask: { splitBy: "line", clip: true, y: 100, duration: 0.9, stagger: 0.12 },
  curtain: { clip: true, y: 100, duration: 0.7, stagger: 0.05 },
  unfold: { splitBy: "line", rotateX: -80, origin: "top", duration: 0.9, stagger: 0.1 },
  pop: { splitBy: "character", scale: 0.4, duration: 0.6, stagger: 0.025 },
  punch: { splitBy: "line", scale: 0.8, y: 20, duration: 0.5, stagger: 0.08 },
  zoom: { splitBy: "line", scale: 1.6, blur: 10, duration: 0.9, stagger: 0.1 },
  shrink: { splitBy: "character", scale: 2.2, duration: 0.6, stagger: 0.02 },
  stretch: { splitBy: "character", scaleX: 0.3, scaleY: 1.8, duration: 0.7, stagger: 0.025 },
  flip: { rotateX: 90, duration: 0.8, stagger: 0.06 },
  swivel: { rotateY: 90, duration: 0.8, stagger: 0.06 },
  tilt: { splitBy: "character", rotate: -12, y: 30, duration: 0.7, stagger: 0.025 },
  spin: { splitBy: "character", rotate: 180, scale: 0.5, duration: 0.7, stagger: 0.03 },
  shear: { skewX: 20, x: 30, duration: 0.6, stagger: 0.05 },
  wave: { splitBy: "character", y: 30, duration: 0.7, stagger: 0.035, order: "center" },
  cascade: { splitBy: "character", y: 40, duration: 0.7, stagger: 0.025, order: "reverse" },
  scatter: { splitBy: "character", y: 40, x: 20, rotate: 20, duration: 0.8, stagger: 0.03, order: "random" },
};

export type PresetName = keyof typeof PRESETS;

const ORIGIN: Record<PresetConfig["origin"], string> = {
  center: "50% 50%",
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
};

function pseudoRandom(n: number) {
  const x = Math.sin((n + 1) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function tokenize(text: string, splitBy: SplitBy): string[][] {
  const lines = text.split("\n");
  if (splitBy === "line") return lines.map((l) => [l]);
  return lines.map((line) => line.split(/(\s+)/).filter((t) => t.length > 0));
}

function staggerIndex(i: number, total: number, order: StaggerOrder) {
  switch (order) {
    case "reverse":
      return total - 1 - i;
    case "center":
      return Math.abs(i - (total - 1) / 2);
    case "random":
      return pseudoRandom(i) * total;
    default:
      return i;
  }
}

export interface PresetTextRevealProps {
  text: string;
  /** One of PRESETS' keys. Default "split". */
  preset?: PresetName;
  trigger?: Trigger;
  delay?: number;
  /** Replay every time it re-enters view (trigger="onView" only). Default true. */
  replay?: boolean;
  /** Fraction of the element visible before triggering (onView only). Default 0.4. */
  threshold?: number;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function PresetTextReveal({
  text,
  preset = "split",
  trigger = "onView",
  delay = 0,
  replay = true,
  threshold = 0.4,
  textColor,
  className,
  style,
}: PresetTextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const inView = useInView(ref, { amount: threshold, once: !replay });

  const m: PresetConfig = useMemo(() => ({ ...BASE, ...(PRESETS[preset] ?? {}) }), [preset]);
  const lines = useMemo(() => tokenize(text, m.splitBy), [text, m.splitBy]);

  const indexed = useMemo(() => {
    let i = 0;
    return lines.map((units) =>
      units.map((unit) => {
        const isSpace = /^\s+$/.test(unit);
        if (isSpace) return { unit, index: -1, isSpace };
        return { unit, index: i++, isSpace };
      })
    );
  }, [lines]);

  let totalUnits = 0;
  for (const units of indexed) for (const u of units) if (!u.isSpace) totalUnits++;
  totalUnits = Math.max(totalUnits, 1);

  const playing = trigger === "onMount" || (trigger === "onView" && inView) || (trigger === "hover" && hovered);

  const transition: Transition = { ease: [0.22, 1, 0.36, 1] };

  const variants = {
    hidden: {
      opacity: m.opacity,
      x: m.x,
      y: m.clip ? `${m.y}%` : m.y,
      z: m.z,
      scale: m.scale,
      scaleX: m.scaleX,
      scaleY: m.scaleY,
      rotate: m.rotate,
      rotateX: m.rotateX,
      rotateY: m.rotateY,
      skewX: m.skewX,
      filter: m.blur > 0 ? `blur(${m.blur}px)` : "none",
      clipPath: m.clip ? "inset(100% 0 0 0)" : undefined,
    },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      y: m.clip ? "0%" : 0,
      z: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
      rotateX: 0,
      rotateY: 0,
      skewX: 0,
      filter: "blur(0px)",
      clipPath: m.clip ? "inset(0% 0 0 0)" : undefined,
      transition: { ...transition, duration: m.duration, delay: delay + i * m.stagger },
    }),
  };

  const tokenStyle: React.CSSProperties = {
    display: "inline-block",
    transformOrigin: ORIGIN[m.origin],
    transformPerspective: 800,
    willChange: "transform, filter, opacity",
  };
  const clipStyle: React.CSSProperties = { display: "inline-block", overflow: "hidden", verticalAlign: "bottom" };

  const renderToken = (content: string, index: number, key: React.Key) => {
    const orderIdx = staggerIndex(index, totalUnits, m.order);
    const token = (
      <motion.span
        custom={orderIdx}
        variants={variants}
        initial="hidden"
        animate={playing ? "visible" : "hidden"}
        style={tokenStyle}
      >
        {content}
      </motion.span>
    );
    if (!m.clip) return <React.Fragment key={key}>{token}</React.Fragment>;
    return (
      <span key={key} style={clipStyle}>
        {token}
      </span>
    );
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ color: textColor ?? "inherit", ...style }}
    >
      {indexed.map((units, li) => (
        <div key={li} style={{ display: "block", whiteSpace: "pre-wrap" }}>
          {units.map((u, ui) =>
            u.isSpace ? <span key={ui}>{u.unit}</span> : renderToken(u.unit, u.index, ui)
          )}
        </div>
      ))}
    </div>
  );
}

export default PresetTextReveal;
