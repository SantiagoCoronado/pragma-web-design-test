"use client";

import { type CSSProperties } from "react";
import { useMotionActive } from "./MotionProvider";

interface FlipNumberProps {
  value: string | number;
  className?: string;
  style?: CSSProperties;
}

export function FlipNumber({ value, className, style }: FlipNumberProps) {
  const active = useMotionActive();
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <span
        key={String(value)}
        style={{
          display: "inline-block",
          animation: active
            ? "pragmaFlipIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
            : undefined,
        }}
      >
        {value}
      </span>
    </span>
  );
}
