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
import { memo, useCallback, useMemo, useState } from "react";
import { Download, CheckCircle2, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportReviewDialogProps } from "../../constants/types";
import SelectList from "./SelectList";
import SortUtil from "./SortUtil";
import Preview from "./Preview";

const ExportReviewDialog = memo(
  ({
    isOpen,
    setIsOpen,
    questionsForExport,
    questionsForExportArray,
    setQuestionsForExport,
    setQuestionsForExportArray,
    allQuestions,
  }: ExportReviewDialogProps) => {
    const [currentlyPreviewQuestion, setCurrentlyPreviewQuestion] = useState<
      string | null
    >(null);
    const previewQuestionData = useMemo(() => {
      return currentlyPreviewQuestion
        ? allQuestions.find((q) => q.id === currentlyPreviewQuestion)
        : undefined;
    }, [allQuestions, currentlyPreviewQuestion]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<"selected" | "not selected">(
      "selected"
    );
    const filteredQuestions = useMemo(() => {
      let baseQuestions = allQuestions;
      if (filterMode === "not selected") {
        baseQuestions = allQuestions.filter(
          (q) => !questionsForExport.has(q.id)
        );
      } else {
        baseQuestions = allQuestions.filter((q) =>
          questionsForExport.has(q.id)
        );
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return baseQuestions.filter(
          (q) =>
            q.id.toLowerCase().includes(query) ||
            q.topics?.some((t) => t.toLowerCase().includes(query)) ||
            q.year.toString().includes(query) ||
            q.season.toLowerCase().includes(query)
        );
      }

      return baseQuestions;
    }, [allQuestions, questionsForExport, searchQuery, filterMode]);
    const canReorder = useMemo(
      () => searchQuery.trim() === "" && filterMode === "selected",
      [searchQuery, filterMode]
    );

    const toggleQuestion = useCallback(
      (questionId: string) => {
        setQuestionsForExport((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(questionId)) {
            newSet.delete(questionId);
          } else {
            newSet.add(questionId);
          }
          return newSet;
        });
        setQuestionsForExportArray((prev) => {
          if (prev.includes(questionId)) {
            return prev.filter((id) => id !== questionId);
          } else {
            return [...prev, questionId];
          }
        });
      },
      [setQuestionsForExport, setQuestionsForExportArray]
    );

    const selectAll = useCallback(() => {
      const ids = allQuestions.map((q) => q.id);
      setQuestionsForExport(new Set(ids));
      setQuestionsForExportArray(ids);
    }, [allQuestions, setQuestionsForExport, setQuestionsForExportArray]);

    const deselectAll = useCallback(() => {
      setQuestionsForExport(new Set());
      setQuestionsForExportArray([]);
    }, [setQuestionsForExport, setQuestionsForExportArray]);

    const sortByYear = useCallback(
      (order: "ascending" | "descending") => {
        // Create a map for quick lookup of question years
        const questionYearMap = new Map(
          allQuestions.map((q) => [q.id, q.year])
        );

        setQuestionsForExportArray((prev) => {
          const sorted = [...prev].sort((a, b) => {
            const yearA = questionYearMap.get(a) ?? 0;
            const yearB = questionYearMap.get(b) ?? 0;
            return order === "ascending" ? yearA - yearB : yearB - yearA;
          });
          return sorted;
        });
      },
      [allQuestions, setQuestionsForExportArray]
    );

    const handleExport = useCallback(() => {
      console.log("Exporting:", questionsForExportArray);
    }, [questionsForExportArray]);

    const progressPercentage = useMemo(() => {
      if (allQuestions.length === 0) return 0;
      return (questionsForExport.size / allQuestions.length) * 100;
    }, [questionsForExport.size, allQuestions.length]);

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-5xl! h-[95dvh] z-100008 dark:bg-accent gap-2"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-row items-start justify-between flex-wrap gap-2">
            <div className="flex flex-col items-start justify-start flex-wrap gap-0">
              <DialogTitle>
                {questionsForExport.size} questions selected for export
              </DialogTitle>
              <DialogDescription className="text-md sr-only">
                Review and customize your selection before exporting
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex items-center gap-3 p-2 bg-logo-main rounded-md">
            <div className="flex-1">
              <Progress
                value={progressPercentage}
                className="h-3 bg-gray-200 [&>div]:bg-[#0084ff] [&>div]:bg-[repeating-linear-gradient(45deg,#0084ff,#0084ff_4px,#0066cc_4px,#0066cc_8px)]"
              />
            </div>
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {questionsForExport.size} / {allQuestions.length} selected
              <span className="text-xs text-white/80 ml-1">
                ({Math.round(progressPercentage)}%)
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by topic, year, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-0 p-[3px] bg-input/80 rounded-md">
              {(["selected", "not selected"] as const).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={cn(
                    "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-3 bg-input text-black hover:bg-input dark:bg-transparent capitalize",
                    filterMode === mode &&
                      "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30"
                  )}
                >
                  {mode}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Select all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAll}
              className="cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Clear selection
            </Button>
            <SortUtil sortByYear={sortByYear} />
          </div>
          <div className="flex flex-row gap-2 w-full">
            <SelectList
              isOpen={isOpen}
              currentlyPreviewQuestion={currentlyPreviewQuestion}
              canReorder={canReorder}
              questionsForExportArray={questionsForExportArray}
              setQuestionsForExportArray={setQuestionsForExportArray}
              filteredQuestions={filteredQuestions}
              toggleQuestion={toggleQuestion}
              allQuestions={allQuestions}
              setCurrentlyPreviewQuestion={setCurrentlyPreviewQuestion}
              questionsForExport={questionsForExport}
            />
            <Preview previewQuestionData={previewQuestionData} />
          </div>
          <DialogFooter className="w-full flex-row! gap-2">
            <Button
              className="cursor-pointer flex-1"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleExport}
              disabled={questionsForExport.size === 0}
              className="cursor-pointer flex-1 bg-logo-main hover:bg-logo-main/90 text-white gap-2"
            >
              <Download className="h-4 w-4" />
              Export {questionsForExport.size} question
              {questionsForExport.size !== 1 && "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ExportReviewDialog.displayName = "ExportReviewDialog";

export default ExportReviewDialog;
