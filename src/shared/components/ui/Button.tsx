"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-pragma-accent text-pragma-bg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:bg-pragma-accent/90",
  secondary:
    "border border-pragma-border text-pragma-text hover:border-pragma-accent hover:text-pragma-accent bg-transparent",
  ghost: "text-pragma-muted hover:text-pragma-text bg-transparent",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  success:
    "bg-pragma-accent-3/10 text-pragma-accent-3 border border-pragma-accent-3/20 hover:bg-pragma-accent-3/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
