"use client";

import { type CSSProperties } from "react";
import { useMotionActive } from "./MotionProvider";

interface MarqueeTextProps {
  items: string[];
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

export function MarqueeText({
  items,
  speed = 30,
  className,
  style,
}: MarqueeTextProps) {
  const active = useMotionActive();

  if (!active) return null;

  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        borderTop: "1px solid var(--pragma-border)",
        borderBottom: "1px solid var(--pragma-border)",
        padding: "12px 0",
        ...style,
      }}
    >
      <div
        style={{
          display: "inline-block",
          animation: `pragmaMarquee ${speed}s linear infinite`,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--pragma-subtext)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} style={{ marginRight: 48 }}>
            <span style={{ color: "var(--pragma-accent)", marginRight: 10 }}>
              ◆
            </span>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
