import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { memo, useState } from "react";
import { QR } from "./QR";

export const ShareFilter = memo(
  ({
    isDisabled,
    url,
    type = "filter",
  }: {
    isDisabled: boolean;
    url: string;
    type?: "filter" | "bookmark" | "question" | "search result";
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                "bg-logo-main! w-9 cursor-pointer rounded-sm text-white!",
                isDisabled && "cursor-default! opacity-50",
              )}
              onClick={() => {
                if (isDisabled) {
                  return;
                }

                setIsOpen(true);
              }}
            >
              <Send />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-logo-main! z-99999999 flex items-center justify-center gap-2 text-white!"
            arrowClassName="!bg-logo-main !fill-logo-main"
          >
            {isDisabled ? <>To share {type}, run a search first.</> : <>Share {type}</>}
          </TooltipContent>
        </Tooltip>
        <QR isOpen={isOpen} setIsOpen={setIsOpen} url={url} type={type} />
      </>
    );
  },
);

ShareFilter.displayName = "ShareFilter";
