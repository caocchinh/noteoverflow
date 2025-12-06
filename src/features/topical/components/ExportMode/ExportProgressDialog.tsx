import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { forwardRef, memo, useImperativeHandle, useState } from "react";
import { createPortal } from "react-dom";
import { PdfContentType } from "../../lib/generatePdfBlob";

export interface ExportProgressDialogHandle {
  start: (total: number, mode: PdfContentType) => void;
  setProgress: (current: number) => void;
  close: () => void;
}

interface ExportProgressDialogProps {
  onCancel: () => void;
}

const MODE_LABELS: Record<PdfContentType, string> = {
  question: "Questions Only",
  answer: "Answers Only",
  "question-with-answers": "Questions and Answers",
};

const ExportProgressDialog = memo(
  forwardRef<ExportProgressDialogHandle, ExportProgressDialogProps>(
    ({ onCancel }, ref) => {
      const [state, setState] = useState<{
        current: number;
        total: number;
        mode: PdfContentType;
      } | null>(null);

      useImperativeHandle(ref, () => ({
        start: (total: number, mode: PdfContentType) => {
          setState({ current: 0, total, mode });
        },
        setProgress: (current: number) => {
          setState((prev) => (prev ? { ...prev, current } : null));
        },
        close: () => {
          setState(null);
        },
      }));

      const isFinishedProcessing = state?.current === state?.total;

      return (
        <Dialog open={!!state}>
          {!!state && (
            <>
              {createPortal(
                <div className="fixed inset-0 z-100015 bg-black/50" />,
                document.body
              )}
            </>
          )}
          <DialogContent
            className="sm:max-w-[425px] z-100020"
            showCloseButton={false}
          >
            <DialogHeader>
              <DialogTitle>Generating PDF...</DialogTitle>
              {!isFinishedProcessing && (
                <DialogDescription>
                  Exporting {MODE_LABELS[state?.mode || "question"]}
                </DialogDescription>
              )}
            </DialogHeader>
            {!isFinishedProcessing ? (
              <div className="flex flex-col gap-4 py-4">
                <Progress
                  value={((state?.current || 0) / (state?.total || 1)) * 100}
                  className="h-2"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Processed {state?.current} of {state?.total} questions
                </p>
              </div>
            ) : (
              <div className="text-center text-sm text-red-500 py-4">
                Putting everything together, please wait. The more you export,
                the longer this gonna take!
              </div>
            )}
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={onCancel}
                className="w-full sm:w-auto cursor-pointer"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
  )
);

ExportProgressDialog.displayName = "ExportProgressDialog";

export default ExportProgressDialog;
