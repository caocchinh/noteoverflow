import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpFromLine } from "lucide-react";
import { RefObject } from "react";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

export const ScrollToTopButton = ({
  isScrollingAndShouldShowScrollButton,
  scrollAreaRef,
}: {
  isScrollingAndShouldShowScrollButton: boolean;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
}) => {
  const { uiPreferences } = useTopicalApp();
  return (
    uiPreferences.showScrollToTopButton && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "fixed cursor-pointer !px-[10px] bottom-[3%] right-[1.5%] rounded-sm z-[50]",
              !isScrollingAndShouldShowScrollButton && "!hidden"
            )}
            onClick={() =>
              scrollAreaRef.current?.scrollTo({
                top: 0,
                behavior: "instant",
              })
            }
          >
            <ArrowUpFromLine />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Scroll to top</p>
        </TooltipContent>
      </Tooltip>
    )
  );
};
