import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { forwardRef, memo, useImperativeHandle, useState } from "react";
import { createPortal } from "react-dom";

export interface ExportProgressDialogHandle {
  setProgress: (current: number, total: number) => void;
  close: () => void;
}

const ExportProgressDialog = memo(
  forwardRef<ExportProgressDialogHandle>((_, ref) => {
    const [progress, setProgressState] = useState<{
      current: number;
      total: number;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      setProgress: (current: number, total: number) => {
        setProgressState({ current, total });
      },
      close: () => {
        setProgressState(null);
      },
    }));

    const isFinishedProcessing = progress?.current === progress?.total;

    return (
      <Dialog open={!!progress}>
        {!!progress && (
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
                Please wait while we prepare your document. This may take a few
                moments.
              </DialogDescription>
            )}
          </DialogHeader>
          {!isFinishedProcessing ? (
            <div className="flex flex-col gap-4 py-4">
              <Progress
                value={
                  ((progress?.current || 0) / (progress?.total || 1)) * 100
                }
                className="h-2"
              />
              <p className="text-sm text-center text-muted-foreground">
                Processed {progress?.current} of {progress?.total} questions
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-red-500">
              Putting everything together, please wait. The more you export, the
              longer this gonna take!
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  })
);

ExportProgressDialog.displayName = "ExportProgressDialog";

export default ExportProgressDialog;
