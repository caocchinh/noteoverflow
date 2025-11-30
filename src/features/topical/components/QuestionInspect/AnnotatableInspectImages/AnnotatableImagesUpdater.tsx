import { memo, useEffect, useMemo, useCallback } from "react";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages";
import {
  AnnotatableImagesUpdaterProps,
  SavedActivitiesResponse,
  SelectedAnnotation,
} from "../../../constants/types";
import { saveAnnotationsAction } from "@/features/topical/server/actions";
import { useAuth } from "@/context/AuthContext";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import {
  createListMutationFn,
  handleBookmarkError,
  handleCreateListOptimisticUpdate,
  handleToggleBookmarkOptimisticUpdate,
  toggleBookmarkMutationFn,
} from "../../../utils/bookmarkUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MY_ANNOTATIONS_BOOKMARK_LIST_NAME,
  MY_ANNOTATIONS_BOOKMARK_LIST_VISIBILITY,
} from "../../../constants/constants";

const AnnotatableImagesUpdater = memo(
  ({
    isMounted,
    elementRef,
    elementRootRef,
    typeOfView,
    isHavingUnsafeChangesRef,
    componentRef,
    setIsAnnotationGuardDialogOpen,
    isAnnotationGuardDialogOpen,
    question,
  }: AnnotatableImagesUpdaterProps) => {
    const {
      setIsCalculatorOpen,
      isCalculatorOpen,
      savedActivitiesIsLoading: isSavedActivitiesLoading,
      savedActivitiesIsError: isSavedActivitiesError,
      uiPreferences,
      annotationsData,
      bookmarksData,
    } = useTopicalApp();
    const { isSessionFetching, user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const isMobileDevice = useIsMobile();

    const { mutate: createListMutate } = useMutation({
      mutationKey: ["user_saved_activities", "bookmarks", question?.id],
      mutationFn: createListMutationFn,
      onSuccess: (data) => {
        handleCreateListOptimisticUpdate(queryClient, data);
        toast.success(
          `Question added to ${MY_ANNOTATIONS_BOOKMARK_LIST_NAME}`,
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
      },
      onError: (error, variables) => {
        handleBookmarkError(error, variables, isMobileDevice);
      },
    });

    const { mutate: toggleBookmarkMutate } = useMutation({
      mutationKey: ["user_saved_activities", "bookmarks", question?.id],
      mutationFn: toggleBookmarkMutationFn,
      onSuccess: (data) => {
        handleToggleBookmarkOptimisticUpdate(queryClient, data);
        toast.success(
          `Question added to ${MY_ANNOTATIONS_BOOKMARK_LIST_NAME}`,
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
      },
      onError: (error, variables) => {
        handleBookmarkError(error, variables, isMobileDevice);
      },
    });

    const { mutate: saveAnnotationsMutation, isPending: isSavingAnnotations } =
      useMutation({
        mutationKey: [
          "user_saved_activities",
          "annotations",
          question?.id,
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
              const nextAnnotations = prev.annotations ?? [];
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
        onError: () => {
          toast.error(
            "Failed to save annotations. Please try again or reload the website."
          );
        },
        retry: 2,
      });

    const onSaveAnnotations = useCallback(
      (
        data: {
          questionId: string;
          questionXfdf?: string;
          answerXfdf?: string;
        },
        callbacks?: {
          onSuccess?: () => void;
        }
      ) => {
        saveAnnotationsMutation(data, {
          onSuccess: () => {
            callbacks?.onSuccess?.();
          },
        });

        if (!question) return;

        const myAnnotationsList = bookmarksData?.find(
          (b) =>
            b.listName === MY_ANNOTATIONS_BOOKMARK_LIST_NAME &&
            b.visibility === MY_ANNOTATIONS_BOOKMARK_LIST_VISIBILITY
        );

        const isCreateNew = !myAnnotationsList;
        const isRealBookmarked =
          myAnnotationsList?.userBookmarks.some(
            (b) => b.question.id === question.id
          ) ?? false;

        if (!isCreateNew && isRealBookmarked) {
          return;
        }

        if (isCreateNew) {
          createListMutate({
            question,
            bookmarkListName: MY_ANNOTATIONS_BOOKMARK_LIST_NAME,
            visibility: MY_ANNOTATIONS_BOOKMARK_LIST_VISIBILITY,
          });
        } else {
          toggleBookmarkMutate({
            question,
            listId: myAnnotationsList.id,
            isBookmarked: false,
            bookmarkListName: MY_ANNOTATIONS_BOOKMARK_LIST_NAME,
          });
        }
      },
      [
        saveAnnotationsMutation,
        question,
        bookmarksData,
        createListMutate,
        toggleBookmarkMutate,
      ]
    );

    const annotationsMutationState = useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "annotations"],
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    useEffect(() => {
      if (
        !isHavingUnsafeChangesRef.current["answer"] &&
        !isHavingUnsafeChangesRef.current["question"]
      ) {
        setIsAnnotationGuardDialogOpen(false);
        isHavingUnsafeChangesRef.current.questionId = "";
      }
    }, [
      annotationsMutationState,
      isHavingUnsafeChangesRef,
      setIsAnnotationGuardDialogOpen,
    ]);

    const currentQuestionAnnotationData = useMemo(() => {
      return annotationsData?.find(
        (annotation) => annotation.questionId === question?.id
      );
    }, [annotationsData, question?.id]);

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
      if (!isMounted || !question) return;

      // Call initAnnotableImagesElement every time to update props
      // The function creates the root only if it doesn't exist,
      // then always calls render() with the updated component

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
            isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
            isSessionFetching={isSessionFetching}
            userName={user?.name}
            setIsCalculatorOpen={setIsCalculatorOpen}
            isCalculatorOpen={isCalculatorOpen}
            imageTheme={uiPreferences?.imageTheme}
            onSaveAnnotations={onSaveAnnotations}
            isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
            isSavingAnnotations={isSavingAnnotations}
            isAuthenticated={isAuthenticated}
            question={question}
          />
        );
      }
    }, [
      isMounted,
      elementRef,
      elementRootRef,
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
      setIsAnnotationGuardDialogOpen,
      isAnnotationGuardDialogOpen,
      isSavingAnnotations,
      isAuthenticated,
      question,
    ]);

    return null;
  }
);

AnnotatableImagesUpdater.displayName = "AnnotatableImagesUpdater";

export default AnnotatableImagesUpdater;
