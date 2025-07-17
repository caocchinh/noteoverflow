import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LandPlot } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export default function VisualSetting({
  showFinishedQuestionTint,
  setShowFinishedQuestionTint,
  showScrollToTopButton,
  setShowScrollToTopButton,
}: {
  showFinishedQuestionTint: boolean;
  setShowFinishedQuestionTint: (showFinishedQuestionTint: boolean) => void;
  showScrollToTopButton: boolean;
  setShowScrollToTopButton: (showScrollToTopButton: boolean) => void;
}) {
  return (
    <Popover>
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
      </PopoverContent>
    </Popover>
  );
}
