import { useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Link as LinkIcon } from "lucide-react";

export const QR = ({
  isOpen,
  setIsOpen,
  url,
  type = "filter",
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  url: string;
  type?: "filter" | "bookmark" | "question";
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        console.log("value", value);
        setIsOpen(value);
      }}
    >
      <DialogContent
        className="flex flex-col items-center justify-center gap-2 w-full p-4 dark:bg-accent z-[9999999]"
        overlayClassName="z-[999998]"
      >
        <DialogTitle className="sr-only">QR Code</DialogTitle>
        <DialogDescription>
          Share the {type} with your friends!
        </DialogDescription>
        <QRCodeCanvas
          ref={canvasRef}
          className="rounded-md w-full h-full min-h-[300px] min-w-[300px]"
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
          className="flex items-center w-full gap-2 mt-3 rounded-sm cursor-pointer active:opacity-80"
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
          className="flex items-center w-full gap-2 !bg-logo-main !text-white rounded-sm cursor-pointer active:opacity-80"
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
