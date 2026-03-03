import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ValidSeason } from "@/constants/types";
import { cn } from "@/lib/utils";
import { ClipboardList, FileText, Highlighter, PencilLine, ScrollText } from "lucide-react";
import { memo } from "react";
import { parsePastPaperUrl } from "../lib/utils";
import { SelectedQuestion } from "../types/models";

const UNSUPPORTED_YEAR = 2009;

const PastPaperLink = ({
  question,
  children,
  type,
}: {
  question: SelectedQuestion | undefined;
  children: React.ReactNode;
  type: "qp" | "ms" | "er" | "gt";
}) => {
  if (!question) {
    return null;
  }
  return (
    <a
      target="_blank"
      className={cn(
        "hover:bg-input/90 flex h-full w-full items-center rounded-md p-1",
        question.year === UNSUPPORTED_YEAR && "pointer-events-none",
      )}
      href={
        question.year === UNSUPPORTED_YEAR
          ? ""
          : parsePastPaperUrl({
              questionId: question.id,
              year: question.year.toString(),
              season: question.season as ValidSeason,
              type,
            })
      }
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export const BestExamHelpUltility = memo(
  ({ question }: { question: SelectedQuestion | undefined }) => {
    return (
      <Popover modal={true}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-9 cursor-pointer p-0!",
                  question?.year === UNSUPPORTED_YEAR && "opacity-50",
                )}
              >
                <FileText />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="z-99999999" side="bottom">
            {question?.year === UNSUPPORTED_YEAR
              ? "Only supported year 2010 and above"
              : "Resources"}
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="bg-accent z-99999999 w-max p-3">
          <div className="flex flex-col gap-1">
            <PastPaperLink question={question} type="qp">
              <ScrollText className="mr-2 h-4 w-4" />
              <span>
                {question?.year === UNSUPPORTED_YEAR
                  ? "Only supported year 2010 and above"
                  : "View entire paper"}
              </span>
            </PastPaperLink>
            <Separator className="my-1" />
            <PastPaperLink question={question} type="ms">
              <PencilLine className="mr-2 h-4 w-4" />
              <span>
                {question?.year === UNSUPPORTED_YEAR
                  ? "Only supported year 2010 and above"
                  : "View entire mark scheme"}
              </span>
            </PastPaperLink>
            <Separator className="my-1" />
            <PastPaperLink question={question} type="er">
              <ClipboardList className="mr-2 h-4 w-4" />
              <span>
                {question?.year === UNSUPPORTED_YEAR
                  ? "Only supported year 2010 and above"
                  : "View examiner's report"}
              </span>
            </PastPaperLink>
            <Separator className="my-1" />
            <PastPaperLink question={question} type="gt">
              <Highlighter className="mr-2 h-4 w-4" />
              <span>
                {question?.year === UNSUPPORTED_YEAR
                  ? "Only supported year 2010 and above"
                  : "View grade threshold"}
              </span>
            </PastPaperLink>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
BestExamHelpUltility.displayName = "BestExamHelpUltility";
