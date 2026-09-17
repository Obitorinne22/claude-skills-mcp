"use client";

/**
 * LiquidGlassNavbar
 *
 * Concept port of a Framer.com canvas-generated component ("Liquid Glass
 * Navbar"). That original isn't a hand-written "code component" — it's
 * Framer's own canvas-design export: a deeply nested JSX tree wired to
 * ~8 more Framer-internal sub-component modules (NavLink, GlassCTA, the
 * `framer` package's RichText/Link/useVariantState/etc.), none of which
 * exist outside Framer.com. Reverse-engineering it 1:1 would mean pulling
 * in all of those, none of them portable.
 *
 * So this is a from-scratch rebuild of the same visual idea — a pill-
 * shaped glassmorphic navbar with a logo, nav links, a CTA button, and a
 * mobile hamburger that animates into an X via framer-motion — using only
 * plain CSS (backdrop-filter, gradients) and framer-motion for the
 * animated bits.
 *
 * npm i framer-motion
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface LiquidGlassNavbarProps {
  logoName?: string;
  links?: NavLinkItem[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LiquidGlassNavbar({
  logoName = "Brand",
  links = [
    { label: "Features", href: "#" },
    { label: "Work", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "About", href: "#" },
  ],
  ctaLabel = "Get Started",
  ctaHref = "#",
  className,
  style,
}: LiquidGlassNavbarProps) {
  const [open, setOpen] = useState(false);

  const glassBg =
    "linear-gradient(150deg, rgb(208, 208, 208) 0%, rgb(232, 232, 232) 50%, rgb(200, 200, 200) 100%)";
  const outerShadow =
    "0.3px 4px 2px rgba(0,0,0,0.01), 0.5px 7px 4px rgba(0,0,0,0.01), 0.8px 12px 6px rgba(0,0,0,0.02), 1.3px 19px 10px rgba(0,0,0,0.03), 2.2px 33px 17px rgba(0,0,0,0.03), 4px 60px 30px rgba(0,0,0,0.06)";

  return (
    <nav
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #fff 0%, #c9c9c9 9%, #a1a1a1 32%, #757575 73%, #fff 100%)",
        borderRadius: 999,
        padding: 3,
        boxShadow: outerShadow,
        maxWidth: 780,
        margin: "0 auto",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: glassBg,
          borderRadius: 999,
          padding: "8px 10px 8px 14px",
          boxShadow: "inset 0 1px 1.5px rgba(0,0,0,0.07), inset 0 -1px 1.5px rgba(0,0,0,0.07)",
          backdropFilter: "blur(6px)",
        }}
      >
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <div
            style={{
              width: 19,
              height: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 3,
                transform: "rotate(45deg)",
                background: "linear-gradient(135deg, #f4f5f8 0%, #c4c8d0 55%, #9ea2ac 100%)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), 0 4px 7px -1px rgba(0,0,0,0.35)",
              }}
            />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "#0a0a0c" }}>{logoName}</span>
        </a>

        <div style={{ display: "none" }} className="lgn-links-desktop">
          {/* Desktop links rendered below via CSS class toggle in consuming app;
              kept inline here for a dependency-free single file. */}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="lgn-links">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ padding: "8px 14px", fontSize: 14, color: "#0a0a0c", textDecoration: "none", borderRadius: 999 }}
            >
              {link.label}
            </a>
          ))}
          <a
            href={ctaHref}
            style={{
              marginLeft: 6,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              fontSize: 14,
              fontWeight: 500,
              color: "#0a0a0c",
              textDecoration: "none",
            }}
          >
            {ctaLabel}
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lgn-toggle"
          style={{
            display: "none",
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "none",
            background: "rgba(255,255,255,0.4)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
            cursor: "pointer",
          }}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0, top: open ? 19 : 15 }}
            style={{ position: "absolute", left: 11, width: 18, height: 2, borderRadius: 2, background: "#0a0a0c" }}
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, top: open ? 19 : 23 }}
            style={{ position: "absolute", left: 11, width: 18, height: 2, borderRadius: 2, background: "#0a0a0c" }}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lgn-mobile-menu"
            style={{
              display: "none",
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              background: glassBg,
              borderRadius: 27,
              padding: 14,
              boxShadow: outerShadow,
              flexDirection: "column",
              gap: 2,
            }}
          >
            {links.map((link) => (
              <a key={link.label} href={link.href} style={{ padding: "10px 8px", color: "#0a0a0c", textDecoration: "none" }}>
                {link.label}
              </a>
            ))}
            <a
              href={ctaHref}
              style={{
                marginTop: 8,
                padding: "10px 16px",
                borderRadius: 999,
                textAlign: "center",
                background: "rgba(255,255,255,0.5)",
                color: "#0a0a0c",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {ctaLabel}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        Responsive switch (links row vs hamburger) needs a real breakpoint,
        which inline styles can't express — add this once, globally, in your
        project's CSS:

        @media (max-width: 810px) {
          .lgn-links { display: none !important; }
          .lgn-toggle { display: flex !important; align-items: center; justify-content: center; }
          .lgn-mobile-menu { display: flex !important; }
        }
      */}
    </nav>
  );
}

export default LiquidGlassNavbar;
