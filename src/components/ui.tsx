import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "outline" | "danger" }) {
  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
    ghost: "hover:bg-[var(--muted)]",
    outline: "border border-[var(--border)] hover:bg-[var(--muted)]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium px-4 py-2 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium block mb-1", className)} {...props} />;
}

export function Badge({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}
