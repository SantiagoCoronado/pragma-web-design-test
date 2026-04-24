"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={id}
            className="font-mono text-[10px] tracking-[0.12em] uppercase text-pragma-subtext"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`bg-transparent border-0 border-b border-pragma-border px-0 py-2 text-[15px] text-pragma-text placeholder:text-pragma-muted focus:outline-none focus:border-pragma-accent transition-colors ${
            error ? "border-pragma-danger" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-pragma-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
