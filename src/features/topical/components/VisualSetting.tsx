import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LandPlot, X } from "lucide-react";
import { useState } from "react";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { ImageTheme } from "../types/preferences";

export default function VisualSetting({}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { uiPreferences, setUiPreference } = useTopicalApp();
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className="-mt-1 flex w-full cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <LandPlot />
          Visual settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-100006 flex flex-col items-center justify-center gap-3">
        <X
          className="absolute top-2 right-2 h-4 w-4 cursor-pointer"
          onClick={() => setIsPopoverOpen(false)}
        />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-center text-sm font-medium">
            Show green tint on finished questions?
          </h4>
          <Switch
            checked={uiPreferences.showFinishedQuestionTint}
            onCheckedChange={() => {
              setUiPreference("showFinishedQuestionTint", (prev) => !prev);
            }}
          />
        </div>
        <hr />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-center text-sm font-medium">Show scroll to top button?</h4>
          <Switch
            checked={uiPreferences.showScrollToTopButton}
            onCheckedChange={() => {
              setUiPreference("showScrollToTopButton", (prev) => !prev);
            }}
          />
        </div>
        <hr />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-center text-sm font-medium">
            Scroll up when page changes? (Pagination layout only)
          </h4>
          <Switch
            checked={uiPreferences.scrollUpWhenPageChange}
            onCheckedChange={() => {
              setUiPreference("scrollUpWhenPageChange", (prev) => !prev);
            }}
          />
        </div>
        <hr />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-center text-sm font-medium">Question & Answer image theme</h4>
          <Select
            value={uiPreferences.imageTheme}
            onValueChange={(value) => {
              setUiPreference("imageTheme", value as ImageTheme);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Image theme" />
            </SelectTrigger>
            <SelectContent className="dark:bg-accent z-1000010">
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
