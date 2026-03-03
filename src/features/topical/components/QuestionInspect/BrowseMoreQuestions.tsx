import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { memo, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { usePathname } from "next/navigation";
import { BrowseMoreQuestionsProps } from "../../types/components";
import { JumpToTabButton } from "../JumpToTabButton";
import Masonry from "../Masonry";
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PreviousPageButton,
} from "../PaginationButtons";
import QuestionPreview from "../QuestionPreview";

const BrowseMoreQuestions = memo(
  ({
    partitionedTopicalData,
    onQuestionClick,
    isBrowseMoreOpen,
    setIsBrowseMoreOpen,
  }: BrowseMoreQuestionsProps) => {
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const expandedContentRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const onDataChange = useEffectEvent(() => {
      setCurrentChunkIndex(0);
    });

    useEffect(() => {
      onDataChange();
      if (scrollAreaRef?.current) {
        scrollAreaRef.current.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }
    }, [partitionedTopicalData]);

    const displayedData = useMemo(() => {
      return partitionedTopicalData?.[currentChunkIndex] ?? [];
    }, [partitionedTopicalData, currentChunkIndex]);

    return (
      <Collapsible open={isBrowseMoreOpen} onOpenChange={setIsBrowseMoreOpen}>
        <div className="dark:bg-accent sticky top-0 z-1 mt-[40px] mb-4 flex w-full flex-wrap gap-4 bg-white">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setIsBrowseMoreOpen(!isBrowseMoreOpen);
              setTimeout(() => {
                if (!isBrowseMoreOpen) {
                  expandedContentRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }, 50);
            }}
            className="flex-4 cursor-pointer rounded-none"
          >
            <span className="flex items-center gap-2">
              Browse more questions
              {isBrowseMoreOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </Button>{" "}
          {partitionedTopicalData && isBrowseMoreOpen && partitionedTopicalData.length > 1 && (
            <div className="flex w-max flex-1 flex-row items-center justify-center gap-2">
              <FirstPageButton
                currentChunkIndex={currentChunkIndex}
                setCurrentChunkIndex={setCurrentChunkIndex}
                scrollUpWhenPageChange={true}
                scrollAreaRef={scrollAreaRef}
              />
              <PreviousPageButton
                currentChunkIndex={currentChunkIndex}
                setCurrentChunkIndex={setCurrentChunkIndex}
                scrollUpWhenPageChange={true}
                scrollAreaRef={scrollAreaRef}
              />
              <JumpToTabButton
                className="mx-4"
                tab={currentChunkIndex}
                totalTabs={partitionedTopicalData.length}
                prefix="page"
                onTabChangeCallback={({ tab }) => {
                  setCurrentChunkIndex(tab);
                  if (scrollAreaRef?.current) {
                    scrollAreaRef.current.scrollTo({
                      top: 0,
                      behavior: "instant",
                    });
                  }
                }}
              />
              <NextPageButton
                currentChunkIndex={currentChunkIndex}
                setCurrentChunkIndex={setCurrentChunkIndex}
                totalPages={partitionedTopicalData.length}
                scrollUpWhenPageChange={true}
                scrollAreaRef={scrollAreaRef}
              />
              <LastPageButton
                currentChunkIndex={currentChunkIndex}
                setCurrentChunkIndex={setCurrentChunkIndex}
                totalPages={partitionedTopicalData.length}
                scrollUpWhenPageChange={true}
                scrollAreaRef={scrollAreaRef}
              />
            </div>
          )}
        </div>
        <CollapsibleContent ref={expandedContentRef} className="relative z-0 pt-10">
          <Masonry
            items={displayedData?.flatMap((question) =>
              question?.questionImages.map((imageSrc: string, imageIndex: number) => ({
                element: (
                  <QuestionPreview
                    question={question}
                    key={`${question.id}-${imageSrc}`}
                    imageSrc={imageSrc}
                    onQuestionClick={() => {
                      onQuestionClick(question?.id);
                    }}
                    imageWidth={question.questionImagesDimensions?.[imageIndex]?.width}
                    imageHeight={question.questionImagesDimensions?.[imageIndex]?.height}
                    showCurriculumBadge={pathname == "/search"}
                    showSubjectBadge={pathname == "/search"}
                  />
                ),
                width: question.questionImagesDimensions?.[imageIndex]?.width,
                height: question.questionImagesDimensions?.[imageIndex]?.height,
              })),
            )}
          />
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

BrowseMoreQuestions.displayName = "BrowseMoreQuestions";

export default BrowseMoreQuestions;
