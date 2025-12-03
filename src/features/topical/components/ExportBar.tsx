import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { SelectedQuestion } from "../constants/types";
import { ArrowRightFromLine, Eraser, WandSparkles } from "lucide-react";

const ExportBar = ({
  questionsForExport,
  allQuestions,
  setIsExportModeEnabled,
  setQuestionsForExport,
}: {
  questionsForExport: string[];
  allQuestions: SelectedQuestion[];
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  setQuestionsForExport: Dispatch<SetStateAction<string[]>>;
}) => {
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const useAllQuestions = useCallback(() => {
    setQuestionsForExport(allQuestions.map((question) => question.id));
  }, [allQuestions, setQuestionsForExport]);

  const useNoQuestions = useCallback(() => {
    setQuestionsForExport([]);
  }, [setQuestionsForExport]);

  return (
    <div className="fixed w-max z-1000 h-[50px] left-1/2 -translate-x-1/2 bottom-[12px] rounded-md bg-white dark:bg-accent border-black dark:border-white border p-2 flex flex-row gap-2">
      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="cursor-pointer">
            Exit
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Leave export mode?</DialogTitle>
            <DialogDescription>
              You&apos;ll lose your current export selection. Are you sure you
              want to exit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsExitDialogOpen(false)}
            >
              Stay
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                setIsExportModeEnabled(false);
                setQuestionsForExport([]);
                setIsExitDialogOpen(false);
              }}
            >
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        className="cursor-pointer"
        variant="outline"
        onClick={useAllQuestions}
      >
        Select all
        <WandSparkles />
      </Button>
      <Button
        className="cursor-pointer"
        variant="outline"
        onClick={useNoQuestions}
      >
        Deselect all
        <Eraser />
      </Button>

      <Button
        className="cursor-pointer bg-logo-main! text-white!"
        variant="outline"
      >
        Preview export
        <ArrowRightFromLine />
      </Button>
    </div>
  );
};

export default ExportBar;
