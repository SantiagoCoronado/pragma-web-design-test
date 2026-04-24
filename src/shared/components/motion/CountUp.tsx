"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { useInView } from "@/shared/hooks/useInView";
import { useMotionActive } from "./MotionProvider";

interface CountUpProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: CSSProperties;
}

export function CountUp({
  to,
  duration = 1600,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  style,
}: CountUpProps) {
  const active = useMotionActive();
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active || !inView) return;

    let raf = 0;
    let start: number | undefined;
    const step = (ts: number) => {
      if (start === undefined) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, active, inView]);

  const displayValue = !active ? to : n;

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
