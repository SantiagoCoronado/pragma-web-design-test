"use client";

import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-pragma-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`bg-pragma-surface border border-pragma-border rounded-lg px-4 py-2.5 text-pragma-text placeholder:text-pragma-muted/50 focus:outline-none focus:border-pragma-accent/50 focus:ring-1 focus:ring-pragma-accent/20 transition-colors resize-y min-h-[100px] ${
            error ? "border-red-500/50" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
