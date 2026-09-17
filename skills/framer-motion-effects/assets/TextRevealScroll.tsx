"use client";

/**
 * TextRevealScroll
 *
 * Plain-React / Framer Motion port of a Framer.com "code component"
 * (framer.com/m/text-reveal-scroll-helper-16vc5F.js). The original only runs
 * inside Framer.com's own site builder (it imports `addPropertyControls`,
 * `ControlType` from the proprietary "framer" package). This version has no
 * Framer.com-specific dependencies — just React + framer-motion — so it
 * works in any Next.js / Vite / plain React project.
 *
 * Behavior: as the block scrolls through the viewport, its text is revealed
 * segment-by-segment (character or word), driven by `useScroll` +
 * `useTransform` instead of manual scroll listeners.
 *
 * npm i framer-motion
 */

import React, { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export interface TextRevealScrollProps {
  /** The text to reveal. */
  text: string;
  /** Reveal granularity. Default "chars". */
  revealMode?: "chars" | "words";
  /** Viewport % (0-100) from the top where the reveal begins. Default 90. */
  startOffset?: number;
  /** Viewport % (0-100) from the top where the reveal completes. Default 30. */
  endOffset?: number;
  /** Opacity of unrevealed segments. Default 0.2. */
  dimOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Segment({
  children,
  progress,
  range,
  dimOpacity,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  dimOpacity: number;
}) {
  const opacity = useTransform(progress, range, [dimOpacity, 1]);
  return (
    <motion.span style={{ opacity, whiteSpace: children === " " ? "pre" : "normal" }}>
      {children}
    </motion.span>
  );
}

export function TextRevealScroll({
  text,
  revealMode = "chars",
  startOffset = 90,
  endOffset = 30,
  dimOpacity = 0.2,
  className,
  style,
}: TextRevealScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${startOffset}%`, `start ${endOffset}%`],
  });

  const segments =
    revealMode === "chars"
      ? Array.from(text)
      : text.split(/(\s+)/).filter((s) => s.length > 0);

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
    >
      {segments.map((seg, i) => (
        <Segment
          key={i}
          progress={scrollYProgress}
          range={[i / segments.length, (i + 1) / segments.length]}
          dimOpacity={dimOpacity}
        >
          {seg}
        </Segment>
      ))}
    </div>
  );
}

export default TextRevealScroll;
