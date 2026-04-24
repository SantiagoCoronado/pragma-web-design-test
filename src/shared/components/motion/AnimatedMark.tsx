"use client";

import { useMotionActive } from "./MotionProvider";

interface AnimatedMarkProps {
  size?: number;
  className?: string;
}

export function AnimatedMark({ size = 64, className }: AnimatedMarkProps) {
  const active = useMotionActive();

  if (!active) {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden
      >
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          fill="none"
          stroke="var(--pragma-text)"
          strokeWidth="1.5"
        />
        <rect
          x="8"
          y="8"
          width="16"
          height="16"
          fill="var(--pragma-accent)"
        />
        <rect x="14" y="14" width="4" height="4" fill="var(--pragma-bg)" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        fill="none"
        stroke="var(--pragma-text)"
        strokeWidth="1.5"
        strokeDasharray="120"
        strokeDashoffset="120"
        style={{
          animation: "pragmaDash 0.9s 0s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        }}
      />
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        fill="var(--pragma-accent)"
        style={{
          animation:
            "pragmaScaleIn 0.5s 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both",
          transformOrigin: "16px 16px",
        }}
      />
      <rect
        x="14"
        y="14"
        width="4"
        height="4"
        fill="var(--pragma-bg)"
        style={{
          animation:
            "pragmaScaleIn 0.4s 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both",
          transformOrigin: "16px 16px",
        }}
      />
    </svg>
  );
}
