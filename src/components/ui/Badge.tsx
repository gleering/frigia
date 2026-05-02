import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "gold" | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-frigia-light text-frigia-graphite",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger:  "bg-red-100 text-red-600",
  info:    "bg-blue-100 text-blue-700",
  gold:    "bg-frigia-gold/15 text-frigia-gold-deep",
  dark:    "bg-frigia-dark text-frigia-bone",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
