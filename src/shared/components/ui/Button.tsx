"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-pragma-accent text-pragma-on-accent hover:bg-pragma-accent-hover",
  secondary:
    "bg-transparent border border-pragma-border text-pragma-text hover:border-pragma-accent hover:text-pragma-text",
  ghost:
    "bg-transparent text-pragma-accent hover:text-pragma-accent-hover",
  danger:
    "bg-transparent border border-pragma-danger text-pragma-danger hover:bg-pragma-danger hover:text-pragma-on-accent",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-pragma-md)] font-medium tracking-[-0.005em] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
