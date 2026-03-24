import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function SectionTitle({ children, subtitle, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="font-serif text-2xl text-gray-900 md:text-3xl dark:text-white">
        {children}
      </h2>
      <div className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
      {subtitle && (
        <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
          {subtitle}
        </p>
      )}
    </div>
  );
}
