import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
              "fixed right-[1.5%] bottom-[2.5%] z-50 cursor-pointer rounded-sm px-[10px]!",
              !isScrollingAndShouldShowScrollButton && "hidden!",
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
