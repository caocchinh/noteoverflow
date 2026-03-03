import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Download, Link as LinkIcon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

export const QR = ({
  isOpen,
  setIsOpen,
  url,
  type = "filter",
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  url: string;
  type?: "filter" | "bookmark" | "question" | "search result";
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { setIsCalculatorOpen, isCalculatorOpen } = useTopicalApp();

  useEffect(() => {
    if (isOpen) {
      if (isCalculatorOpen) {
        setIsCalculatorOpen(false);
      }
    }
  }, [isOpen, isCalculatorOpen, setIsCalculatorOpen]);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
      }}
    >
      <DialogContent
        className="dark:bg-accent z-9999999 flex w-full flex-col items-center justify-center gap-2 p-4"
        overlayClassName="z-[999998]"
      >
        <DialogTitle className="sr-only">QR Code</DialogTitle>
        <DialogDescription>Share the {type} with your friends!</DialogDescription>
        <QRCodeCanvas
          ref={canvasRef}
          className="h-full min-h-[300px] w-full min-w-[300px] rounded-md"
          value={typeof window != "undefined" ? url : ""}
          title={"Noteoverflow"}
          size={300}
          marginSize={2}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"Q"}
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
          className="mt-3 flex w-full cursor-pointer items-center gap-2 rounded-sm active:opacity-80"
          onClick={() => {
            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const link = document.createElement("a");
              link.href = canvas.toDataURL();
              link.download = "Noteoverflow.jpg";
              link.click();
            }
          }}
        >
          Download QR code
          <Download />
        </Button>
        <Button
          className="bg-logo-main! flex w-full cursor-pointer items-center gap-2 rounded-sm text-white! active:opacity-80"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 2000);
          }}
        >
          {copied ? "Copied" : "Copy link"}
          <LinkIcon />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
