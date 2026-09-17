"use client";

/**
 * StickyScrollGallery
 *
 * Port of a Framer.com "code component" (ImageScroller.js): a full-bleed,
 * sticky image gallery — scrolling through a tall section crossfades
 * between images, with a caption and a clickable thumbnail dock showing
 * which one is active.
 *
 * Simplified from the original: the thumbnail dock is fixed-position
 * (the original let the viewer drag it anywhere), and only "fade" and
 * "scale" transitions are ported (the original also had rotate, spiral,
 * blur, zoom, pixellated, saturate filter-based transitions — same idea,
 * just swap the framer-motion variants below if you want one of those).
 *
 * npm i framer-motion
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";

export interface GalleryItem {
  image: string;
  alt?: string;
  text?: string;
}

export type DockPosition = "left" | "right" | "top" | "bottom";

export interface StickyScrollGalleryProps {
  items: GalleryItem[];
  transitionType?: "fade" | "scale";
  backgroundColor?: string;
  textColor?: string;
  dockPosition?: DockPosition;
  thumbSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StickyScrollGallery({
  items,
  transitionType = "fade",
  backgroundColor = "#DDD",
  textColor = "#FFFFFF",
  dockPosition = "bottom",
  thumbSize = 64,
  className,
  style,
}: StickyScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const total = items.length;
      if (total === 0) return;
      setActiveIndex(Math.min(Math.floor(latest * total), total - 1));
    });
    return () => unsubscribe();
  }, [scrollYProgress, items.length]);

  const scrollHeight = useMemo(() => Math.max(items.length * 100, 100), [items.length]);

  const handleThumbnailClick = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const sectionHeight = window.innerHeight;
    window.scrollTo({ top: containerTop + index * sectionHeight, behavior: "smooth" });
  };

  const variantsFor = (index: number) => {
    const isActive = activeIndex === index;
    if (transitionType === "scale") {
      return { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.2 };
    }
    return { opacity: isActive ? 1 : 0 };
  };

  const isHorizontal = dockPosition === "top" || dockPosition === "bottom";
  const dockStyle: React.CSSProperties =
    dockPosition === "left"
      ? { top: "50%", left: 16, transform: "translateY(-50%)" }
      : dockPosition === "right"
      ? { top: "50%", right: 16, transform: "translateY(-50%)" }
      : dockPosition === "top"
      ? { top: 16, left: "50%", transform: "translateX(-50%)" }
      : { bottom: 16, left: "50%", transform: "translateX(-50%)" };

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", minHeight: "100vh", height: `${scrollHeight}vh`, backgroundColor, ...style }}
    >
      <div style={{ position: "sticky", top: 0, width: "100%", height: "100vh", overflow: "hidden" }}>
        {items.map((item, index) => (
          <motion.div
            key={index}
            style={{ position: "absolute", inset: 0, pointerEvents: activeIndex === index ? undefined : "none", zIndex: activeIndex === index ? 1 : 0 }}
            initial={false}
            animate={variantsFor(index)}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <img src={item.image} alt={item.alt ?? item.text ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
          </motion.div>
        ))}

        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              style={{ position: "absolute", color: textColor, fontSize: 40, fontWeight: 700, textAlign: "center" }}
              initial={false}
              animate={{ opacity: activeIndex === index ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut", delay: 0.15 }}
            >
              {item.text}
            </motion.div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            zIndex: 10,
            display: "flex",
            flexDirection: isHorizontal ? "row" : "column",
            gap: 8,
            padding: 8,
            borderRadius: 16,
            background: "rgba(255,255,255,0.4)",
            backdropFilter: "blur(5px)",
            ...dockStyle,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => handleThumbnailClick(index)}
              style={{ position: "relative", width: thumbSize, height: thumbSize, cursor: "pointer" }}
            >
              {activeIndex === index && (
                <motion.div
                  layoutId="gallery-thumb-outline"
                  style={{ position: "absolute", inset: -3, border: "2px solid white", borderRadius: 16, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <img
                src={item.image}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StickyScrollGallery;
