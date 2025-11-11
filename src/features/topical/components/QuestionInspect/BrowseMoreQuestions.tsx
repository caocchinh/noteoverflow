import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import QuestionPreview from "../QuestionPreview";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  COLUMN_BREAKPOINTS,
  MANSONRY_GUTTER_BREAKPOINTS,
} from "../../constants/constants";
import { BrowseMoreQuestionsProps } from "../../constants/types";
import { Button } from "@/components/ui/button";
import { memo, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const BrowseMoreQuestions = memo(
  ({
    browseMoreData,
    onQuestionClick,
    isBrowseMoreOpen,
    setIsBrowseMoreOpen,
  }: BrowseMoreQuestionsProps) => {
    const expandedContentRef = useRef<HTMLDivElement>(null);
    return (
      <Collapsible open={isBrowseMoreOpen} onOpenChange={setIsBrowseMoreOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setTimeout(() => {
                if (!isBrowseMoreOpen) {
                  expandedContentRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }, 50);
            }}
            className="w-full mb-4 mt-2 cursor-pointer rounded-none !bg-accent border-logo-main/30 sticky top-0 z-10"
          >
            <span className="flex items-center gap-2">
              Browse more questions
              {isBrowseMoreOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent
          ref={expandedContentRef}
          className="relative z-0 pt-10"
        >
          <ResponsiveMasonry
            columnsCountBreakPoints={
              COLUMN_BREAKPOINTS[2 as keyof typeof COLUMN_BREAKPOINTS]
            }
            // @ts-expect-error - gutterBreakPoints is not typed by the library
            gutterBreakPoints={MANSONRY_GUTTER_BREAKPOINTS}
          >
            <Masonry>
              {browseMoreData?.map((question) =>
                question?.questionImages.map((imageSrc: string) => (
                  <QuestionPreview
                    question={question}
                    key={`${question.id}-${imageSrc}`}
                    imageSrc={imageSrc}
                    onQuestionClick={() => {
                      onQuestionClick(question?.id);
                    }}
                  />
                ))
              )}
            </Masonry>
          </ResponsiveMasonry>
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

BrowseMoreQuestions.displayName = "BrowseMoreQuestions";

export default BrowseMoreQuestions;
