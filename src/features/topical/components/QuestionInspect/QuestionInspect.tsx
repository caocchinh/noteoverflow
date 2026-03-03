"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InspectProvider } from "../../context/InspectContext";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import {
  InspectSidebarRef,
  InspectUltilityBarRef,
  QuestionInspectMainContentRef,
  QuestionInspectProps,
} from "../../types/components";
import InspectSidebar from "./InspectSidebar/InspectSidebar";
import QuestionAnnotationGuardDialog from "./QuestionAnnotationGuardDialog";
import QuestionInspectMainContent from "./QuestionInspectMainContent";

const sidebarProviderStyle = {
  "--sidebar-width": "299.6px",
  height: "inherit",
  minHeight: "inherit !important",
} as React.CSSProperties;

const QuestionInspect = memo(
  ({
    currentQuery,
    partitionedTopicalData,
    listId,
    BETTER_AUTH_URL,
    sortParameters,
    setSortParameters,
    isInspectOpen,
    setIsInspectOpen,
  }: QuestionInspectProps) => {
    const pathname = usePathname();
    const pathNameRef = useRef(pathname);
    const { isCalculatorOpen } = useTopicalApp();
    const isHavingUnsafeChangesRef = useRef({
      answer: false,
      question: false,
      questionId: "",
    });
    const [isAnnotationGuardDialogOpen, setIsAnnotationGuardDialogOpen] = useState(false);

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

    const [currentTabThatContainsQuestion, setCurrentTabThatContainsQuestion] = useState(0);
    const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>(undefined);
    const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
    const isMobile = useIsMobile();
    const currentQuestionIndex = useMemo(() => {
      return (
        partitionedTopicalData?.[currentTabThatContainsQuestion]?.findIndex(
          (question) => question.id === currentQuestionId,
        ) ?? 0
      );
    }, [partitionedTopicalData, currentTabThatContainsQuestion, currentQuestionId]);
    const isInputFocusedRef = useRef(false);
    const allQuestions = useMemo(() => {
      return partitionedTopicalData?.flat() ?? [];
    }, [partitionedTopicalData]);

    useEffect(() => {
      if (isMobile) {
        setTimeout(() => {
          setIsInspectSidebarOpen(false);
        }, 0);
      }
    }, [isMobile, setIsInspectSidebarOpen]);

    const calculateTabThatQuestionResidesIn = useCallback(
      (questionId: string) => {
        const tab = questionId
          ? (partitionedTopicalData?.findIndex((partition) =>
              partition.some((question) => question.id === questionId),
            ) ?? 0)
          : 0;
        return tab;
      },
      [partitionedTopicalData],
    );

    useEffect(() => {
      if (!currentQuestionId) {
        return;
      }
      setTimeout(() => {
        setCurrentTabThatContainsQuestion(calculateTabThatQuestionResidesIn(currentQuestionId));
      }, 0);
    }, [currentQuestionId, calculateTabThatQuestionResidesIn]);

    const questionInspectMainContentRef = useRef<QuestionInspectMainContentRef | null>(null);
    const sideBarInspectRef = useRef<InspectSidebarRef | null>(null);
    const inspectUltilityBarRef = useRef<InspectUltilityBarRef | null>(null);
    const navigationButtonsContainerRef = useRef<HTMLDivElement | null>(null);
    const isCoolDownRef = useRef(false);
    const [isPendingClose, setIsPendingClose] = useState(false);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      questionInspectMainContentRef.current?.handleKeyboardNavigation(e);
    }, []);

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
        if (
          targetElement?.closest("[data-pdf-viewer]") ||
          targetElement?.closest(".PhotoView-Portal") ||
          targetElement?.closest("[data-annotatable-download-menu]")
        ) {
          e.preventDefault();
          return;
        }
      },
      [isCalculatorOpen, isInspectOpen.isOpen],
    );

    useEffect(() => {
      if (pathNameRef.current !== "/topical") {
        return;
      }
      if (isInspectOpen.isOpen) {
        questionInspectMainContentRef.current?.setCurrentView("question");
        // Removed updateSearchParams here as it is handled by the hook
      } else {
        isInputFocusedRef.current = false;
        // Removed updateSearchParams here as it is handled by the hook
      }
    }, [currentQuery, isInspectOpen]); // Retained for side effect on currentView and inputFocus

    // Removed second useEffect for updateSearchParams based on currentQuestionId

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
        setIsInspectOpen,
      ],
    );

    useEffect(() => {
      if (!isPendingClose || isAnnotationGuardDialogOpen) {
        return;
      }
      setTimeout(() => {
        setIsPendingClose(false);
        handleOpenChange(false);
      }, 0);
    }, [isPendingClose, isAnnotationGuardDialogOpen, handleOpenChange]);

    return (
      <>
        <QuestionAnnotationGuardDialog isOpen={isAnnotationGuardDialogOpen} />
        <Dialog open={isInspectOpen.isOpen} onOpenChange={handleOpenChange} modal={false}>
          {isInspectOpen.isOpen && <div className="fixed inset-0 z-100003 bg-black/50" />}
          <DialogContent
            className="dark:bg-accent flex h-[94dvh] w-[95vw] max-w-screen! flex-row items-center justify-center overflow-hidden p-0"
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
            <InspectProvider
              value={{
                allQuestions,
                partitionedTopicalData,
                listId,
                BETTER_AUTH_URL,
                isOpen: isInspectOpen,
                setIsOpen: setIsInspectOpen,
                currentQuestionId,
                setCurrentQuestionId,
                currentQuestionIndex,
                currentTabThatContainsQuestion,
                currentView: "question",
                setCurrentView: (view) =>
                  questionInspectMainContentRef.current?.setCurrentView(view),
                isInspectSidebarOpen,
                setIsInspectSidebarOpen,
                sortParameters,
                setSortParameters,
                isAnnotationGuardDialogOpen,
                setIsAnnotationGuardDialogOpen,
                isInputFocusedRef,
                isHavingUnsafeChangesRef,
                inspectUltilityBarRef,
                navigationButtonsContainerRef,
                questionInspectMainContentRef,
                sideBarInspectRef,
                isCoolDownRef,
                calculateTabThatQuestionResidesIn,
                resetScrollPositions: () =>
                  questionInspectMainContentRef.current?.resetScrollPositions(),
              }}
            >
              <SidebarProvider
                onOpenChange={setIsInspectSidebarOpen}
                openMobile={isInspectSidebarOpen}
                onOpenChangeMobile={setIsInspectSidebarOpen}
                open={isInspectSidebarOpen}
                className="min-h-[inherit]!"
                style={sidebarProviderStyle}
              >
                <InspectSidebar ref={sideBarInspectRef} />

                <QuestionInspectMainContent ref={questionInspectMainContentRef} />
              </SidebarProvider>
            </InspectProvider>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

QuestionInspect.displayName = "QuestionInspect";

export default QuestionInspect;
