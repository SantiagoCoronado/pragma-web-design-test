interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] tracking-[0.1em] uppercase text-pragma-subtext border border-pragma-border px-2 py-1 ${className}`}
    >
      {children}
    </span>
  );
}
