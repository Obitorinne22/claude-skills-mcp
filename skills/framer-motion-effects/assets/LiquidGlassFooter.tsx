"use client";

/**
 * LiquidGlassFooter
 *
 * Concept port of a Framer.com canvas-generated component ("Liquid Glass
 * Footer") — like LiquidGlassNavbar.tsx in this folder, the original is a
 * Framer canvas export wired to several Framer-internal sub-component
 * modules (FooterBrand, FooterLink, GlassSubmitButton, FooterSocialButton,
 * FormContainer, RichText, ...) that only exist inside Framer.com. This is
 * a from-scratch rebuild of the same visual idea in plain React: a
 * glassmorphic footer with a brand blurb + newsletter form, link columns,
 * and a social-icon row.
 *
 * No framer-motion needed here — it's a static layout, no animated state.
 * Swap the plain <form> submit handler for whatever your project uses.
 */

import React from "react";

export interface FooterLinkColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  label: string;
  href: string;
  /** Inline SVG icon element, e.g. <MyIcon />. */
  icon: React.ReactNode;
}

export interface LiquidGlassFooterProps {
  brandName?: string;
  tagline?: string;
  columns?: FooterLinkColumn[];
  social?: SocialLink[];
  onSubscribe?: (email: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function LiquidGlassFooter({
  brandName = "Brand",
  tagline = "Crafted with care for modern products and teams that love detail.",
  columns = [
    { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
    { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }] },
    { title: "Resources", links: [{ label: "Blog", href: "#" }, { label: "Support", href: "#" }, { label: "Community", href: "#" }] },
  ],
  social = [],
  onSubscribe,
  className,
  style,
}: LiquidGlassFooterProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    if (onSubscribe && typeof email === "string") onSubscribe(email);
  };

  return (
    <footer
      className={className}
      style={{
        background: "linear-gradient(180deg, #fff 0%, #c9c9c9 9%, #a1a1a1 32%, #757575 73%, #fff 100%)",
        borderRadius: 40,
        padding: 3,
        maxWidth: 1140,
        margin: "0 auto",
        boxShadow:
          "0.3px 4px 2px rgba(0,0,0,0.01), 0.5px 7px 4px rgba(0,0,0,0.01), 0.8px 12px 6px rgba(0,0,0,0.02), 1.3px 19px 10px rgba(0,0,0,0.03), 2.2px 33px 17px rgba(0,0,0,0.03), 4px 60px 30px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      <div
        style={{
          background: "linear-gradient(150deg, #d0d0d0 0%, #e8e8e8 50%, #c8c8c8 100%)",
          borderRadius: 37,
          boxShadow: "inset 0 1px 1.5px rgba(0,0,0,0.07), inset 0 -1px 1.5px rgba(0,0,0,0.07)",
          padding: "40px 44px 30px 44px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 320 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#0a0a0c" }}>{brandName}</div>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(10,10,12,0.6)", lineHeight: 1.5 }}>{tagline}</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8, width: 260 }}>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: 999,
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -1px 1.5px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Your email"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "10px 16px",
                    fontSize: 13,
                    color: "rgb(10,10,12)",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  flexShrink: 0,
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(255,255,255,0.5)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0a0a0c",
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </form>
          </div>

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {columns.map((col) => (
              <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(20,20,25,0.4)",
                    padding: "6px 0",
                  }}
                >
                  {col.title}
                </div>
                {col.links.map((link) => (
                  <a key={link.label} href={link.href} style={{ padding: "6px 0", fontSize: 14, color: "rgba(10,10,12,0.85)", textDecoration: "none" }}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(10,10,12,0.1)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(20,20,25,0.55)" }}>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </div>
          {social.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.35)",
                    color: "#0a0a0c",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default LiquidGlassFooter;
