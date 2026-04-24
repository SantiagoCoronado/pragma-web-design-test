"use client";

import { type CSSProperties } from "react";
import { useMotionActive } from "./MotionProvider";

interface GlitchTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export function GlitchText({ text, className, style }: GlitchTextProps) {
  const active = useMotionActive();
  if (!active) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }
  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-block", ...style }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>{text}</span>
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          color: "var(--pragma-accent)",
          animation: "pragmaGlitch 2.2s infinite steps(1)",
          clipPath: "inset(0 0 0 0)",
          mixBlendMode: "screen",
        }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          color: "var(--pragma-accent-2)",
          animation: "pragmaGlitch2 2.4s infinite steps(1)",
          mixBlendMode: "screen",
        }}
      >
        {text}
      </span>
    </span>
  );
}
