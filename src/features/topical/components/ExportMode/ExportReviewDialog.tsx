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
import { memo, useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  Download,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ExportReviewDialogProps,
  SelectedQuestion,
} from "../../constants/types";
import {
  extractPaperCode,
  extractQuestionNumber,
  fuzzySearch,
  handleDownloadPdf,
} from "../../lib/utils";
import {
  generateMultipleQuestionsPdfBlob,
  PdfContentType,
} from "../../lib/generatePdfBlob";
import SelectList from "./SelectList";
import SortUtil from "./SortUtil";
import Preview from "./Preview";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import ExportProgressDialog, {
  ExportProgressDialogHandle,
} from "./ExportProgressDialog";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = memo(({ value, onChange }: SearchInputProps) => {
  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by topic, year, or ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 pl-10 pr-10 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
      {value && (
        <div
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";

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
        const query = searchQuery.trim();
        return baseQuestions.filter(
          (q) =>
            fuzzySearch(
              query,
              extractPaperCode({ questionId: q.id }) + extractQuestionNumber
            ) ||
            q.topics?.some((t) => fuzzySearch(query, t)) ||
            fuzzySearch(query, q.year.toString()) ||
            fuzzySearch(query, q.season)
        );
      }

      return baseQuestions;
    }, [allQuestions, questionsForExport, searchQuery, filterMode]);
    const canReorder = useMemo(
      () => searchQuery.trim() === "" && filterMode === "selected",
      [searchQuery, filterMode]
    );
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const [isExportModeOpen, setIsExportModeOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportProgressDialogRef = useRef<ExportProgressDialogHandle>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isExporting) {
          e.preventDefault();
        }
      };

      if (isExporting) {
        window.addEventListener("beforeunload", handleBeforeUnload);
      }

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [isExporting]);

    const toggleQuestion = useCallback(
      (questionId: string) => {
        if (currentlyPreviewQuestion === questionId) {
          setCurrentlyPreviewQuestion(null);
        }
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
      [
        currentlyPreviewQuestion,
        setQuestionsForExport,
        setQuestionsForExportArray,
      ]
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

    const handleExport = useCallback(
      async (mode: PdfContentType) => {
        if (questionsForExportArray.length === 0) return;
        setIsExportModeOpen(false);

        setIsExporting(true);
        abortControllerRef.current = new AbortController();

        exportProgressDialogRef.current?.start(
          questionsForExportArray.length,
          mode
        );

        try {
          const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
          const orderedQuestions: SelectedQuestion[] = [];
          for (const id of questionsForExportArray) {
            const question = questionMap.get(id);
            if (question) {
              orderedQuestions.push(question);
            }
          }

          const blob = await generateMultipleQuestionsPdfBlob({
            questions: orderedQuestions,
            typeOfContent: mode,
            onProgress: (current) => {
              exportProgressDialogRef.current?.setProgress(current);
            },
            signal: abortControllerRef.current.signal,
          });

          if (blob) {
            handleDownloadPdf(
              blob,
              `NoteOverflow_Export_${orderedQuestions.length}.pdf`
            );
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            console.log("Export cancelled");
          } else {
            console.error("Error exporting PDF:", error);
          }
        } finally {
          setIsExporting(false);
          setIsExportModeOpen(false);
          exportProgressDialogRef.current?.close();
          abortControllerRef.current = null;
        }
      },
      [questionsForExportArray, allQuestions]
    );

    const progressPercentage = useMemo(() => {
      if (allQuestions.length === 0) return 0;
      return (questionsForExport.size / allQuestions.length) * 100;
    }, [questionsForExport.size, allQuestions.length]);

    const handleInteractOutside = useCallback(
      (e: Event) => {
        if (isMobilePreviewOpen || isExportModeOpen || isExporting) {
          e.preventDefault();
          return;
        }
        const targetElement = e.target as Element;
        if (
          targetElement?.closest(".PhotoView-Portal") ||
          targetElement?.closest(".export-mode-content") ||
          targetElement?.closest(".mobile-preview-content")
        ) {
          e.preventDefault();
          return;
        }
      },
      [isExportModeOpen, isExporting, isMobilePreviewOpen]
    );

    return (
      <>
        {isOpen && (
          <>
            {createPortal(
              <div className="fixed inset-0 z-100009 bg-black/50" />,
              document.body
            )}
          </>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
          <DialogContent
            className="w-[95vw] h-[94dvh] max-w-screen! z-100010 dark:bg-accent gap-2"
            showCloseButton={false}
            onInteractOutside={handleInteractOutside}
            onOpenAutoFocus={(e) => e.preventDefault()}
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
              <SearchInput value={searchQuery} onChange={setSearchQuery} />

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
                setIsMobilePreviewOpen={setIsMobilePreviewOpen}
              />
              <div className="hidden lg:block w-[60%]">
                <Preview previewQuestionData={previewQuestionData} />
              </div>
            </div>
            <DialogFooter className="w-full flex-row! gap-2 flex-wrap">
              <Button
                className="cursor-pointer flex-1"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isExporting}
              >
                Close
              </Button>
              <Button
                onClick={() => setIsExportModeOpen(true)}
                disabled={questionsForExport.size === 0 || isExporting}
                className="cursor-pointer flex-1 bg-logo-main hover:bg-logo-main/90 text-white gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export {questionsForExport.size} question
                    {questionsForExport.size !== 1 && "s"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isExportModeOpen}
          onOpenChange={setIsExportModeOpen}
          modal={false}
        >
          {isExportModeOpen && (
            <>
              {createPortal(
                <div className="fixed inset-0 z-1000014 bg-black/50" />,
                document.body
              )}
            </>
          )}
          <DialogContent className="w-[300px] z-1000015 gap-4 export-mode-content">
            <DialogHeader>
              <DialogTitle>Select Export Mode</DialogTitle>
              <DialogDescription>
                Choose what content you want to include in the PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              {(
                [
                  { value: "question", label: "Questions Only" },
                  { value: "answer", label: "Answers Only" },
                  {
                    value: "question-with-answers",
                    label: "Questions and answers",
                  },
                ] as const
              ).map((mode) => (
                <Button
                  key={mode.value}
                  variant="outline"
                  className="justify-start w-full cursor-pointer hover:bg-accent"
                  onClick={() => handleExport(mode.value)}
                  disabled={isExporting}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => setIsExportModeOpen(false)}
                className="w-full cursor-pointer"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ExportProgressDialog
          ref={exportProgressDialogRef}
          onCancel={() => abortControllerRef.current?.abort()}
        />
        <Dialog
          open={isMobilePreviewOpen}
          onOpenChange={setIsMobilePreviewOpen}
          modal={false}
        >
          <DialogContent className="w-[95vw] h-[94dvh] max-w-screen! z-100010 dark:bg-accent gap-2 mobile-preview-content">
            <DialogHeader className="flex flex-row items-start justify-between flex-wrap gap-2">
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <Preview previewQuestionData={previewQuestionData} />
            <DialogFooter className="w-full flex-row! gap-2">
              <Button
                className="cursor-pointer flex-1"
                variant="outline"
                onClick={() => setIsMobilePreviewOpen(false)}
              >
                Close preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ExportReviewDialog.displayName = "ExportReviewDialog";

export default ExportReviewDialog;
