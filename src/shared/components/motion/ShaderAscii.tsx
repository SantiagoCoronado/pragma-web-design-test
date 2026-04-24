"use client";

import { type CSSProperties } from "react";
import { useCanvasShader } from "./useCanvasShader";

interface ShaderAsciiProps {
  speed?: number;
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

export function ShaderAscii({
  speed = 1,
  scale = 1,
  className,
  style,
}: ShaderAsciiProps) {
  const setRef = useCanvasShader((ctx, w, h, time, dpr, tokens) => {
    if (w < 10 || h < 10) return;
    ctx.fillStyle = tokens.bg;
    ctx.fillRect(0, 0, w, h);

    const step = 14 * dpr;
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) * 0.6 * scale;
    ctx.font = `${18 * dpr}px JetBrains Mono, monospace`;
    ctx.textBaseline = "top";
    const ramp = "=+*oxX#%@";

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const dx = (x - cx) / rad;
        const dy = (y - cy) / rad;
        const d = Math.sqrt(dx * dx + dy * dy);
        const base = Math.max(0, 1 - d);
        const light =
          base * (0.55 + 0.45 * Math.sin(time * speed + dx * 3 + dy * 3));
        if (light > 0.04) {
          const c = ramp[Math.min(ramp.length - 1, Math.floor(light * ramp.length))];
          ctx.fillStyle = light > 0.55 ? tokens.accent : tokens.text;
          ctx.globalAlpha = Math.min(0.7, 0.35 + light * 0.4);
          ctx.fillText(c, x, y);
        }
      }
    }
    ctx.globalAlpha = 1;
  });

  return (
    <canvas
      ref={setRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        opacity: 0.1,
        ...style,
      }}
    />
  );
}
