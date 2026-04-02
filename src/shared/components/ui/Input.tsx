"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-pragma-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`bg-pragma-surface border border-pragma-border rounded-lg px-4 py-2.5 text-pragma-text placeholder:text-pragma-muted/50 focus:outline-none focus:border-pragma-accent/50 focus:ring-1 focus:ring-pragma-accent/20 transition-colors ${
            error ? "border-red-500/50" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
