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
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRightFromLine, Eraser, Menu, WandSparkles, X } from "lucide-react";
import { Dispatch, memo, SetStateAction, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { SelectedQuestion } from "../../types/models";
import ExportReviewDialog from "./ExportReviewDialog";

interface ExportBarButtonsProps {
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  setQuestionsForExport: Dispatch<SetStateAction<Set<string>>>;
  setQuestionsForExportArray: Dispatch<SetStateAction<string[]>>;
  questionsForExport: Set<string>;
  questionsForExportArray: string[];
  allQuestions: SelectedQuestion[];
  useAllQuestions: () => void;
  useNoQuestions: () => void;
}

const ExportBarButtons = memo(
  ({
    setIsExportModeEnabled,
    setQuestionsForExport,
    setQuestionsForExportArray,
    questionsForExport,
    questionsForExportArray,
    allQuestions,
    useAllQuestions,
    useNoQuestions,
  }: ExportBarButtonsProps) => {
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    const [isExportReviewOpen, setIsExportReviewOpen] = useState(false);

    const handlePreviewExport = useCallback(() => {
      setIsExportReviewOpen(true);
    }, []);

    return (
      <>
        <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
          <ExitButton />
          <DialogContent showCloseButton={false} className="z-100009" overlayClassName="z-100008">
            <DialogHeader>
              <DialogTitle>Leave export mode?</DialogTitle>
              <DialogDescription>
                You&apos;ll lose your current export selection. Are you sure you want to exit?
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
                  setQuestionsForExportArray([]);
                  setIsExitDialogOpen(false);
                }}
              >
                Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <SelectAllButton useAllQuestions={useAllQuestions} />
        <DeselectAllButton useNoQuestions={useNoQuestions} />

        <PreviewExportButton onClick={handlePreviewExport} />
        <ExportReviewDialog
          isOpen={isExportReviewOpen}
          setIsOpen={setIsExportReviewOpen}
          questionsForExport={questionsForExport}
          questionsForExportArray={questionsForExportArray}
          setQuestionsForExport={setQuestionsForExport}
          setQuestionsForExportArray={setQuestionsForExportArray}
          allQuestions={allQuestions}
        />
      </>
    );
  },
);

ExportBarButtons.displayName = "ExportBarButtons";

const SelectAllButton = memo(({ useAllQuestions }: { useAllQuestions: () => void }) => (
  <Button className="flex-1 cursor-pointer" variant="outline" onClick={useAllQuestions}>
    Select all
    <WandSparkles />
  </Button>
));
SelectAllButton.displayName = "SelectAllButton";

const DeselectAllButton = memo(({ useNoQuestions }: { useNoQuestions: () => void }) => (
  <Button className="flex-1 cursor-pointer" variant="outline" onClick={useNoQuestions}>
    Deselect all
    <Eraser />
  </Button>
));
DeselectAllButton.displayName = "DeselectAllButton";

const PreviewExportButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    className="bg-logo-main! flex-1 cursor-pointer text-white!"
    variant="outline"
    onClick={onClick}
  >
    Preview export
    <ArrowRightFromLine />
  </Button>
));
PreviewExportButton.displayName = "PreviewExportButton";

const ExitButton = memo(() => {
  return (
    <DialogTrigger asChild>
      <Button variant="destructive" className="flex-1 cursor-pointer">
        Exit
      </Button>
    </DialogTrigger>
  );
});

ExitButton.displayName = "ExitButton";

const ExportBar = ({
  useAllQuestions,
  useNoQuestions,
  questionsForExport,
  questionsForExportArray,
  allQuestions,
  setIsExportModeEnabled,
  setQuestionsForExportArray,
  setQuestionsForExport,
}: {
  questionsForExport: Set<string>;
  questionsForExportArray: string[];
  allQuestions: SelectedQuestion[];
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  setQuestionsForExportArray: Dispatch<SetStateAction<string[]>>;
  setQuestionsForExport: Dispatch<SetStateAction<Set<string>>>;
  useAllQuestions: () => void;
  useNoQuestions: () => void;
}) => {
  const isMobile = useIsMobile({ breakpoint: 505 });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="dark:bg-accent fixed bottom-[12px] left-1/2 z-1000 h-[50px] w-max -translate-x-1/2 rounded-md border border-black bg-white p-2 dark:border-white">
        <>
          {isDrawerOpen && (
            <>
              {" "}
              {createPortal(<div className="fixed inset-0 z-100007 bg-black/50" />, document.body)}
            </>
          )}
        </>
        <Drawer modal={false} open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="h-full w-[80vw] cursor-pointer">
              <Menu />
              Export tool bar
            </Button>
          </DrawerTrigger>
          <DrawerContent className="z-100008" onInteractOutside={() => setIsDrawerOpen(false)}>
            <DrawerHeader className="relative">
              <DrawerTitle>Tool bar</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="mt-4 flex flex-col gap-3 px-4 pb-4">
              <ExportBarButtons
                setIsExportModeEnabled={setIsExportModeEnabled}
                setQuestionsForExport={setQuestionsForExport}
                setQuestionsForExportArray={setQuestionsForExportArray}
                questionsForExport={questionsForExport}
                questionsForExportArray={questionsForExportArray}
                allQuestions={allQuestions}
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
    <div className="dark:bg-accent fixed bottom-[12px] left-1/2 z-1000 flex h-[50px] w-max -translate-x-1/2 flex-row gap-2 rounded-md border border-black bg-white p-2 dark:border-white">
      <ExportBarButtons
        setIsExportModeEnabled={setIsExportModeEnabled}
        setQuestionsForExport={setQuestionsForExport}
        setQuestionsForExportArray={setQuestionsForExportArray}
        questionsForExport={questionsForExport}
        questionsForExportArray={questionsForExportArray}
        allQuestions={allQuestions}
        useAllQuestions={useAllQuestions}
        useNoQuestions={useNoQuestions}
      />
    </div>
  );
};

export default ExportBar;
