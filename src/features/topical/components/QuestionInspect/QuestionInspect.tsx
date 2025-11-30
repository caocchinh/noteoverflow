"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { updateSearchParams } from "../../lib/utils";
import {
  InspectSidebarRef,
  InspectUltilityBarRef,
  QuestionInspectOpenState,
  QuestionInspectProps,
} from "../../constants/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import InspectSidebar from "./InspectSidebar";
import { QuestionInspectMainContentRef } from "../../constants/types";
import QuestionInspectMainContent from "./QuestionInspectMainContent";
import { usePathname } from "next/navigation";
import QuestionAnnotationGuardDialog from "./QuestionAnnotationGuardDialog";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";

const sidebarProviderStyle = {
  "--sidebar-width": "299.6px",
  height: "inherit",
  minHeight: "inherit !important",
} as React.CSSProperties;

const QuestionInspect = memo(
  forwardRef(
    (
      {
        currentQuery,
        partitionedTopicalData,
        listId,
        BETTER_AUTH_URL,
        sortParameters,
        setSortParameters,
      }: QuestionInspectProps,
      ref
    ) => {
      const pathname = usePathname();
      const pathNameRef = useRef(pathname);
      const { isCalculatorOpen } = useTopicalApp();
      const isHavingUnsafeChangesRef = useRef({
        answer: false,
        question: false,
      });
      const [isAnnotationGuardDialogOpen, setIsAnnotationGuardDialogOpen] =
        useState(false);

      useEffect(() => {
        pathNameRef.current = pathname;
      }, [pathname]);

      useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (
            isHavingUnsafeChangesRef.current["answer"] ||
            isHavingUnsafeChangesRef.current["question"]
          ) {
            e.preventDefault();
          }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
        };
      }, []);

      const [isInspectOpen, setIsInspectOpen] =
        useState<QuestionInspectOpenState>({
          isOpen: false,
          questionId: "",
        });

      const [
        currentTabThatContainsQuestion,
        setCurrentTabThatContainsQuestion,
      ] = useState(0);
      const [currentQuestionId, setCurrentQuestionId] = useState<
        string | undefined
      >(undefined);
      const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);

      const isMobile = useIsMobile();
      const currentQuestionIndex = useMemo(() => {
        return (
          partitionedTopicalData?.[currentTabThatContainsQuestion]?.findIndex(
            (question) => question.id === currentQuestionId
          ) ?? 0
        );
      }, [
        partitionedTopicalData,
        currentTabThatContainsQuestion,
        currentQuestionId,
      ]);
      const isInputFocusedRef = useRef(false);
      const allQuestions = useMemo(() => {
        return partitionedTopicalData?.flat() ?? [];
      }, [partitionedTopicalData]);

      useEffect(() => {
        if (isMobile) {
          setIsInspectSidebarOpen(false);
        }
      }, [isMobile, setIsInspectSidebarOpen]);

      useImperativeHandle(
        ref,
        () => ({
          isInspectOpen,
          setIsInspectOpen,
        }),
        [setIsInspectOpen, isInspectOpen]
      );

      const calculateTabThatQuestionResidesIn = useCallback(
        (questionId: string) => {
          const tab = questionId
            ? partitionedTopicalData?.findIndex((partition) =>
                partition.some((question) => question.id === questionId)
              ) ?? 0
            : 0;
          return tab;
        },
        [partitionedTopicalData]
      );

      useEffect(() => {
        if (!currentQuestionId) {
          return;
        }
        setCurrentTabThatContainsQuestion(
          calculateTabThatQuestionResidesIn(currentQuestionId)
        );
      }, [currentQuestionId, calculateTabThatQuestionResidesIn]);

      const questionInspectMainContentRef =
        useRef<QuestionInspectMainContentRef | null>(null);
      const sideBarInspectRef = useRef<InspectSidebarRef | null>(null);
      const inspectUltilityBarRef = useRef<InspectUltilityBarRef | null>(null);
      const navigationButtonsContainerRef = useRef<HTMLDivElement | null>(null);
      const isCoolDownRef = useRef(false);
      const [isPendingClose, setIsPendingClose] = useState(false);

      const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
          questionInspectMainContentRef.current?.handleKeyboardNavigation(e);
        },
        []
      );

      const handleKeyUp = useCallback(() => {
        isCoolDownRef.current = false;
      }, []);

      const handleInteractOutside = useCallback(
        (e: Event) => {
          if (isInspectOpen.isOpen && isCalculatorOpen) {
            e.preventDefault();
            return;
          }
          const targetElement = e.target as Element;
          console.log(targetElement);
          if (
            targetElement?.closest("[data-pdf-viewer]") ||
            targetElement?.closest(".PhotoView-Portal") ||
            targetElement?.closest("[data-annotatable-download-menu]")
          ) {
            e.preventDefault();
            return;
          }
        },
        [isCalculatorOpen, isInspectOpen.isOpen]
      );

      useEffect(() => {
        if (pathNameRef.current !== "/topical") {
          return;
        }
        if (isInspectOpen.isOpen) {
          questionInspectMainContentRef.current?.setCurrentView("question");
          updateSearchParams({
            query: JSON.stringify(currentQuery),
            isInspectOpen: true,
            questionId: isInspectOpen.questionId ?? "",
          });
        } else {
          isInputFocusedRef.current = false;
          if (currentQuery?.curriculumId && currentQuery?.subjectId) {
            updateSearchParams({
              query: JSON.stringify(currentQuery),
              questionId: isInspectOpen.questionId ?? "",
              isInspectOpen: false,
            });
          }
        }
      }, [currentQuery, isInspectOpen]);

      useEffect(() => {
        if (pathNameRef.current !== "/topical") {
          return;
        }
        if (currentQuery && currentQuestionId) {
          updateSearchParams({
            query: JSON.stringify(currentQuery),
            isInspectOpen: true,
            questionId: currentQuestionId,
          });
        }
      }, [currentQuestionId, currentQuery]);

      const handleOpenChange = useCallback(
        (open: boolean) => {
          if (!open) {
            if (
              isHavingUnsafeChangesRef.current["answer"] ||
              isHavingUnsafeChangesRef.current["question"] ||
              isAnnotationGuardDialogOpen
            ) {
              if (!isAnnotationGuardDialogOpen) {
                setIsAnnotationGuardDialogOpen(true);
              }
              setIsPendingClose(true);
              return;
            }
          }
          setIsInspectOpen({
            isOpen: open,
            questionId:
              currentQuestionId ??
              isInspectOpen.questionId ??
              partitionedTopicalData?.[0]?.[0]?.id ??
              "",
          });
        },
        [
          currentQuestionId,
          isInspectOpen.questionId,
          partitionedTopicalData,
          isAnnotationGuardDialogOpen,
        ]
      );

      useEffect(() => {
        if (!isPendingClose || isAnnotationGuardDialogOpen) {
          return;
        }
        setIsPendingClose(false);
        handleOpenChange(false);
      }, [isPendingClose, isAnnotationGuardDialogOpen, handleOpenChange]);

      return (
        <>
          <QuestionAnnotationGuardDialog isOpen={isAnnotationGuardDialogOpen} />
          <Dialog
            open={isInspectOpen.isOpen}
            onOpenChange={handleOpenChange}
            modal={false}
          >
            {isInspectOpen.isOpen && (
              <div className="fixed inset-0 z-100003 bg-black/50" />
            )}
            <DialogContent
              className="w-[95vw] h-[94dvh] flex flex-row items-center justify-center max-w-screen! dark:bg-accent overflow-hidden p-0"
              showCloseButton={false}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onInteractOutside={handleInteractOutside}
            >
              <DialogHeader className="sr-only">
                <DialogTitle>Question and answer inspector</DialogTitle>
                <DialogDescription>
                  View the question and answer for individual questions
                </DialogDescription>
              </DialogHeader>
              <SidebarProvider
                onOpenChange={setIsInspectSidebarOpen}
                openMobile={isInspectSidebarOpen}
                onOpenChangeMobile={setIsInspectSidebarOpen}
                open={isInspectSidebarOpen}
                className="min-h-[inherit]!"
                style={sidebarProviderStyle}
              >
                <InspectSidebar
                  ref={sideBarInspectRef}
                  overflowScrollHandler={
                    inspectUltilityBarRef.current?.overflowScrollHandler
                  }
                  calculateTabThatQuestionResidesIn={
                    calculateTabThatQuestionResidesIn
                  }
                  isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
                  isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
                  setIsAnnotationGuardDialogOpen={
                    setIsAnnotationGuardDialogOpen
                  }
                  allQuestions={allQuestions}
                  partitionedTopicalData={partitionedTopicalData}
                  isOpen={isInspectOpen}
                  setIsOpen={setIsInspectOpen}
                  currentTabThatContainsQuestion={
                    currentTabThatContainsQuestion
                  }
                  isInspectSidebarOpen={isInspectSidebarOpen}
                  currentQuestionId={currentQuestionId}
                  setCurrentQuestionId={setCurrentQuestionId}
                  setCurrentView={(view) =>
                    questionInspectMainContentRef.current?.setCurrentView(view)
                  }
                  resetScrollPositions={() =>
                    questionInspectMainContentRef.current?.resetScrollPositions()
                  }
                  listId={listId}
                  currentQuestionIndex={currentQuestionIndex}
                  isInputFocusedRef={isInputFocusedRef}
                  navigationButtonsContainerRef={navigationButtonsContainerRef}
                  questionInspectMainContentRef={questionInspectMainContentRef}
                />
                <QuestionInspectMainContent
                  ref={questionInspectMainContentRef}
                  isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
                  partitionedTopicalData={partitionedTopicalData}
                  currentTabThatContainsQuestion={
                    currentTabThatContainsQuestion
                  }
                  setIsAnnotationGuardDialogOpen={
                    setIsAnnotationGuardDialogOpen
                  }
                  isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
                  currentQuestionIndex={currentQuestionIndex}
                  currentQuestionId={currentQuestionId}
                  listId={listId}
                  inspectUltilityBarRef={inspectUltilityBarRef}
                  sideBarInspectRef={sideBarInspectRef}
                  sortParameters={sortParameters}
                  setSortParameters={setSortParameters}
                  isInspectSidebarOpen={isInspectSidebarOpen}
                  navigationButtonsContainerRef={navigationButtonsContainerRef}
                  setIsInspectSidebarOpen={setIsInspectSidebarOpen}
                  BETTER_AUTH_URL={BETTER_AUTH_URL}
                  setIsOpen={setIsInspectOpen}
                  isCoolDownRef={isCoolDownRef}
                  isInputFocusedRef={isInputFocusedRef}
                />
              </SidebarProvider>
            </DialogContent>
          </Dialog>
        </>
      );
    }
  )
);

QuestionInspect.displayName = "QuestionInspect";

export default QuestionInspect;
