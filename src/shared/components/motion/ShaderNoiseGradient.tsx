"use client";

import { type CSSProperties } from "react";
import { useCanvasShader } from "./useCanvasShader";
import { useMotionActive } from "./MotionProvider";

interface ShaderNoiseGradientProps {
  className?: string;
  style?: CSSProperties;
}

export function ShaderNoiseGradient({
  className,
  style,
}: ShaderNoiseGradientProps) {
  const active = useMotionActive();
  const setRef = useCanvasShader((ctx, w, h, time, _dpr, tokens) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, tokens.bg);
    g.addColorStop(0.5, tokens.surface);
    g.addColorStop(1, tokens.bg);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5 + Math.cos(time * 0.3) * w * 0.2;
    const cy = h * 0.5 + Math.sin(time * 0.4) * h * 0.2;
    const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
    rad.addColorStop(0, tokens.accent + "1a");
    rad.addColorStop(1, "transparent");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = tokens.text;
    ctx.globalAlpha = 0.025;
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;
  });

  if (!active) return null;

  return (
    <canvas
      ref={setRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    />
  );
}
