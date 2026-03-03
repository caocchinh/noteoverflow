import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, Download, Loader2, Search, X, XCircle } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { generateMultipleQuestionsDocxBlob } from "../../lib/generateDocxBlob";
import { generateMultipleQuestionsPdfBlob, PdfContentType } from "../../lib/generatePdfBlob";
import {
  extractPaperCode,
  extractQuestionNumber,
  fuzzySearch,
  handleDownloadPdf,
} from "../../lib/utils";
import { ExportReviewDialogProps } from "../../types/components";
import { SelectedQuestion } from "../../types/models";
import ExportFormatSelector, { ExportFormatSelectorHandle } from "./ExportFormatSelector";
import ExportProgressDialog, { ExportProgressDialogHandle } from "./ExportProgressDialog";
import Preview from "./Preview";
import SelectList from "./SelectList";
import SortUtil from "./SortUtil";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = memo(({ value, onChange }: SearchInputProps) => {
  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Search by topic, year, or ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background focus:ring-primary/50 h-9 w-full rounded-md border pr-10 pl-10 text-sm transition-all focus:ring-2 focus:outline-none"
      />
      {value && (
        <div
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer transition-colors"
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
    const [currentlyPreviewQuestion, setCurrentlyPreviewQuestion] = useState<string | null>(null);
    const previewQuestionData = useMemo(() => {
      return currentlyPreviewQuestion
        ? allQuestions.find((q) => q.id === currentlyPreviewQuestion)
        : undefined;
    }, [allQuestions, currentlyPreviewQuestion]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<"selected" | "not selected">("selected");
    const filteredQuestions = useMemo(() => {
      let baseQuestions = allQuestions;
      if (filterMode === "not selected") {
        baseQuestions = allQuestions.filter((q) => !questionsForExport.has(q.id));
      } else {
        baseQuestions = allQuestions.filter((q) => questionsForExport.has(q.id));
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        return baseQuestions.filter(
          (q) =>
            fuzzySearch(query, extractPaperCode({ questionId: q.id }) + extractQuestionNumber) ||
            q.topics?.some((t) => fuzzySearch(query, t)) ||
            fuzzySearch(query, q.year.toString()) ||
            fuzzySearch(query, q.season),
        );
      }

      return baseQuestions;
    }, [allQuestions, questionsForExport, searchQuery, filterMode]);
    const canReorder = useMemo(
      () => searchQuery.trim() === "" && filterMode === "selected",
      [searchQuery, filterMode],
    );
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const [isExportModeOpen, setIsExportModeOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportProgressDialogRef = useRef<ExportProgressDialogHandle>(null);
    const exportFormatSelectorRef = useRef<ExportFormatSelectorHandle>(null);
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
      [currentlyPreviewQuestion, setQuestionsForExport, setQuestionsForExportArray],
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
        const questionYearMap = new Map(allQuestions.map((q) => [q.id, q.year]));

        setQuestionsForExportArray((prev) => {
          const sorted = [...prev].sort((a, b) => {
            const yearA = questionYearMap.get(a) ?? 0;
            const yearB = questionYearMap.get(b) ?? 0;
            return order === "ascending" ? yearA - yearB : yearB - yearA;
          });
          return sorted;
        });
      },
      [allQuestions, setQuestionsForExportArray],
    );

    const handleExport = useCallback(
      async (mode: PdfContentType) => {
        if (questionsForExportArray.length === 0) return;
        setIsExportModeOpen(false);

        setIsExporting(true);
        abortControllerRef.current = new AbortController();

        exportProgressDialogRef.current?.start(questionsForExportArray.length, mode);

        try {
          const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
          const orderedQuestions: SelectedQuestion[] = [];
          for (const id of questionsForExportArray) {
            const question = questionMap.get(id);
            if (question) {
              orderedQuestions.push(question);
            }
          }

          let blob: Blob | null = null;
          let fileName = "";

          const currentFormat = exportFormatSelectorRef.current?.getFormat() || "pdf";

          if (currentFormat === "pdf") {
            blob = await generateMultipleQuestionsPdfBlob({
              questions: orderedQuestions,
              typeOfContent: mode,
              onProgress: (current) => {
                exportProgressDialogRef.current?.setProgress(current);
              },
              signal: abortControllerRef.current.signal,
            });
            fileName = `NoteOverflow_Export_${orderedQuestions.length}.pdf`;
          } else {
            blob = await generateMultipleQuestionsDocxBlob({
              questions: orderedQuestions,
              typeOfContent: mode,
              onProgress: (current) => {
                exportProgressDialogRef.current?.setProgress(current);
              },
              signal: abortControllerRef.current.signal,
            });
            fileName = `NoteOverflow_Export_${orderedQuestions.length}.docx`;
          }

          if (blob) {
            handleDownloadPdf(blob, fileName);
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
      [questionsForExportArray, allQuestions],
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
      [isExportModeOpen, isExporting, isMobilePreviewOpen],
    );

    return (
      <>
        {isOpen && (
          <>{createPortal(<div className="fixed inset-0 z-100009 bg-black/50" />, document.body)}</>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
          <DialogContent
            className="dark:bg-accent z-100010 h-[94dvh] w-[95vw] max-w-screen! gap-2"
            showCloseButton={false}
            onInteractOutside={handleInteractOutside}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col flex-wrap items-start justify-start gap-0">
                <DialogTitle>{questionsForExport.size} questions selected for export</DialogTitle>
                <DialogDescription className="text-md sr-only">
                  Review and customize your selection before exporting
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="bg-logo-main flex items-center gap-3 rounded-md p-2">
              <div className="flex-1">
                <Progress
                  value={progressPercentage}
                  className="h-3 bg-gray-200 [&>div]:bg-[#0084ff] [&>div]:bg-[repeating-linear-gradient(45deg,#0084ff,#0084ff_4px,#0066cc_4px,#0066cc_8px)]"
                />
              </div>
              <span className="text-sm font-medium whitespace-nowrap text-white">
                {questionsForExport.size} / {allQuestions.length} selected
                <span className="ml-1 text-xs text-white/80">
                  ({Math.round(progressPercentage)}%)
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />

              <div className="bg-input/80 flex items-center gap-0 rounded-md p-[3px]">
                {(["selected", "not selected"] as const).map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={cn(
                      "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-3 py-1 text-black capitalize dark:bg-transparent",
                      filterMode === mode &&
                        "border-input dark:bg-input/30 bg-white hover:bg-white dark:text-white",
                    )}
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={selectAll} className="cursor-pointer">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Select all
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="cursor-pointer">
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Clear selection
              </Button>
              <SortUtil sortByYear={sortByYear} />
            </div>
            <div className="flex w-full flex-row gap-2">
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
              <div className="hidden w-[60%] lg:block">
                <Preview previewQuestionData={previewQuestionData} />
              </div>
            </div>
            <DialogFooter className="w-full flex-row! flex-wrap gap-2">
              <Button
                className="flex-1 cursor-pointer"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isExporting}
              >
                Close
              </Button>
              <Button
                onClick={() => setIsExportModeOpen(true)}
                disabled={questionsForExport.size === 0 || isExporting}
                className="bg-logo-main hover:bg-logo-main/90 flex-1 cursor-pointer gap-2 text-white"
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

        <Dialog open={isExportModeOpen} onOpenChange={setIsExportModeOpen} modal={false}>
          {isExportModeOpen && (
            <>
              {createPortal(<div className="fixed inset-0 z-1000014 bg-black/50" />, document.body)}
            </>
          )}
          <DialogContent className="export-mode-content z-1000015 max-w-[430px]! gap-4">
            <DialogHeader>
              <DialogTitle>Select Export Mode</DialogTitle>
              <DialogDescription>
                Choose what content you want to include in the exported file.
              </DialogDescription>
            </DialogHeader>

            <ExportFormatSelector ref={exportFormatSelectorRef} />

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
                  className="hover:bg-accent w-full cursor-pointer justify-start"
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
        <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen} modal={false}>
          <DialogContent className="dark:bg-accent mobile-preview-content z-100010 h-[94dvh] w-[95vw] max-w-screen! gap-2">
            <DialogHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <Preview previewQuestionData={previewQuestionData} />
            <DialogFooter className="w-full flex-row! gap-2">
              <Button
                className="flex-1 cursor-pointer"
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
  },
);

ExportReviewDialog.displayName = "ExportReviewDialog";

export default ExportReviewDialog;
