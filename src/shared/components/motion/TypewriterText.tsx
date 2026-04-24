"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { useMotionActive } from "./MotionProvider";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  cursor?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TypewriterText({
  text,
  speed = 40,
  cursor = true,
  className,
  style,
}: TypewriterTextProps) {
  const active = useMotionActive();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setI((prev) => {
        if (prev >= text.length) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);

  const shown = active ? text.slice(0, i) : text;
  const cursorVisible = cursor;
  const done = !active || i >= text.length;

  return (
    <span className={className} style={style}>
      {shown}
      {cursorVisible && (
        <span
          style={{
            opacity: done ? 0.6 : 1,
            animation: active
              ? "pragmaBlink 1s steps(1) infinite"
              : undefined,
            color: "var(--pragma-accent)",
          }}
        >
          ▌
        </span>
      )}
    </span>
  );
}
