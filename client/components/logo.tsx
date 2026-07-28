import { cn } from "@/lib/utils";

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-bold text-white shadow-sm">
        <span className="text-sm tracking-tight">AW</span>
      </div>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">ApplyWise</span>
      )}
    </div>
  );
}
