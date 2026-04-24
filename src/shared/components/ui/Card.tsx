interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-pragma-surface-2 border border-pragma-border rounded-[var(--radius-pragma-md)] p-6 ${className}`}
    >
      {children}
    </div>
  );
}
