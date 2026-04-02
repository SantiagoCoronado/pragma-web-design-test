interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-pragma-surface/50 backdrop-blur-sm border border-pragma-border rounded-xl p-6 ${
        hover
          ? "transition-all duration-300 hover:border-pragma-accent/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
