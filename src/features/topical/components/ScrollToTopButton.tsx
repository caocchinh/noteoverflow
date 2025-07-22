import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpFromLine } from "lucide-react";

export const ScrollToTopButton = ({
  showScrollToTopButton,
  isScrollingAndShouldShowScrollButton,
  scrollAreaRef,
}: {
  showScrollToTopButton: boolean;
  isScrollingAndShouldShowScrollButton: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    showScrollToTopButton && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "fixed cursor-pointer !px-[10px] bottom-[3%] right-[1.5%] rounded-sm z-[10]",
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
