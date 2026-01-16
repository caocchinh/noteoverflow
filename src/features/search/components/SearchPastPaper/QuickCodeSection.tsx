import { memo, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowEffect } from "@/components/ui/glow-effect";
import { cn } from "@/lib/utils";
import { QuickCodeSectionProps } from "./types";

const QuickCodeSection = memo(
  ({ value, error, onChange, onSubmit }: QuickCodeSectionProps) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          onSubmit();
        }
      },
      [onSubmit]
    );

    const isDisabled = useMemo(() => !!error || value === "", [error, value]);

    return (
      <div className="relative overflow-hidden bg-linear-to-br from-background via-accent/20 to-accent/40 rounded-xl border border-border/50shadow-md">
        <div className="relative z-10">
          <div className="flex items-center gap-2 px-4 pt-2 pb-0">
            <div className="absolute inset-0 bg-linear-to-r from-logo-main/5 via-transparent to-logo-main/5" />
            <h4 className="text-base font-semibold text-logo-main">
              ⚡ Quick Paper Code
            </h4>
          </div>

          <div className="flex justify-center px-4 py-2 gap-5 w-full sm:flex-row flex-col">
            <div className="relative flex-1">
              <Input
                id="quick-code"
                placeholder="e.g. 9702/42/M/J/20"
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full text-center font-mono text-sm bg-background/80 border-2 transition-all duration-200",
                  error
                    ? "border-red-500 focus:border-red-600"
                    : "border-border/50 focus:border-logo-main/50"
                )}
              />
            </div>

            <div className="relative sm:w-auto w-full">
              <GlowEffect
                colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                mode="colorShift"
                blur="soft"
                duration={3}
              />
              <Button
                onClick={onSubmit}
                className={cn(
                  "cursor-pointer h-full sm:w-auto w-full relative z-10 font-semibold transition-all duration-200",
                  isDisabled ? "opacity-50" : "hover:scale-105"
                )}
                disabled={isDisabled}
              >
                Find Paper
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="px-4 py-2">
            {error ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">Format:</span> [Subject
                      Code]/[Paper Number]/[Season]/[Year]
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <span className="font-semibold">💡 Tip:</span> Press Enter
                      twice to access marking schemes quickly
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <span className="font-semibold">📝 Note:</span> Quick
                      search updates manual input fields automatically
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

QuickCodeSection.displayName = "QuickCodeSection";

export default QuickCodeSection;
