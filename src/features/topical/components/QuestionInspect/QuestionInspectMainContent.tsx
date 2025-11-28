import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import BrowseMoreQuestions from "./BrowseMoreQuestions";
import { useAuth } from "@/context/AuthContext";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import InspectUltilityBar from "./InspectUltilityBar";
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
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { saveAnnotationsAction } from "@/features/topical/server/actions";
import {
  QuestionInspectMainContentProps,
  QuestionInspectViewMode,
  AnnotatableInspectImagesHandle,
  AnnotatableImagesUpdaterProps,
  SavedActivitiesResponse,
  SelectedAnnotation,
} from "../../constants/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages/AnnotatableInspectImages";
import { QuestionInformation } from "../QuestionInformation";
import BothViews from "./BothViews";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";

const CloseButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    className="w-full h-7 flex items-center justify-center cursor-pointer mb-1"
    variant="outline"
    onClick={onClick}
  >
    Close
  </Button>
));

CloseButton.displayName = "CloseButton";

const AnnotatableImagesUpdater = memo(
  ({
    isMounted,
    imageSource,
    elementRef,
    elementRootRef,
    questionId,
    typeOfView,
    isHavingUnsafeChangesRef,
    componentRef,
  }: AnnotatableImagesUpdaterProps) => {
    const {
      setIsCalculatorOpen,
      isCalculatorOpen,
      savedActivitiesIsLoading: isSavedActivitiesLoading,
      savedActivitiesIsError: isSavedActivitiesError,
      uiPreferences,
      annotationsData,
    } = useTopicalApp();
    const { isSessionFetching, user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate: onSaveAnnotations } = useMutation({
      mutationKey: [
        "user_saved_activities",
        "annotations",
        questionId,
        typeOfView,
      ],
      mutationFn: async (data: {
        questionId: string;
        questionXfdf?: string;
        answerXfdf?: string;
      }) => {
        const result = await saveAnnotationsAction(data);
        if (result.error) {
          throw new Error(result.error);
        }
        return result;
      },
      onSuccess: (_data, variables) => {
        queryClient.setQueryData<SavedActivitiesResponse>(
          ["user_saved_activities"],
          (prev) => {
            if (!prev) return prev;
            const nextAnnotations = prev.annotations
              ? [...prev.annotations]
              : [];
            const existingIndex = nextAnnotations.findIndex(
              (a) => a.questionId === variables.questionId
            );

            const newAnnotation: SelectedAnnotation = {
              questionId: variables.questionId,
              questionXfdf:
                variables.questionXfdf ??
                (existingIndex !== -1
                  ? nextAnnotations[existingIndex].questionXfdf
                  : ""),
              answerXfdf:
                variables.answerXfdf ??
                (existingIndex !== -1
                  ? nextAnnotations[existingIndex].answerXfdf
                  : ""),
              updatedAt: new Date(),
            };

            if (existingIndex !== -1) {
              nextAnnotations[existingIndex] = newAnnotation;
            } else {
              nextAnnotations.push(newAnnotation);
            }

            return {
              ...prev,
              annotations: nextAnnotations,
            };
          }
        );
      },
      retry: false,
    });

    useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "annotations"],
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    const currentQuestionAnnotationData = useMemo(() => {
      return annotationsData?.find(
        (annotation) => annotation.questionId === questionId
      );
    }, [annotationsData, questionId]);

    const initialXfdf = useMemo(() => {
      if (!currentQuestionAnnotationData) {
        return null;
      }
      if (typeOfView == "answer") {
        return currentQuestionAnnotationData.answerXfdf;
      } else {
        return currentQuestionAnnotationData.questionXfdf;
      }
    }, [currentQuestionAnnotationData, typeOfView]);

    useEffect(() => {
      if (!isMounted || !imageSource) return;

      // Call initAnnotableImagesElement every time to update props
      // The function creates the root only if it doesn't exist,
      // then always calls render() with the updated component
      if (!elementRef.current) {
        elementRef.current = document.createElement("div");
        elementRef.current.className = "w-full h-full";
      }

      if (!elementRootRef.current && elementRef.current) {
        elementRootRef.current = createRoot(elementRef.current);
      }

      if (elementRootRef.current) {
        elementRootRef.current.render(
          <AnnotatableInspectImages
            ref={componentRef}
            isSavedActivitiesLoading={isSavedActivitiesLoading}
            isSavedActivitiesError={isSavedActivitiesError}
            initialXfdf={initialXfdf}
            typeOfView={typeOfView}
            imageSource={imageSource}
            isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
            currentQuestionId={questionId}
            isSessionFetching={isSessionFetching}
            userName={user?.name}
            setIsCalculatorOpen={setIsCalculatorOpen}
            isCalculatorOpen={isCalculatorOpen}
            imageTheme={uiPreferences?.imageTheme}
            onSaveAnnotations={onSaveAnnotations}
          />
        );
      }
    }, [
      isMounted,
      imageSource,
      elementRef,
      elementRootRef,
      questionId,
      isSessionFetching,
      setIsCalculatorOpen,
      isCalculatorOpen,
      typeOfView,
      initialXfdf,
      componentRef,
      user?.name,
      uiPreferences?.imageTheme,
      isSavedActivitiesLoading,
      isSavedActivitiesError,
      onSaveAnnotations,
      isHavingUnsafeChangesRef,
    ]);

    return null;
  }
);

