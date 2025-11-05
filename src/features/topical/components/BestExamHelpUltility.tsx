import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ScrollText,
  PencilLine,
  FileText,
  Highlighter,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectedQuestion } from "../constants/types";
import { ValidSeason } from "@/constants/types";
import { parsePastPaperUrl } from "../lib/utils";

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
        "w-full h-full flex items-center",
        question.year === UNSUPPORTED_YEAR && "pointer-events-none"
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

export const PastPaperDropdown = ({
  question,
}: {
  question: SelectedQuestion | undefined;
}) => {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-9 h-9 cursor-pointer !p-0",
                question?.year === UNSUPPORTED_YEAR && "opacity-50 "
              )}
            >
              <FileText />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="z-[99999999]" side="bottom">
          {question?.year === UNSUPPORTED_YEAR
            ? "Only supported year 2010 and above"
            : "Resources"}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="z-[99999999] p-3 bg-accent">
        <DropdownMenuItem
          disabled={question?.year === UNSUPPORTED_YEAR}
          asChild
        >
          <PastPaperLink question={question} type="qp">
            <ScrollText className="mr-2 h-4 w-4" />
            <span>
              {question?.year === UNSUPPORTED_YEAR
                ? "Only supported year 2010 and above"
                : "View entire paper"}
            </span>
          </PastPaperLink>
        </DropdownMenuItem>
        <Separator className="my-1" />
        <DropdownMenuItem
          disabled={question?.year === UNSUPPORTED_YEAR}
          asChild
        >
          <PastPaperLink question={question} type="ms">
            <PencilLine className="mr-2 h-4 w-4" />
            <span>
              {question?.year === UNSUPPORTED_YEAR
                ? "Only supported year 2010 and above"
                : "View entire mark scheme"}
            </span>
          </PastPaperLink>
        </DropdownMenuItem>
        <Separator className="my-1" />
        <DropdownMenuItem
          disabled={question?.year === UNSUPPORTED_YEAR}
          asChild
        >
          <PastPaperLink question={question} type="er">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>
              {question?.year === UNSUPPORTED_YEAR
                ? "Only supported year 2010 and above"
                : "View examiner's report"}
            </span>
          </PastPaperLink>
        </DropdownMenuItem>
        <Separator className="my-1" />
        <DropdownMenuItem
          disabled={question?.year === UNSUPPORTED_YEAR}
          asChild
        >
          <PastPaperLink question={question} type="gt">
            <Highlighter className="mr-2 h-4 w-4" />
            <span>
              {question?.year === UNSUPPORTED_YEAR
                ? "Only supported year 2010 and above"
                : "View grade threshold"}
            </span>
          </PastPaperLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
