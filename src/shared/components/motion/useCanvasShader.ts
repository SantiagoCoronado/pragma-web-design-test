"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "@/shared/hooks/useInView";
import { useMotionActive } from "./MotionProvider";

export interface ShaderTokens {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  text: string;
  subtext: string;
  muted: string;
  accent: string;
  accentHover: string;
  accent2: string;
  onAccent: string;
}

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  dpr: number,
  tokens: ShaderTokens
) => void;

const TOKEN_NAMES: Record<keyof ShaderTokens, string> = {
  bg: "--pragma-bg",
  surface: "--pragma-surface",
  surface2: "--pragma-surface-2",
  border: "--pragma-border",
  borderStrong: "--pragma-border-strong",
  text: "--pragma-text",
  subtext: "--pragma-subtext",
  muted: "--pragma-muted",
  accent: "--pragma-accent",
  accentHover: "--pragma-accent-hover",
  accent2: "--pragma-accent-2",
  onAccent: "--pragma-on-accent",
};

function readTokens(): ShaderTokens {
  const styles = getComputedStyle(document.documentElement);
  const out = {} as ShaderTokens;
  (Object.keys(TOKEN_NAMES) as Array<keyof ShaderTokens>).forEach((key) => {
    out[key] = styles.getPropertyValue(TOKEN_NAMES[key]).trim() || "#000";
  });
  return out;
}

export function useCanvasShader(draw: DrawFn) {
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  const active = useMotionActive();
  const [inViewRef, inView] = useInView<HTMLCanvasElement>({
    rootMargin: "50% 0px",
    triggerOnce: false,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const setRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      inViewRef(node);
      setMounted(!!node);
    },
    [inViewRef]
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!mounted || !el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let tokens = readTokens();

    const onThemeChange = () => {
      tokens = readTokens();
    };
    window.addEventListener("pragma-theme-change", onThemeChange);

    const resize = () => {
      const r = el.getBoundingClientRect();
      const newW = Math.max(1, Math.floor(r.width * dpr));
      const newH = Math.max(1, Math.floor(r.height * dpr));
      if (el.width !== newW) el.width = newW;
      if (el.height !== newH) el.height = newH;
    };

    // Paint at least one frame so the canvas is visible when motion is off.
    resize();
    if (el.width > 1 && el.height > 1) {
      drawRef.current(ctx, el.width, el.height, 0, dpr, tokens);
    }

    if (!active || !inView) {
      return () => {
        window.removeEventListener("pragma-theme-change", onThemeChange);
      };
    }

    let raf = 0;
    let start: number | undefined;
    const loop = (ts: number) => {
      if (start === undefined) start = ts;
      resize();
      const t = (ts - start) / 1000;
      if (el.width > 1 && el.height > 1) {
        drawRef.current(ctx, el.width, el.height, t, dpr, tokens);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pragma-theme-change", onThemeChange);
    };
  }, [mounted, active, inView]);

  return setRef;
}