AnnotatableImagesUpdater.displayName = "AnnotatableImagesUpdater";

const QuestionInspectMainContent = forwardRef(
  (
    {
      partitionedTopicalData,
      currentTabThatContainsQuestion,
      currentQuestionIndex,
      currentQuestionId,
      listId,
      inspectUltilityBarRef,
      sideBarInspectRef,
      sortParameters,
      setSortParameters,
      isInspectSidebarOpen,
      setIsInspectSidebarOpen,
      BETTER_AUTH_URL,
      navigationButtonsContainerRef,
      isHavingUnsafeChangesRef,
      setIsOpen,
      isCoolDownRef,
      isInputFocusedRef,
    }: QuestionInspectMainContentProps,
    ref
  ) => {
    const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
    const answerScrollAreaRef = useRef<HTMLDivElement>(null);
    const questionScrollAreaRef = useRef<HTMLDivElement>(null);
    const bothViewsQuestionScrollAreaRef = useRef<HTMLDivElement>(null);
    const bothViewsAnswerScrollAreaRef = useRef<HTMLDivElement>(null);
    const [isBrowseMoreOpen, setIsBrowseMoreOpen] = useState(false);
    const [currentView, setCurrentView] =
      useState<QuestionInspectViewMode>("question");
    const questionViewContainer = useRef<HTMLDivElement | null>(null);
    const answerViewContainer = useRef<HTMLDivElement | null>(null);
    const bothViewsQuestionContainer = useRef<HTMLDivElement | null>(null);
    const bothViewsAnswerContainer = useRef<HTMLDivElement | null>(null);
    const annotatableQuestionInspectImagesElementRef =
      useRef<HTMLDivElement | null>(null);
    const annotatableQuestionInspectImagesRootRef = useRef<Root | null>(null);
    const annotatableAnswerInspectImagesElementRef =
      useRef<HTMLDivElement | null>(null);
    const annotatableAnswerInspectImagesRootRef = useRef<Root | null>(null);

    const annotatableQuestionInspectImagesRootElementRef =
      useRef<AnnotatableInspectImagesHandle | null>(null);
    const annotatableAnswerInspectImagesRootElementRef =
      useRef<AnnotatableInspectImagesHandle | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [key, setKey] = useState(0);

    const currentQuestionData = useMemo(() => {
      return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[
        currentQuestionIndex
      ];
    }, [
      partitionedTopicalData,
      currentTabThatContainsQuestion,
      currentQuestionIndex,
    ]);

    // Cleanup roots only when component unmounts
    useEffect(() => {
      setTimeout(() => {
        setIsMounted(true);
      }, 0);
      return () => {
        setTimeout(() => {
          setIsMounted(false);
          if (annotatableQuestionInspectImagesRootRef.current) {
            annotatableQuestionInspectImagesRootRef.current.unmount();
            annotatableQuestionInspectImagesRootRef.current = null;
          }
          if (annotatableQuestionInspectImagesElementRef.current) {
            annotatableQuestionInspectImagesElementRef.current.remove();
            annotatableQuestionInspectImagesElementRef.current = null;
          }
          if (annotatableAnswerInspectImagesRootRef.current) {
            annotatableAnswerInspectImagesRootRef.current.unmount();
            annotatableAnswerInspectImagesRootRef.current = null;
          }
          if (annotatableAnswerInspectImagesElementRef.current) {
            annotatableAnswerInspectImagesElementRef.current.remove();
            annotatableAnswerInspectImagesElementRef.current = null;
          }
        }, 0);
      };
    }, []);

    const resetScrollPositions = useCallback(() => {
      questionScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
      answerScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
      bothViewsQuestionScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
      bothViewsAnswerScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }, []);

    const handleKeyboardNavigation = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const isInterferingWithPdfEditor =
          (currentView === "question" &&
            annotatableQuestionInspectImagesRootElementRef.current
              ?.isEditMode) ||
          (currentView === "answer" &&
            annotatableAnswerInspectImagesRootElementRef.current?.isEditMode);
        if (
          e.key === "e" &&
          !isInputFocusedRef.current &&
          !isInterferingWithPdfEditor
        ) {
          e.preventDefault();
          if (currentView === "question") {
            setCurrentView("answer");
          } else {
            setCurrentView("question");
          }
        }
        if (
          e.key === "r" &&
          !isInputFocusedRef.current &&
          !isInterferingWithPdfEditor
        ) {
          e.preventDefault();
          setCurrentView("both");
          setIsInspectSidebarOpen(false);
        }
        if (e.key === "t" && !isInputFocusedRef.current) {
          e.preventDefault();
          setIsInspectSidebarOpen(!isInspectSidebarOpen);
        }
        if (isCoolDownRef.current || isInterferingWithPdfEditor) return;

        if (
          (e.key === "ArrowUp" ||
            ((e.key === "w" || e.key === "a") && !isInputFocusedRef.current)) &&
          !sideBarInspectRef.current?.isHandlePreviousQuestionDisabled
        ) {
          e.preventDefault();
          sideBarInspectRef.current?.handlePreviousQuestion();
          isCoolDownRef.current = true;
          setTimeout(() => {
            isCoolDownRef.current = false;
          }, 25);
        } else if (
          (e.key === "ArrowDown" ||
            ((e.key === "s" || e.key === "d") && !isInputFocusedRef.current)) &&
          !sideBarInspectRef.current?.isHandleNextQuestionDisabled
        ) {
          e.preventDefault();
          sideBarInspectRef.current?.handleNextQuestion();

          isCoolDownRef.current = true;
          setTimeout(() => {
            isCoolDownRef.current = false;
          }, 25);
        }
      },
      [
        currentView,
        isCoolDownRef,
        isInputFocusedRef,
        isInspectSidebarOpen,
        setIsInspectSidebarOpen,
        sideBarInspectRef,
      ]
    );

    useEffect(() => {
      setCurrentView("question");
      resetScrollPositions();
    }, [currentQuestionId, resetScrollPositions]);

    useImperativeHandle(
      ref,
      () => ({
        resetScrollPositions,
        setCurrentView,
        handleKeyboardNavigation,
      }),
      [resetScrollPositions, setCurrentView, handleKeyboardNavigation]
    );

    const onQuestionClick = useCallback(
      (questionId: string) => {
        sideBarInspectRef.current?.navigateToQuestion({ questionId });
        resetScrollPositions();
      },
      [sideBarInspectRef, resetScrollPositions]
    );

    const handleCloseClick = useCallback(() => {
      if (currentQuestionId) {
        setIsOpen({ isOpen: false, questionId: currentQuestionId });
      }
    }, [currentQuestionId, setIsOpen]);

    return (
      <>
        <AnnotatableImagesUpdater
          isMounted={isMounted}
          imageSource={currentQuestionData?.questionImages ?? []}
          elementRef={annotatableQuestionInspectImagesElementRef}
          elementRootRef={annotatableQuestionInspectImagesRootRef}
          questionId={currentQuestionData?.id ?? ""}
          typeOfView="question"
          componentRef={annotatableQuestionInspectImagesRootElementRef}
          isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
        />
        <AnnotatableImagesUpdater
          isMounted={isMounted}
          imageSource={currentQuestionData?.answers ?? []}
          elementRef={annotatableAnswerInspectImagesElementRef}
          elementRootRef={annotatableAnswerInspectImagesRootRef}
          questionId={currentQuestionData?.id ?? ""}
          typeOfView="answer"
          componentRef={annotatableAnswerInspectImagesRootElementRef}
          isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
        />
        <SidebarInset className="h-[inherit] w-full p-2 rounded-md px-4 dark:bg-accent gap-2 overflow-hidden flex flex-col items-center justify-between">
          <div
            className="w-full h-[inherit] flex flex-col gap-2 items-center justify-start relative"
            ref={sideBarInsetRef}
          >
            <InspectUltilityBar
              ref={inspectUltilityBarRef}
              currentView={currentView}
              setCurrentView={setCurrentView}
              currentQuestionData={currentQuestionData}
              listId={listId}
              navigationButtonsContainerRef={navigationButtonsContainerRef}
              sortParameters={sortParameters}
              setSortParameters={setSortParameters}
              isInspectSidebarOpen={isInspectSidebarOpen}
              setIsInspectSidebarOpen={setIsInspectSidebarOpen}
              BETTER_AUTH_URL={BETTER_AUTH_URL}
              sideBarInsetRef={sideBarInsetRef}
            />

            <div
              className={cn(
                currentView === "question"
                  ? "w-full"
                  : "absolute top-[-99999px]"
              )}
            >
              <ScrollArea
                className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                type="always"
                viewportRef={questionScrollAreaRef}
              >
                <div className="flex flex-row flex-wrap w-full gap-2 justify-start items-start">
                  <QuestionInformation
                    question={currentQuestionData}
                    showCurriculumn={false}
                    showSubject={false}
                  />
                </div>
                <div ref={questionViewContainer}></div>

                <BrowseMoreQuestions
                  partitionedTopicalData={partitionedTopicalData}
                  onQuestionClick={onQuestionClick}
                  isBrowseMoreOpen={isBrowseMoreOpen}
                  setIsBrowseMoreOpen={setIsBrowseMoreOpen}
                />
              </ScrollArea>
            </div>
            <div
              className={cn(
                currentView === "answer" ? "w-full" : "absolute top-[-99999px]"
              )}
            >
              <ScrollArea
                className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                type="always"
                viewportRef={answerScrollAreaRef}
              >
                <div className="flex flex-row flex-wrap w-full gap-2 justify-start items-start">
                  <QuestionInformation
                    question={currentQuestionData}
                    showCurriculumn={false}
                    showSubject={false}
                  />
                </div>
                <div ref={answerViewContainer}></div>
              </ScrollArea>
            </div>
            <div
              className={cn(
                currentView === "both" ? "w-full" : "absolute top-[-99999px]"
              )}
            >
              <div className="flex flex-row flex-wrap w-full gap-2 -mb-3 py-2 justify-start items-start">
                <QuestionInformation
                  question={currentQuestionData}
                  showCurriculumn={false}
                  showSubject={false}
                />
              </div>
              <BothViews
                currentQuestionData={currentQuestionData}
                questionScrollAreaRef={bothViewsQuestionScrollAreaRef}
                answerScrollAreaRef={bothViewsAnswerScrollAreaRef}
                annotableQuestionContainerRef={bothViewsQuestionContainer}
                annotableAnswerContainerRef={bothViewsAnswerContainer}
              />
            </div>
          </div>
          <CloseButton onClick={handleCloseClick} />
        </SidebarInset>
        {bothViewsQuestionContainer.current &&
          questionViewContainer.current &&
          (currentView === "question" || currentView === "both") &&
          createPortal(
            <div
              ref={(node) => {
                if (
                  node &&
                  annotatableQuestionInspectImagesElementRef.current
                ) {
                  node.appendChild(
                    annotatableQuestionInspectImagesElementRef.current
                  );
                }
              }}
              className="w-full h-full"
            />,
            currentView === "both"
              ? bothViewsQuestionContainer.current
              : questionViewContainer.current
          )}
        {bothViewsAnswerContainer.current &&
          answerViewContainer.current &&
          (currentView === "answer" || currentView === "both") &&
          createPortal(
            <div
              ref={(node) => {
                if (node && annotatableAnswerInspectImagesElementRef.current) {
                  node.appendChild(
                    annotatableAnswerInspectImagesElementRef.current
                  );
                }
              }}
              className="w-full h-full"
            />,
            currentView === "both"
              ? bothViewsAnswerContainer.current
              : answerViewContainer.current
          )}
      </>
    );
  }
);

QuestionInspectMainContent.displayName = "QuestionInspectMainContent";

export default QuestionInspectMainContent;
