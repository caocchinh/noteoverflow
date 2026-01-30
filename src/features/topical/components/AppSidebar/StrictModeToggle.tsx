import { memo, useCallback } from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { Switch } from "@/components/ui/switch";

const StrictModeToggle = memo(() => {
  const { uiPreferences, setUiPreference } = useTopicalApp();

  const handleStrictModeToggle = useCallback(() => {
    setUiPreference("isStrictModeEnabled", (prev) => !prev);
  }, [setUiPreference]);

  return (
    <div className="w-full flex items-center justify-around rounded-md border border-muted-foreground/20 bg-muted p-2">
      <div className="w-[70%] flex items-start justify-center flex-col">
        <p className="text-sm font-semibold">Strict mode</p>
        <p className="text-xs text-muted-foreground">
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
