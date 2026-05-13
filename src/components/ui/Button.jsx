import { cn } from "../../lib/utils";

const variantStyles = {
  primary: "bg-text-primary text-background hover:bg-white",
  secondary: "bg-card border border-border text-text-primary hover:bg-border",
  danger: "bg-status-critical/10 text-status-critical border border-status-critical/20 hover:bg-status-critical/20",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-border/50",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  icon: "p-2",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
