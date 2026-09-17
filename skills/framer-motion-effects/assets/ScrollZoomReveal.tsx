"use client";

/**
 * ScrollZoomReveal
 *
 * Port of a Framer.com "code component" (scroll_zoom_reveal.js): a small
 * rounded box (with an image/video inside) grows to fill the viewport as
 * the page scrolls through a tall section — the "Apple showreel" effect.
 * Flanking left/right captions and a center play button fade in partway
 * through the zoom.
 *
 * Already used framer-motion in the original (useScroll/useTransform/
 * useSpring); this port keeps that, drops the JS-driven responsive
 * breakpoint table in favor of CSS clamp() for font sizes, and drops the
 * Framer-canvas-only static-render branch (not needed outside Framer).
 *
 * npm i framer-motion
 */

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export interface ScrollZoomRevealProps {
  /** Background/poster image shown before video plays (or permanently, if no video). */
  imageSrc: string;
  imageAlt?: string;
  /** Optional .mp4 URL. If provided, clicking the center button plays it inline. */
  videoUrl?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  leftText?: string;
  rightText?: string;
  buttonText?: string;
  buttonLink?: string;
  textColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  /** Spring physics for the corner-radius animation. */
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Icon shown in the play button. Default "play". */
  icon?: "play" | "arrow" | "none";
}

function PlayIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8 5v14l11-7z" fill={color} />
    </svg>
  );
}

function ArrowIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScrollZoomReveal({
  imageSrc,
  imageAlt = "",
  videoUrl,
  autoPlay = false,
  loop = true,
  muted = false,
  leftText = "\u00A92026",
  rightText = "Showreel",
  buttonText = "Play showreel",
  buttonLink = "#",
  textColor = "#000000",
  buttonTextColor = "#FFFFFF",
  buttonBgColor = "#000000",
  stiffness = 90,
  damping = 25,
  mass = 0.6,
  icon = "play",
}: ScrollZoomRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const width = useTransform(scrollYProgress, [0, 1], ["15vw", "100vw"]);
  const height = useTransform(scrollYProgress, [0, 1], ["5vh", "100vh"]);
  const rawRadius = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const borderRadius = useSpring(rawRadius, { stiffness, damping, mass });
  const centerOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const centerY = useTransform(scrollYProgress, [0.45, 0.6], [60, 0]);

  const handlePlayClick = (e: React.MouseEvent) => {
    if (videoUrl) {
      e.preventDefault();
      setIsPlaying(true);
      videoRef.current?.play();
    }
  };

  return (
    <section ref={ref} style={{ height: "400vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(10px, 1.5vw, 20px)",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            width: "clamp(100px, 15vw, 250px)",
            textAlign: "right",
            fontWeight: 500,
            color: textColor,
            fontSize: "clamp(22px, 3.5vw, 55px)",
          }}
        >
          {leftText}
        </div>

        <motion.div
          style={{
            width,
            height,
            borderRadius,
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
            background: "#000",
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              transform: "translate(-50%, -50%)",
              opacity: isPlaying ? 0 : 1,
              transition: "opacity 0.4s ease",
            }}
          />
          {videoUrl && (
            <video
              ref={videoRef}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              playsInline
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isPlaying ? 1 : 0,
                pointerEvents: isPlaying ? "auto" : "none",
                transition: "opacity 0.4s ease",
              }}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
          {!isPlaying && (
            <motion.a
              href={buttonLink}
              onClick={handlePlayClick}
              aria-label={buttonText}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                translateX: "-50%",
                translateY: "-50%",
                opacity: centerOpacity,
                y: centerY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: "inherit",
                fontWeight: 500,
                color: buttonTextColor,
                textDecoration: "none",
                whiteSpace: "nowrap",
                fontSize: "clamp(26px, 4vw, 56px)",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              {buttonText}
              {icon !== "none" && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: buttonBgColor,
                    width: "clamp(42px, 5vw, 60px)",
                    height: "clamp(42px, 5vw, 60px)",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                >
                  {icon === "play" ? (
                    <PlayIcon size={20} color={buttonTextColor} />
                  ) : (
                    <ArrowIcon size={20} color={buttonTextColor} />
                  )}
                </span>
              )}
            </motion.a>
          )}
        </motion.div>

        <div
          style={{
            whiteSpace: "nowrap",
            width: "clamp(100px, 15vw, 250px)",
            textAlign: "left",
            fontWeight: 500,
            color: textColor,
            fontSize: "clamp(22px, 3.5vw, 55px)",
          }}
        >
          {rightText}
        </div>
      </div>
    </section>
  );
}

export default ScrollZoomReveal;
