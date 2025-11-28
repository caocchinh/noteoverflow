import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loader from "../Loader/Loader";

const QuestionAnnotationGuardDialog = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <AlertDialog open={isOpen}>
      {isOpen && <div className="fixed inset-0 z-[100006] bg-black/50" />}

      <AlertDialogContent className="flex flex-col items-center justify-center gap-6 w-full max-w-[320px] p-8 rounded-2xl border-none shadow-2xl bg-background/95 backdrop-blur-sm z-[100007]">
        <AlertDialogTitle className="sr-only">
          Saving annotations
        </AlertDialogTitle>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-lg font-semibold tracking-tight">Saving Changes</p>
          <Loader />
          <p className="text-sm text-muted-foreground mt-2">
            Syncing your annotations to the database
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuestionAnnotationGuardDialog;
