"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { memo } from "react";
import { DisplayMode } from "../types/models";

interface DisplayModeToggleProps {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  className?: string;
}

const DisplayModeToggle = memo(
  ({ displayMode, setDisplayMode, className }: DisplayModeToggleProps) => {
    return (
      <ToggleGroup
        type="single"
        value={displayMode}
        onValueChange={(value) => {
          if (value) setDisplayMode(value as DisplayMode);
        }}
        className={`bg-muted/50 rounded-lg border p-0.5 ${className ?? ""}`}
      >
        <ToggleGroupItem
          value="questions"
          size="sm"
          className="data-[state=on]:bg-logo-main cursor-pointer rounded-md px-3 py-1 text-xs data-[state=on]:text-white data-[state=on]:shadow-sm"
        >
          Questions
        </ToggleGroupItem>
        <ToggleGroupItem
          value="answers"
          size="sm"
          className="data-[state=on]:bg-logo-main cursor-pointer rounded-md px-3 py-1 text-xs data-[state=on]:text-white data-[state=on]:shadow-sm"
        >
          Answers
        </ToggleGroupItem>
      </ToggleGroup>
    );
  },
);

DisplayModeToggle.displayName = "DisplayModeToggle";

export default DisplayModeToggle;
