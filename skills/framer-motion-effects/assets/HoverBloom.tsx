"use client";

/**
 * HoverBloom
 *
 * Port of a Framer.com "code component" (HoverBloom.js): move the pointer
 * over the canvas and procedural plant stems grow from the cursor path,
 * then bloom into soft watercolor-style flowers. Pure HTML5 Canvas 2D +
 * React refs, no framer-motion involved (the original didn't use it
 * either — the animation is a manual requestAnimationFrame loop).
 *
 * This is a trimmed port of the original's much larger property-control
 * surface (dropped: grid background, drag-to-reposition dock, per-flower
 * custom-palette array editor) but keeps the actual generative algorithm
 * (random-walk stem growth + blob-based petal rendering in HSL) intact.
 *
 * No external deps beyond React.
 */

import React, { useCallback, useEffect, useRef } from "react";

export type BloomPalette = "mixed" | "warm" | "cool" | "pink";

export interface HoverBloomProps {
  backgroundColor?: string;
  /** Subtle diagonal tint overlay, for a paper/watercolor feel. */
  paperTint?: string;
  palette?: BloomPalette;
  /** Stems spawned per second while the pointer moves. Default 10. */
  spawnRate?: number;
  /** Safety cap on concurrent stems+blooms. Default 80. */
  maxBlooms?: number;
  /** Clear the canvas when the pointer leaves. Default false (blooms persist). */
  resetOnLeave?: boolean;
  stemHue?: number;
  bloomScale?: number;
  /** Post-process blur (px) on the watercolor layer. Default 0.6. */
  blur?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Seg {
  x: number;
  y: number;
  a: number;
}
interface Stem {
  targetLen: number;
  grown: number;
  speed: number;
  targetA: number;
  segs: Seg[];
  done: boolean;
  hasFlower: boolean;
  type: number;
  scale: number;
  hue: number;
  sat: number;
  light: number;
}
interface Bloom {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  type: number;
  scale: number;
  hue: number;
  sat: number;
  light: number;
}

const PALETTE_HUES: Record<BloomPalette, number[]> = {
  warm: [12, 22, 35, 5, 18],
  cool: [210, 245, 190, 275, 200],
  pink: [330, 345, 350, 315, 5],
  mixed: [350, 15, 330, 40, 300, 5, 345, 20],
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hsl = (h: number, s: number, l: number, a: number) =>
  `hsla(${((h % 360) + 360) % 360}, ${Math.max(0, Math.min(100, s))}%, ${Math.max(0, Math.min(100, l))}%, ${Math.max(0, Math.min(1, a))})`;

export function HoverBloom({
  backgroundColor = "#FFFFFF",
  paperTint = "#F5F5F5",
  palette = "mixed",
  spawnRate = 10,
  maxBlooms = 80,
  resetOnLeave = false,
  stemHue = 115,
  bloomScale = 1,
  blur = 0.6,
  className,
  style,
}: HoverBloomProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const hoverRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const spawnAccRef = useRef(0);
  const stemsRef = useRef<Stem[]>([]);
  const bloomsRef = useRef<Bloom[]>([]);

  const get2D = (c: HTMLCanvasElement) => c.getContext("2d");

  const resizeToHost = useCallback(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (!paintRef.current) paintRef.current = document.createElement("canvas");
    const paint = paintRef.current;
    const rect = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    sizeRef.current = { w, h, dpr };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    paint.width = Math.floor(w * dpr);
    paint.height = Math.floor(h * dpr);
    const pctx = get2D(paint);
    if (pctx) {
      pctx.setTransform(1, 0, 0, 1, 0, 0);
      pctx.scale(dpr, dpr);
      pctx.fillStyle = backgroundColor;
      pctx.fillRect(0, 0, w, h);
    }
  }, [backgroundColor]);

  const clearAll = useCallback(() => {
    const paint = paintRef.current;
    const canvas = canvasRef.current;
    if (!paint || !canvas) return;
    const { w, h, dpr } = sizeRef.current;
    const pctx = get2D(paint);
    const dctx = get2D(canvas);
    if (!pctx || !dctx) return;
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.clearRect(0, 0, paint.width, paint.height);
    pctx.scale(dpr, dpr);
    pctx.fillStyle = backgroundColor;
    pctx.fillRect(0, 0, w, h);
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.clearRect(0, 0, canvas.width, canvas.height);
    stemsRef.current = [];
    bloomsRef.current = [];
  }, [backgroundColor]);

  const spawnStemAt = useCallback(
    (x: number, y: number, intensity: number) => {
      const { w, h } = sizeRef.current;
      if (w <= 0 || h <= 0) return;
      if (stemsRef.current.length + bloomsRef.current.length >= Math.max(1, maxBlooms)) return;
      const hueChoices = PALETTE_HUES[palette];
      const hue = hueChoices[(Math.random() * hueChoices.length) | 0] + (Math.random() * 10 - 5);
      const sat = 78;
      const light = 66;
      const scale = Math.max(0.2, bloomScale) * (0.65 + Math.random() * 0.6) * (0.8 + intensity * 0.6);
      const targetA = -Math.PI / 2;
      const len = h * 0.12 + Math.random() * (h * 0.22) + 40 * (0.65 + scale);
      const angle = targetA + (Math.random() - 0.5) * 0.75;
      stemsRef.current.push({
        targetLen: len,
        grown: 0,
        speed: 1.6 + Math.random() * 2.2,
        targetA,
        segs: [{ x, y, a: angle }],
        done: false,
        hasFlower: false,
        type: (Math.random() * 6) | 0,
        scale,
        hue,
        sat,
        light,
      });
    },
    [bloomScale, maxBlooms, palette]
  );

  const addBloom = useCallback((x: number, y: number, type: number, scale: number, hue: number, sat: number, light: number) => {
    bloomsRef.current.push({ x, y, age: 0, maxAge: 70 + Math.random() * 70, type, scale, hue, sat, light });
  }, []);

  const drawBlob = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, h: number, s: number, l: number, a: number, angle = 0, stretch = 1.6) => {
      const jitter = r * 0.25;
      for (let i = 0; i < 2; i++) {
        const jx = (Math.random() - 0.5) * jitter;
        const jy = (Math.random() - 0.5) * jitter;
        const rr = Math.max(0.6, r * (0.75 + Math.random() * 0.5));
        const aa = angle + (Math.random() - 0.5) * 0.35;
        ctx.beginPath();
        ctx.ellipse(x + jx, y + jy, rr * stretch, rr * (0.55 + Math.random() * 0.55), aa, 0, Math.PI * 2);
        ctx.fillStyle = hsl(h + (Math.random() * 10 - 5), s, l + (Math.random() * 12 - 6), a);
        ctx.fill();
      }
    },
    []
  );

  const stroke = useCallback(
    (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, h: number, s: number, l: number, w: number, a: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = hsl(h + (Math.random() * 8 - 4), s, l + (Math.random() * 10 - 5), a);
      ctx.lineWidth = Math.max(0.2, w * (0.8 + Math.random() * 0.5));
      ctx.stroke();
    },
    []
  );

  const stepStem = useCallback((s: Stem) => {
    const stepSize = 5;
    const steps = Math.max(1, Math.floor(s.speed));
    for (let k = 0; k < steps; k++) {
      if (s.grown >= s.targetLen) {
        s.done = true;
        break;
      }
      const last = s.segs[s.segs.length - 1];
      const a = last.a + (s.targetA - last.a) * 0.04 + (Math.random() - 0.5) * 0.12;
      s.segs.push({ x: last.x + Math.cos(a) * stepSize, y: last.y + Math.sin(a) * stepSize, a });
      s.grown += stepSize;
    }
    if (s.grown >= s.targetLen) s.done = true;
  }, []);

  const drawStem = useCallback(
    (ctx: CanvasRenderingContext2D, s: Stem) => {
      const segs = s.segs;
      if (segs.length < 2) return;
      const maxI = segs.length - 1;
      const start = Math.max(1, maxI - 4);
      for (let i = start; i <= maxI; i++) {
        const prev = segs[i - 1];
        const cur = segs[i];
        const w = 2.2 * s.scale;
        stroke(ctx, prev.x, prev.y, cur.x, cur.y, stemHue, 28, 38, w, 0.16);
      }
    },
    [stemHue, stroke]
  );

  const drawBloom = useCallback(
    (ctx: CanvasRenderingContext2D, b: Bloom) => {
      b.age += 1;
      const t = clamp01(b.age / 60);
      const bloom = 0.15 + t * 0.85;
      const fadeOut = resetOnLeave ? clamp01((b.maxAge - b.age) / 20) : 1;
      const s = b.scale;
      const headX = b.x;
      const headY = b.y - (8 + Math.random() * 6) * s * bloom;
      const petalCount = 8;
      const radius = 10 * s * bloom;
      for (let i = 0; i < petalCount; i++) {
        if (Math.random() > 0.75) continue;
        const a = -Math.PI / 2 + (Math.PI * 2 * i) / petalCount + (Math.random() - 0.5) * 0.35;
        const dist = radius * (0.75 + Math.random() * 0.85);
        const px = headX + Math.cos(a) * dist;
        const py = headY + Math.sin(a) * dist;
        drawBlob(ctx, px, py, radius * (0.55 + Math.random() * 0.25), b.hue, b.sat, b.light, fadeOut * 0.06, a, 1.7);
      }
      const core = (5 + Math.random() * 3) * s * bloom;
      drawBlob(ctx, headX, headY, core, b.hue, Math.min(100, b.sat + 12), Math.max(16, b.light - 22), fadeOut * 0.07, 0, 1.2);
    },
    [drawBlob, resetOnLeave]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const paint = paintRef.current;
    if (!canvas || !paint) return;
    const { w, h, dpr } = sizeRef.current;
    if (w <= 0 || h <= 0) return;
    const pctx = get2D(paint);
    const dctx = get2D(canvas);
    if (!pctx || !dctx) return;

    for (const s of stemsRef.current) {
      if (!s.done) {
        stepStem(s);
        drawStem(pctx, s);
      } else if (!s.hasFlower) {
        const anchor = s.segs[Math.max(1, s.segs.length - 2)];
        addBloom(anchor.x, anchor.y, s.type, Math.max(0.2, s.scale), s.hue, s.sat, s.light);
        s.hasFlower = true;
      }
    }
    let anyAlive = false;
    for (const b of bloomsRef.current) {
      if (b.age < b.maxAge) {
        drawBloom(pctx, b);
        anyAlive = true;
      }
    }
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.clearRect(0, 0, canvas.width, canvas.height);
    dctx.scale(dpr, dpr);
    dctx.filter = `blur(${blur}px)`;
    dctx.drawImage(paint, 0, 0, w * dpr, h * dpr, 0, 0, w, h);
    dctx.filter = "none";

    stemsRef.current = stemsRef.current.filter((s) => !(s.done && s.hasFlower));
    if (bloomsRef.current.length > maxBlooms) bloomsRef.current.splice(0, bloomsRef.current.length - maxBlooms);

    const shouldContinue = hoverRef.current || stemsRef.current.length > 0 || anyAlive;
    if (shouldContinue) {
      rafRef.current = requestAnimationFrame(render);
    } else {
      runningRef.current = false;
      rafRef.current = null;
    }
  }, [addBloom, blur, drawBloom, drawStem, maxBlooms, stepStem]);

  const ensureLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(render);
  }, [render]);

  useEffect(() => {
    resizeToHost();
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(() => resizeToHost());
    ro.observe(host);
    return () => ro.disconnect();
  }, [resizeToHost]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerEnter = () => {
    hoverRef.current = true;
    ensureLoop();
  };
  const onPointerLeave = () => {
    hoverRef.current = false;
    lastPointerRef.current = null;
    spawnAccRef.current = 0;
    if (resetOnLeave) clearAll();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!hoverRef.current) return;
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    const last = lastPointerRef.current;
    let intensity = 0.35;
    if (last) {
      const dt = Math.max(1, now - last.t);
      const speed = Math.hypot(x - last.x, y - last.y) / dt;
      intensity = clamp01(0.25 + speed * 3.2);
    }
    lastPointerRef.current = { x, y, t: now };
    const dt = last ? Math.max(0, now - last.t) / 1000 : 1 / 60;
    spawnAccRef.current += Math.max(0, spawnRate) * dt;
    while (spawnAccRef.current >= 1) {
      spawnAccRef.current -= 1;
      spawnStemAt(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, intensity);
    }
    ensureLoop();
  };

  return (
    <div
      ref={hostRef}
      className={className}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      role="application"
      aria-label="Hover bloom canvas"
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor, touchAction: "none", ...style }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${paperTint} 0%, rgba(255,255,255,0) 62%)`,
          mixBlendMode: "multiply",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default HoverBloom;
