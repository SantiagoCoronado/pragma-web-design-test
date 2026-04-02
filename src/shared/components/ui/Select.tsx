"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-pragma-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`bg-pragma-surface border border-pragma-border rounded-lg px-4 py-2.5 text-pragma-text focus:outline-none focus:border-pragma-accent/50 focus:ring-1 focus:ring-pragma-accent/20 transition-colors ${
            error ? "border-red-500/50" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
