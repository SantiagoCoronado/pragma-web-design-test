"use client";

import { type CSSProperties } from "react";
import { useMotionActive } from "./MotionProvider";

interface SplitRevealProps {
  text: string;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function SplitReveal({
  text,
  delay = 60,
  className,
  style,
}: SplitRevealProps) {
  const active = useMotionActive();
  if (!active) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }

  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            marginRight: "0.25em",
            verticalAlign: "bottom",
          }}
        >
          <span
            style={{
              display: "inline-block",
              animation: `pragmaRise 0.6s ${
                i * delay
              }ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
