import { Switch } from "@/components/ui/switch";
import { memo, useCallback } from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";

const StrictModeToggle = memo(() => {
  const { uiPreferences, setUiPreference } = useTopicalApp();

  const handleStrictModeToggle = useCallback(() => {
    setUiPreference("isStrictModeEnabled", (prev) => !prev);
  }, [setUiPreference]);

  return (
    <div className="border-muted-foreground/20 bg-muted flex w-full items-center justify-around rounded-md border p-2">
      <div className="flex w-[70%] flex-col items-start justify-center">
        <p className="text-sm font-semibold">Strict mode</p>
        <p className="text-muted-foreground text-xs">
          Questions containing unrelated topics will be excluded.
        </p>
      </div>
      <Switch
        checked={uiPreferences.isStrictModeEnabled}
        title="Toggle"
        className="hover:cursor-pointer"
        onCheckedChange={handleStrictModeToggle}
      />
    </div>
  );
});
StrictModeToggle.displayName = "StrictModeToggle";

export default StrictModeToggle;
