import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeasonSelectProps } from "./types";

const SeasonSelect = memo(({ value, onChange, error }: SeasonSelectProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold mb-1 text-foreground">
          🗓️ Exam Season
        </span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select exam season" />
        </SelectTrigger>
        <SelectContent
          className="z-99999999 dark:bg-accent w-(--radix-select-trigger-width)"
          side="bottom"
        >
          <SelectItem value="Spring">
            🌱 F/M - February/March (Spring)
          </SelectItem>
          <SelectItem value="Summer">☀️ M/J - May/June (Summer)</SelectItem>
          <SelectItem value="Winter">
            ❄️ O/N - October/November (Winter)
          </SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <div className="flex items-center mt-2 gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Season is required
          </p>
        </div>
      )}
    </div>
  );
});

SeasonSelect.displayName = "SeasonSelect";

export default SeasonSelect;
