"use client";

/**
 * InteractiveDots
 *
 * Port of a Framer.com "code component" (Dots_1.js): a grid of dots (and/or
 * grid lines) that brighten in proximity to the cursor. Pure React + inline
 * styles, no framer-motion needed for this one — the original didn't use it
 * either, opacity transitions are handled with a CSS `transition`.
 *
 * No external deps beyond React.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

export type DotsGridType = "dots" | "lines" | "dots-lines";

export interface InteractiveDotsProps {
  /** Dot / line color. Default "#9CA3AF". */
  dotColor?: string;
  /** Diameter of each dot in px. Default 4. */
  dotSize?: number;
  /** Spacing between grid cells in px. Default 60. */
  spacing?: number;
  /** Radius in px around the cursor where dots brighten. Default 150. */
  proximityRadius?: number;
  /** Opacity of a dot right under the cursor. Default 1. */
  maxOpacity?: number;
  /** Resting opacity of dots far from the cursor. Default 0.15. */
  backgroundOpacity?: number;
  /** "dots" | "lines" | "dots-lines" (grid lines behind the dots). Default "dots-lines". */
  gridType?: DotsGridType;
  /** Optional background color behind the grid. Transparent if omitted. */
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function InteractiveDots({
  dotColor = "#9CA3AF",
  dotSize = 4,
  spacing = 60,
  proximityRadius = 150,
  maxOpacity = 1,
  backgroundOpacity = 0.15,
  gridType = "dots-lines",
  backgroundColor,
  className,
  style,
}: InteractiveDotsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const dots = useMemo(() => {
    const arr: { x: number; y: number; key: string }[] = [];
    const cols = Math.ceil(dimensions.width / spacing);
    const rows = Math.ceil(dimensions.height / spacing);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        arr.push({
          x: col * spacing + spacing / 2,
          y: row * spacing + spacing / 2,
          key: `${col}-${row}`,
        });
      }
    }
    return arr;
  }, [dimensions.width, dimensions.height, spacing]);

  const getOpacity = (dotX: number, dotY: number) => {
    const distance = Math.hypot(mousePos.x - dotX, mousePos.y - dotY);
    if (distance > proximityRadius) return backgroundOpacity;
    const hoverOpacity = (1 - distance / proximityRadius) * maxOpacity;
    return Math.max(backgroundOpacity, hoverOpacity);
  };

  const vLines = Math.ceil(dimensions.width / spacing);
  const hLines = Math.ceil(dimensions.height / spacing);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 100,
        minHeight: 100,
        backgroundColor: backgroundColor ?? "transparent",
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      {(gridType === "dots-lines" || gridType === "lines") && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          {Array.from({ length: vLines }).map((_, i) => {
            const x = i * spacing + spacing / 2;
            return (
              <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={dimensions.height} stroke={dotColor} strokeWidth={1} opacity={backgroundOpacity} />
            );
          })}
          {Array.from({ length: hLines }).map((_, i) => {
            const y = i * spacing + spacing / 2;
            return (
              <line key={`h-${i}`} x1={0} y1={y} x2={dimensions.width} y2={y} stroke={dotColor} strokeWidth={1} opacity={backgroundOpacity} />
            );
          })}
        </svg>
      )}
      {(gridType === "dots-lines" || gridType === "dots") &&
        dots.map((dot) => (
          <div
            key={dot.key}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: dotColor,
              opacity: getOpacity(dot.x, dot.y),
              transform: "translate(-50%, -50%)",
              transition: "opacity 0.2s ease-out",
              pointerEvents: "none",
            }}
          />
        ))}
    </div>
  );
}

export default InteractiveDots;
