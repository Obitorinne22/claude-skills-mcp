"use client";

/**
 * FloatingPillNav
 *
 * Port of a Framer.com "code component" (FloatingPillNavigation.js): a
 * pill-shaped nav where the active item's background slides smoothly
 * between links on click, via framer-motion's shared-layout `layoutId`.
 *
 * npm i framer-motion
 */

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface PillNavItem {
  label: string;
  href?: string;
  target?: "_self" | "_blank";
}

export interface FloatingPillNavProps {
  items: PillNavItem[];
  /** Label of the item active on first render. Default: items[0]'s label. */
  defaultActive?: string;
  backgroundColor?: string;
  textColor?: string;
  activeBackgroundColor?: string;
  activeTextColor?: string;
  /** Outer pill padding in px. Default 6. */
  padding?: number;
  /** Gap between links in px. Default 0. */
  gap?: number;
  /** Padding inside each link, CSS shorthand. Default "12px 22px". */
  linkPadding?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FloatingPillNav({
  items,
  defaultActive,
  backgroundColor = "#E8E8ED",
  textColor = "#000000",
  activeBackgroundColor = "#1D1D1F",
  activeTextColor = "#FFFFFF",
  padding = 6,
  gap = 0,
  linkPadding = "12px 22px",
  className,
  style,
}: FloatingPillNavProps) {
  const [active, setActive] = useState(defaultActive ?? items[0]?.label);

  const handleClick = (item: PillNavItem) => {
    setActive(item.label);
    if (item.href && typeof window !== "undefined") {
      let href = item.href;
      if (!/^(https?:\/\/|mailto:|tel:|#|\/)/.test(href)) href = `https://${href}`;
      if (item.target === "_blank") window.open(href, "_blank");
      else window.location.href = href;
    }
  };

  return (
    <nav
      className={className}
      style={{
        display: "inline-flex",
        backgroundColor,
        borderRadius: 999,
        padding,
        gap,
        position: "relative",
        width: "max-content",
        userSelect: "none",
        ...style,
      }}
    >
      {items.map((item, index) => {
        const isActive = item.label === active;
        return (
          <div
            key={index}
            onClick={() => handleClick(item)}
            style={{
              position: "relative",
              padding: linkPadding,
              color: isActive ? activeTextColor : textColor,
              cursor: "pointer",
              zIndex: 1,
              transition: "color 0.3s ease",
              userSelect: "none",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="pill-active-background"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: activeBackgroundColor,
                  borderRadius: 999,
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 800, damping: 60, mass: 1 }}
              />
            )}
            {item.label}
          </div>
        );
      })}
    </nav>
  );
}

export default FloatingPillNav;
