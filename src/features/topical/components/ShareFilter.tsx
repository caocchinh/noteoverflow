import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo, useRef, useState } from "react";
import { FilterData } from "../constants/types";

export const ShareFilter = ({
  isQuestionViewDisabled,
  currentQuery,
  BETTER_AUTH_URL,
}: {
  isQuestionViewDisabled: boolean;
  currentQuery: {
    curriculumId: string;
    subjectId: string;
  } & FilterData;
  BETTER_AUTH_URL: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("queryKey", JSON.stringify(currentQuery));
    return `${BETTER_AUTH_URL}/topical?${params.toString()}`;
  }, [BETTER_AUTH_URL, currentQuery]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "rounded-sm w-9 cursor-pointer !bg-logo-main !text-white",
              isQuestionViewDisabled && "opacity-50"
            )}
            onClick={() => {
              if (isQuestionViewDisabled) {
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
          {isQuestionViewDisabled ? (
            <> To share filter, run a search first.</>
          ) : (
            <>Share filter</>
          )}
        </TooltipContent>
      </Tooltip>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex flex-col items-center justify-center gap-2 w-full p-4 dark:bg-accent">
          <DialogTitle className="sr-only">QR Code</DialogTitle>
          <QRCodeCanvas
            className="rounded-md w-full h-full min-h-[300px] min-w-[300px]"
            ref={qrRef}
            value={typeof window != "undefined" ? url : ""}
            title={"Noteoverflow"}
            size={300}
            marginSize={2}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            imageSettings={{
              src: "/assets/logo-bg-colorised-modified-small.webp",
              x: undefined,
              y: undefined,
              height: 32,
              width: 32,
              opacity: 1,
              excavate: true,
            }}
          />
          <Button
            className="flex items-center w-full gap-2 mt-3 rounded-sm cursor-pointer active:opacity-80"
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
