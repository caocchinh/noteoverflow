import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { memo } from "react";
import Loader from "../Loader/Loader";

const QuestionAnnotationGuardDialog = memo(({ isOpen }: { isOpen: boolean }) => {
  return (
    <AlertDialog open={isOpen}>
      {isOpen && <div className="fixed inset-0 z-100012 bg-black/50" />}

      <AlertDialogContent className="bg-background/95 z-100013 flex w-full max-w-[320px] flex-col items-center justify-center gap-6 rounded-2xl border-none p-8 shadow-2xl backdrop-blur-sm">
        <AlertDialogTitle className="sr-only">Saving annotations</AlertDialogTitle>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-lg font-semibold tracking-tight">Saving Changes</p>
          <Loader />
          <p className="text-muted-foreground mt-2 text-sm">
            Syncing your annotations to the database. Your annotations are periodically autosave to
            the database. All questions that are annotated will be automatically saved to &quot;Your
            annotations&quot; private bookmark list.
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
});

QuestionAnnotationGuardDialog.displayName = "QuestionAnnotationGuardDialog";

export default QuestionAnnotationGuardDialog;
