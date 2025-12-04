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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Dispatch, memo, SetStateAction, useCallback, useState } from "react";
import { SelectedQuestion } from "../constants/types";
import {
  ArrowRightFromLine,
  Eraser,
  Menu,
  WandSparkles,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExportBarButtonsProps {
  isExitDialogOpen: boolean;
  setIsExitDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  setQuestionsForExport: Dispatch<SetStateAction<Set<string>>>;
  useAllQuestions: () => void;
  useNoQuestions: () => void;
}

const ExportBarButtons = memo(
  ({
    isExitDialogOpen,
    setIsExitDialogOpen,
    setIsExportModeEnabled,
    setQuestionsForExport,
    useAllQuestions,
    useNoQuestions,
  }: ExportBarButtonsProps) => {
    return (
      <>
        <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="cursor-pointer flex-1">
              Exit
            </Button>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="z-100009"
            overlayClassName="z-100008"
          >
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
                  setQuestionsForExport(new Set());
                  setIsExitDialogOpen(false);
                }}
              >
                Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          className="cursor-pointer flex-1"
          variant="outline"
          onClick={useAllQuestions}
        >
          Select all
          <WandSparkles />
        </Button>
        <Button
          className="cursor-pointer flex-1"
          variant="outline"
          onClick={useNoQuestions}
        >
          Deselect all
          <Eraser />
        </Button>

        <Button
          className="cursor-pointer bg-logo-main! text-white! flex-1"
          variant="outline"
        >
          Preview export
          <ArrowRightFromLine />
        </Button>
      </>
    );
  }
);

ExportBarButtons.displayName = "ExportBarButtons";

const ExportBar = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questionsForExport,
  allQuestions,
  setIsExportModeEnabled,
  setQuestionsForExport,
}: {
  questionsForExport: Set<string>;
  allQuestions: SelectedQuestion[];
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  setQuestionsForExport: Dispatch<SetStateAction<Set<string>>>;
}) => {
  const isMobile = useIsMobile({ breakpoint: 505 });
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const useAllQuestions = useCallback(() => {
    setQuestionsForExport(new Set(allQuestions.map((question) => question.id)));
  }, [allQuestions, setQuestionsForExport]);

  const useNoQuestions = useCallback(() => {
    setQuestionsForExport(new Set());
  }, [setQuestionsForExport]);

  if (isMobile) {
    return (
      <div className="fixed w-max z-1000 h-[50px] left-1/2 -translate-x-1/2 bottom-[12px] rounded-md bg-white dark:bg-accent border-black dark:border-white border p-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="cursor-pointer w-[80vw] h-full"
            >
              <Menu />
              Actions
            </Button>
          </DrawerTrigger>
          <DrawerContent className="z-100007">
            <DrawerHeader className="relative">
              <DrawerTitle>Export Actions</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="flex flex-col gap-3 mt-4 px-4 pb-4">
              <ExportBarButtons
                isExitDialogOpen={isExitDialogOpen}
                setIsExitDialogOpen={setIsExitDialogOpen}
                setIsExportModeEnabled={setIsExportModeEnabled}
                setQuestionsForExport={setQuestionsForExport}
                useAllQuestions={useAllQuestions}
                useNoQuestions={useNoQuestions}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="fixed w-max z-1000 h-[50px] left-1/2 -translate-x-1/2 bottom-[12px] rounded-md bg-white dark:bg-accent border-black dark:border-white border p-2 flex flex-row gap-2">
      <ExportBarButtons
        isExitDialogOpen={isExitDialogOpen}
        setIsExitDialogOpen={setIsExitDialogOpen}
        setIsExportModeEnabled={setIsExportModeEnabled}
        setQuestionsForExport={setQuestionsForExport}
        useAllQuestions={useAllQuestions}
        useNoQuestions={useNoQuestions}
      />
    </div>
  );
};

export default ExportBar;
