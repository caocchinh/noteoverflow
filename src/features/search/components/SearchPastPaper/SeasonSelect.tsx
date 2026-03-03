import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memo } from "react";
import { SeasonSelectProps } from "./types";

const SeasonSelect = memo(({ value, onChange, error }: SeasonSelectProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <span className="text-foreground mb-1 text-xs font-semibold">🗓️ Exam Season</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select exam season" />
        </SelectTrigger>
        <SelectContent
          className="dark:bg-accent z-99999999 w-(--radix-select-trigger-width)"
          side="bottom"
        >
          <SelectItem value="Spring">🌱 F/M - February/March (Spring)</SelectItem>
          <SelectItem value="Summer">☀️ M/J - May/June (Summer)</SelectItem>
          <SelectItem value="Winter">❄️ O/N - October/November (Winter)</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800/30 dark:bg-red-950/20">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">Season is required</p>
        </div>
      )}
    </div>
  );
});

SeasonSelect.displayName = "SeasonSelect";

export default SeasonSelect;
