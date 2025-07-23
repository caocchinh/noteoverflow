import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LandPlot, X } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Dispatch, SetStateAction, useState } from "react";

export default function VisualSetting({
  showFinishedQuestionTint,
  setShowFinishedQuestionTint,
  showScrollToTopButton,
  setShowScrollToTopButton,
  scrollUpWhenPageChange,
  setScrollUpWhenPageChange,
}: {
  showFinishedQuestionTint: boolean;
  setShowFinishedQuestionTint: Dispatch<SetStateAction<boolean>>;
  showScrollToTopButton: boolean;
  setShowScrollToTopButton: Dispatch<SetStateAction<boolean>>;
  scrollUpWhenPageChange: boolean;
  setScrollUpWhenPageChange: Dispatch<SetStateAction<boolean>>;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <LandPlot />
          Visual settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100006] flex flex-col items-center justify-center gap-3">
        <X
          className="w-4 h-4 absolute top-2 right-2 cursor-pointer"
          onClick={() => setIsPopoverOpen(false)}
        />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-sm font-medium text-center">
            Show green tint on finished questions?
          </h4>
          <Switch
            checked={showFinishedQuestionTint}
            onCheckedChange={setShowFinishedQuestionTint}
          />
        </div>
        <hr />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-sm font-medium text-center ">
            Show scroll to top button?
          </h4>
          <Switch
            checked={showScrollToTopButton}
            onCheckedChange={setShowScrollToTopButton}
          />
        </div>
        <hr />
        <div className="flex flex-row items-center justify-center gap-2">
          <h4 className="text-sm font-medium text-center ">
            Scroll up when page changes? (Pagination layout only)
          </h4>
          <Switch
            checked={scrollUpWhenPageChange}
            onCheckedChange={setScrollUpWhenPageChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
