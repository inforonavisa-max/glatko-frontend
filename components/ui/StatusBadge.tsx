import { cn } from "@/lib/utils";

type StatusVariant =
  | "teal"
  | "amber"
  | "green"
  | "red"
  | "blue"
  | "yellow"
  | "gray"
  | "indigo"
  | "orange";

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  teal: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  green: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  red: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
  gray: "bg-gray-500/10 text-gray-500 border-gray-500/20 dark:text-gray-400",
  indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
  orange: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
};

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({
  children,
  variant = "gray",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
