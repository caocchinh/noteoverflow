import { Button } from "@/components/ui/button";
import { GlowEffect } from "@/components/ui/glow-effect";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { QuickCodeSectionProps } from "./types";

const QuickCodeSection = memo(({ value, error, onChange, onSubmit }: QuickCodeSectionProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onSubmit();
      }
    },
    [onSubmit],
  );

  const isDisabled = useMemo(() => !!error || value === "", [error, value]);

  return (
    <div className="from-background via-accent/20 to-accent/40 border-border/50shadow-md relative overflow-hidden rounded-xl border bg-linear-to-br">
      <div className="relative z-10">
        <div className="flex items-center gap-2 px-4 pt-2 pb-0">
          <div className="from-logo-main/5 to-logo-main/5 absolute inset-0 bg-linear-to-r via-transparent" />
          <h4 className="text-logo-main text-base font-semibold">⚡ Quick Paper Code</h4>
        </div>

        <div className="flex w-full flex-col justify-center gap-5 px-4 py-2 sm:flex-row">
          <div className="relative flex-1">
            <Input
              id="quick-code"
              placeholder="e.g. 9702/42/M/J/20"
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "bg-background/80 w-full border-2 text-center font-mono text-sm transition-all duration-200",
                error
                  ? "border-red-500 focus:border-red-600"
                  : "border-border/50 focus:border-logo-main/50",
              )}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <GlowEffect
              colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
              mode="colorShift"
              blur="soft"
              duration={3}
            />
            <Button
              onClick={onSubmit}
              className={cn(
                "relative z-10 h-full w-full cursor-pointer font-semibold transition-all duration-200 sm:w-auto",
                isDisabled ? "opacity-50" : "hover:scale-105",
              )}
              disabled={isDisabled}
            >
              Find Paper
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-2">
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/30 dark:bg-red-950/20">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/30 dark:bg-blue-950/20">
                <div className="space-y-1">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Format:</span> [Subject Code]/[Paper
                    Number]/[Season]/[Year]
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <span className="font-semibold">💡 Tip:</span> Press Enter twice to access
                    marking schemes quickly
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <span className="font-semibold">📝 Note:</span> Quick search updates manual
                    input fields automatically
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

QuickCodeSection.displayName = "QuickCodeSection";

export default QuickCodeSection;
