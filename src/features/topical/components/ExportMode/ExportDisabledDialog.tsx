"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Download } from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";

interface ExportDisabledDialogProps {
  isQuestionViewDisabled?: boolean;
  buttonClassName?: string;
  variant?: "primary" | "secondary";
}

const ExportDisabledDialog = memo(
  ({
    isQuestionViewDisabled = false,
    buttonClassName,
    variant = "primary",
  }: ExportDisabledDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button
          className={cn(
            variant === "primary"
              ? "bg-logo-main! flex cursor-pointer items-center gap-2 text-white!"
              : "bg-logo-main! cursor-pointer text-white!",
            isQuestionViewDisabled && "cursor-default! opacity-50",
            buttonClassName,
          )}
          onClick={() => {
            if (!isQuestionViewDisabled) {
              setIsOpen(true);
            }
          }}
          variant="outline"
        >
          Export
          <Download />
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Feature Disabled
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 pt-2">
                  <p>
                    The PDF export feature has been disabled due to{" "}
                    <strong>copyright considerations</strong>.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Cambridge Assessment International Education holds the copyright for all
                    examination materials. Reproducing and distributing these materials without
                    explicit permission may constitute copyright infringement.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={() => setIsOpen(false)} className="w-full cursor-pointer">
                I Understand
              </Button>
              <Link
                href="/disclaimer"
                className="text-muted-foreground hover:text-foreground text-center text-sm underline"
                onClick={() => setIsOpen(false)}
              >
                Read full disclaimer
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

ExportDisabledDialog.displayName = "ExportDisabledDialog";

export default ExportDisabledDialog;
