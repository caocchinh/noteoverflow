import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
  BrowseMoreQuestionsProps,
  SelectedQuestion,
} from "../../constants/types";
import { JumpToTabButton } from "../JumpToTabButton";
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PreviousPageButton,
} from "../PaginationButtons";
import QuestionPreview from "../QuestionPreview";
import Masonry from "../Masonry";

const BrowseMoreQuestions = memo(
  ({
    partitionedTopicalData,
    onQuestionClick,
    isBrowseMoreOpen,
    setIsBrowseMoreOpen,
  }: BrowseMoreQuestionsProps) => {
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);
    const expandedContentRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Update displayed data when partitionedTopicalData changes
    useEffect(() => {
      if (partitionedTopicalData && partitionedTopicalData.length > 0) {
        setDisplayedData(partitionedTopicalData[0] ?? []);
        setCurrentChunkIndex(0);
        if (scrollAreaRef?.current) {
          scrollAreaRef.current.scrollTo({
            top: 0,
            behavior: "instant",
          });
        }
      }
    }, [partitionedTopicalData]);

    return (
      <Collapsible open={isBrowseMoreOpen} onOpenChange={setIsBrowseMoreOpen}>
        <div className="w-full mb-4 mt-[40px] sticky top-0 z-1 flex gap-4 dark:bg-accent bg-white flex-wrap">
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
            className=" cursor-pointer rounded-none flex-4 "
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
          {partitionedTopicalData &&
            isBrowseMoreOpen &&
            partitionedTopicalData.length > 1 && (
              <div className="flex flex-row items-center justify-center gap-2 w-max flex-1">
                <FirstPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={partitionedTopicalData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={true}
                  scrollAreaRef={scrollAreaRef}
                />
                <PreviousPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={partitionedTopicalData}
                  setDisplayedData={setDisplayedData}
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
                    setDisplayedData(partitionedTopicalData[tab]);
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
                  fullPartitionedData={partitionedTopicalData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={true}
                  scrollAreaRef={scrollAreaRef}
                />
                <LastPageButton
                  currentChunkIndex={currentChunkIndex}
                  setCurrentChunkIndex={setCurrentChunkIndex}
                  fullPartitionedData={partitionedTopicalData}
                  setDisplayedData={setDisplayedData}
                  scrollUpWhenPageChange={true}
                  scrollAreaRef={scrollAreaRef}
                />
              </div>
            )}
        </div>
        <CollapsibleContent
          ref={expandedContentRef}
          className="relative z-0 pt-10"
        >
          <Masonry>
            {displayedData?.map((question) =>
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
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

BrowseMoreQuestions.displayName = "BrowseMoreQuestions";

export default BrowseMoreQuestions;
