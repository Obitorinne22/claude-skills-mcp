"use client";

/**
 * ScrollRevealTextAdvanced
 *
 * Port of a Framer.com "code component" (ScrollRevealText.js, by
 * AliThemes.com): a richer sibling of TextRevealScroll.tsx in this same
 * folder. Reveals text char-by-char or word-by-word as the page scrolls,
 * with per-segment blur, scale, 3D tilt and a color transition — not just
 * opacity.
 *
 * Reimplemented with framer-motion's useScroll/useTransform (one per
 * segment, via a small subcomponent so the hook isn't called in a loop)
 * instead of the original's raw DOM-ref/rAF engine. Dropped from the
 * original: the "Lines" split mode (masked per-line reveal, needs a
 * post-render line-detection pass) and the "On Load" trigger — this port
 * is scroll-only, chars/words only. Add those back here if you need them.
 *
 * npm i framer-motion
 */

import React, { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export type RevealSplitMode = "chars" | "words";
export type RevealDirection = "ltr" | "rtl";

export interface ScrollRevealTextAdvancedProps {
  text: string;
  splitMode?: RevealSplitMode;
  direction?: RevealDirection;
  /** Viewport % (0-100) from the top where the reveal begins. Default 80. */
  startOffset?: number;
  /** Viewport % (0-100) from the top where the reveal completes. Default 20. */
  endOffset?: number;
  /** Color of not-yet-revealed text. Default "#9ca3af". */
  colorHidden?: string;
  /** Color of revealed text. Default "#111827". */
  colorRevealed?: string;
  /** Horizontal offset (px) segments travel in from. Default 7. */
  xOffset?: number;
  /** Vertical offset (px) segments travel in from (+ = from below). Default 0. */
  yOffset?: number;
  /** Blur (px) applied to not-yet-revealed segments. Default 0 (off). */
  blur?: number;
  /** 3D tilt angle (deg) for not-yet-revealed segments. Default 0 (off). */
  rotateX?: number;
  /** Starting scale for not-yet-revealed segments (1 = no scale animation). Default 1. */
  scale?: number;
  htmlTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
  className?: string;
  style?: React.CSSProperties;
}

function Segment({
  progress,
  range,
  children,
  colorHidden,
  colorRevealed,
  xOffset,
  yOffset,
  blur,
  rotateX,
  scale,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
  colorHidden: string;
  colorRevealed: string;
  xOffset: number;
  yOffset: number;
  blur: number;
  rotateX: number;
  scale: number;
}) {
  const p = useTransform(progress, range, [0, 1]);
  const x = useTransform(p, [0, 1], [-xOffset, 0]);
  const y = useTransform(p, [0, 1], [yOffset, 0]);
  const filter = useTransform(p, (v) => (blur > 0 ? `blur(${blur * (1 - v)}px)` : "none"));
  const s = useTransform(p, [0, 1], [scale, 1]);
  const rX = useTransform(p, [0, 1], [rotateX, 0]);
  const color = useTransform(p, (v) => `color-mix(in srgb, ${colorRevealed} ${Math.round(v * 100)}%, ${colorHidden})`);

  return (
    <motion.span
      style={{
        display: "inline-block",
        whiteSpace: children === " " ? "pre" : "normal",
        x,
        y,
        scale: s,
        rotateX: rX,
        filter,
        color,
        transformPerspective: 800,
      }}
    >
      {children}
    </motion.span>
  );
}

export function ScrollRevealTextAdvanced({
  text,
  splitMode = "chars",
  direction = "ltr",
  startOffset = 80,
  endOffset = 20,
  colorHidden = "#9ca3af",
  colorRevealed = "#111827",
  xOffset = 7,
  yOffset = 0,
  blur = 0,
  rotateX = 0,
  scale = 1,
  htmlTag = "div",
  className,
  style,
}: ScrollRevealTextAdvancedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${startOffset}%`, `start ${endOffset}%`],
  });

  let segments = splitMode === "chars" ? Array.from(text) : text.split(/(\s+)/).filter((s) => s.length > 0);
  if (direction === "rtl") segments = [...segments].reverse();

  const Tag = htmlTag as any;

  return (
    <Tag ref={ref} className={className} style={{ display: "inline-block", ...style }}>
      {segments.map((seg, i) => (
        <Segment
          key={i}
          progress={scrollYProgress}
          range={[i / segments.length, (i + 1) / segments.length]}
          colorHidden={colorHidden}
          colorRevealed={colorRevealed}
          xOffset={xOffset}
          yOffset={yOffset}
          blur={blur}
          rotateX={rotateX}
          scale={scale}
        >
          {seg}
        </Segment>
      ))}
    </Tag>
  );
}

export default ScrollRevealTextAdvanced;
