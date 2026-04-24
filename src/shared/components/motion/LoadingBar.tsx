"use client";

import { type CSSProperties } from "react";
import { useMotionActive } from "./MotionProvider";

interface LoadingBarProps {
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function LoadingBar({ label, className, style }: LoadingBarProps) {
  const active = useMotionActive();

  return (
    <div className={className} style={style} role="status" aria-live="polite">
      {label && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--pragma-subtext)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          height: 2,
          background: "var(--pragma-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "40%",
            background: "var(--pragma-accent)",
            animation: active
              ? "pragmaLoading 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite"
              : undefined,
            ...(active ? {} : { transform: "translateX(0)" }),
          }}
        />
      </div>
    </div>
  );
}
