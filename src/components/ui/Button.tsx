import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-frigia-dark text-frigia-bone hover:bg-frigia-graphite active:scale-95",
  secondary:
    "bg-frigia-rose text-white hover:bg-frigia-rose/90 active:scale-95",
  ghost:
    "text-frigia-deep hover:bg-frigia-light active:scale-95",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:scale-95",
  outline:
    "border border-frigia-dark text-frigia-dark hover:bg-frigia-light active:scale-95",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 rounded-full",
  md: "text-sm px-5 py-2.5 rounded-full",
  lg: "text-sm px-7 py-3.5 rounded-full tracking-wide uppercase font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
