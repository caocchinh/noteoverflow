import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { SelectedQuestion } from "../constants/types";
import {
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Eye,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

interface ExportReviewDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  questionsForExport: Set<string>;
  setQuestionsForExport: Dispatch<SetStateAction<Set<string>>>;
  allQuestions: SelectedQuestion[];
}

const QuestionCard = memo(
  ({
    question,
    isSelected,
    onToggle,
    isExpanded,
    onExpandToggle,
  }: {
    question: SelectedQuestion;
    isSelected: boolean;
    onToggle: () => void;
    isExpanded: boolean;
    onExpandToggle: () => void;
  }) => {
    const questionNumber = question.id.split("-").pop() || "1";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer",
          "hover:shadow-lg hover:shadow-primary/5",
          isSelected
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-border hover:border-primary/50 bg-card"
        )}
        onClick={onToggle}
      >
        {/* Selection indicator glow */}
        {isSelected && (
          <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        )}

        <div className="relative flex items-start gap-4">
          {/* Checkbox with animation */}
          <div className="shrink-0 mt-1">
            <div
              className={cn(
                "relative flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
              )}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Question info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge
                variant="secondary"
                className="bg-logo-main text-white font-semibold"
              >
                Q{questionNumber}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <CalendarDays className="h-3 w-3 mr-1" />
                {question.season} {question.year}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                Paper {question.paperType}
              </Badge>
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {question.topics?.slice(0, 3).map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="text-xs font-normal bg-secondary/50"
                >
                  {topic}
                </Badge>
              ))}
              {question.topics && question.topics.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{question.topics.length - 3} more
                </Badge>
              )}
            </div>

            {/* Expandable preview section */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {question.questionImages?.slice(0, 2).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-4/3 rounded-lg overflow-hidden bg-muted border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Question preview ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Expand button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.div>
    );
  }
);

QuestionCard.displayName = "QuestionCard";

const ExportReviewDialog = memo(
  ({
    isOpen,
    setIsOpen,
    questionsForExport,
    setQuestionsForExport,
    allQuestions,
  }: ExportReviewDialogProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [filterMode, setFilterMode] = useState<
      "all" | "selected" | "unselected"
    >("all");

    const filteredQuestions = useMemo(() => {
      let filtered = allQuestions;

      // Apply filter mode
      if (filterMode === "selected") {
        filtered = filtered.filter((q) => questionsForExport.has(q.id));
      } else if (filterMode === "unselected") {
        filtered = filtered.filter((q) => !questionsForExport.has(q.id));
      }

      // Apply search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (q) =>
            q.id.toLowerCase().includes(query) ||
            q.topics?.some((t) => t.toLowerCase().includes(query)) ||
            q.year.toString().includes(query) ||
            q.season.toLowerCase().includes(query)
        );
      }

      return filtered;
    }, [allQuestions, questionsForExport, searchQuery, filterMode]);

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
      },
      [setQuestionsForExport]
    );

    const toggleExpand = useCallback((questionId: string) => {
      setExpandedCards((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
    }, []);

    const selectAll = useCallback(() => {
      setQuestionsForExport(new Set(filteredQuestions.map((q) => q.id)));
    }, [filteredQuestions, setQuestionsForExport]);

    const deselectAll = useCallback(() => {
      setQuestionsForExport(new Set());
    }, [setQuestionsForExport]);

    const handleExport = useCallback(() => {
      console.log("Exporting:", Array.from(questionsForExport));
    }, [questionsForExport]);

    const selectionPercentage = useMemo(() => {
      if (allQuestions.length === 0) return 0;
      return Math.round((questionsForExport.size / allQuestions.length) * 100);
    }, [questionsForExport.size, allQuestions.length]);

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          {/* Header with gradient */}
          <div className="relative px-6 pt-6 pb-4 bg-linear-to-br from-background via-background to-primary/5">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    Export Review
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Review and customize your question selection before
                    exporting
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                {questionsForExport.size} selected
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>of</span>
                <span className="font-semibold">{allQuestions.length}</span>
                <span>questions</span>
              </div>
              {/* Progress bar */}
              <div className="flex-1 min-w-[120px] max-w-[200px]">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectionPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {selectionPercentage}%
              </span>
            </div>
          </div>

          <Separator />

          {/* Search and filter bar */}
          <div className="px-6 py-4 flex flex-wrap gap-3 bg-muted/30">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by topic, year, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              {(["all", "selected", "unselected"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={filterMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode(mode)}
                  className={cn(
                    "capitalize cursor-pointer",
                    filterMode === mode && "bg-logo-main hover:bg-logo-main/90"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  {mode}
                </Button>
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
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
                Clear
              </Button>
            </div>
          </div>

          {/* Questions list */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isSelected={questionsForExport.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                    isExpanded={expandedCards.has(question.id)}
                    onExpandToggle={() => toggleExpand(question.id)}
                  />
                ))}
              </AnimatePresence>

              {filteredQuestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium">No questions found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-muted/30">
            <div className="flex items-center justify-between w-full gap-4">
              <p className="text-sm text-muted-foreground">
                {questionsForExport.size === 0 ? (
                  "Select at least one question to export"
                ) : (
                  <>
                    Ready to export{" "}
                    <span className="font-semibold text-foreground">
                      {questionsForExport.size}
                    </span>{" "}
                    question{questionsForExport.size !== 1 && "s"}
                  </>
                )}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={questionsForExport.size === 0}
                  className="cursor-pointer bg-logo-main hover:bg-logo-main/90 text-white gap-2 min-w-[120px]"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ExportReviewDialog.displayName = "ExportReviewDialog";

export default ExportReviewDialog;
