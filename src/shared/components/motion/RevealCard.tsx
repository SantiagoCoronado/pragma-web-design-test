"use client";

import { createElement, type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/shared/hooks/useInView";
import { useMotionActive } from "./MotionProvider";

type RevealTag = "div" | "article" | "figure" | "section";

interface RevealCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: RevealTag;
}

export function RevealCard({
  children,
  delay = 0,
  className,
  style,
  as = "div",
}: RevealCardProps) {
  const active = useMotionActive();
  const [ref, inView] = useInView<HTMLElement>();

  const animate = active && inView;

  return createElement(
    as,
    {
      ref,
      className,
      style: {
        ...style,
        animation: animate
          ? `pragmaCardRise 0.7s ${delay}ms cubic-bezier(0.2, 0.8, 0.2, 1) both`
          : undefined,
        opacity: active && !inView ? 0 : 1,
      },
    },
    children
  );
}
