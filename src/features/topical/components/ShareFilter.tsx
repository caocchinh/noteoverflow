import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import { QR } from "./QR";

export const ShareFilter = ({
  isDisabled,
  url,
}: {
  isDisabled: boolean;
  url: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "rounded-sm w-9 cursor-pointer !bg-logo-main !text-white",
              isDisabled && "opacity-50"
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
          className="!bg-logo-main !text-white"
          arrowClassName="!bg-logo-main !fill-logo-main"
        >
          {isDisabled ? (
            <> To share filter, run a search first.</>
          ) : (
            <>Share filter</>
          )}
        </TooltipContent>
      </Tooltip>
      <QR isOpen={isOpen} setIsOpen={setIsOpen} url={url} />
    </>
  );
};
