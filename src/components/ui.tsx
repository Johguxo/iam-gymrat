import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5",
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
}: ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "outline" | "danger" | "accent" | "inverse";
}) {
  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
    ghost: "hover:bg-[var(--muted)]",
    outline: "border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--muted)]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    accent: "bg-[var(--accent)] text-white hover:opacity-90",
    inverse: "bg-white text-[#1C1C1E] hover:opacity-90",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold px-5 py-3 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
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
        "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/15",
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
