type BadgeVariant = "default" | "cyan" | "purple" | "green" | "red" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-pragma-border/50 text-pragma-muted",
  cyan: "bg-pragma-accent/10 text-pragma-accent border-pragma-accent/20",
  purple: "bg-pragma-accent-2/10 text-pragma-accent-2 border-pragma-accent-2/20",
  green: "bg-pragma-accent-3/10 text-pragma-accent-3 border-pragma-accent-3/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
