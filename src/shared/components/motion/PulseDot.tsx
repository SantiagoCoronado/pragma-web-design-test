"use client";

import { type ReactNode } from "react";
import { useMotionActive } from "./MotionProvider";

interface PulseDotProps {
  children: ReactNode;
  className?: string;
}

export function PulseDot({ children, className }: PulseDotProps) {
  const active = useMotionActive();

  if (!active) {
    return (
      <span className={`inline-flex items-center gap-2${className ? ` ${className}` : ""}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-pragma-accent" />
        {children}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        aria-hidden
        style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--pragma-accent)",
            borderRadius: 999,
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: -4,
            background: "var(--pragma-accent)",
            borderRadius: 999,
            opacity: 0.4,
            animation: "pragmaPulse 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite",
          }}
        />
      </span>
      {children}
    </span>
  );
}
