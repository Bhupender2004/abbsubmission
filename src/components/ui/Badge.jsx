import { cn } from "../../lib/utils";

const variantStyles = {
  critical: "bg-status-critical/10 text-status-critical border border-status-critical/20",
  warning: "bg-status-warning/10 text-status-warning border border-status-warning/20",
  healthy: "bg-status-healthy/10 text-status-healthy border border-status-healthy/20",
  neutral: "bg-border text-text-secondary border border-border/50",
};

export function Badge({ variant = "neutral", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
