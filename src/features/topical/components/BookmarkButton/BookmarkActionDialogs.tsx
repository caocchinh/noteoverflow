import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAXIMUM_BOOKMARK_LISTS_PER_USER } from "@/constants/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { memo, useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { LIST_NAME_MAX_LENGTH } from "../../constants/constants";
import { SelectVisibility } from "../SelectVisibility";

import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { BookmarkActionDialogsProps } from "../../types/components";
import { CreateListMutationVariables } from "../../types/models";
import {
  createListMutationFn,
  handleBookmarkError,
  handleCreateListOptimisticUpdate,
  handleToggleBookmarkOptimisticUpdate,
  toggleBookmarkMutationFn,
} from "../../utils/bookmarkUtils";

export const BookmarkActionDialogs = memo(
  ({
    question,
    listId,
    searchInputRef,
    chosenBookmarkList,
    isHavingUnsafeChangesRef,
    isAnnotationGuardDialogOpen,
    setIsAnnotationGuardDialogOpen,
  }: BookmarkActionDialogsProps) => {
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [isInputError, setIsInputError] = useState(false);
    const [isAddNewListDialogOpen, setIsAddNewListDialogOpen] = useState(false);
    const [newBookmarkListNameInput, setNewBookmarkListNameInput] = useState("");
    const [isRemoveFromListDialogOpen, setIsRemoveFromListDialogOpen] = useState(false);
    const isMobileDevice = useIsMobile();
    const queryClient = useQueryClient();
    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: ["user_saved_activities", "bookmarks", question.id],
      }) > 0;
    const [isPendingRemoveFromList, setIsPendingRemoveFromList] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isBlockingDialogInput, setIsBlockingDialogInput] = useState(false);
    const { bookmarksData } = useTopicalApp();

    const createListMutationKey = [
      "user_saved_activities",
      "bookmarks",
      question.id,
      "create_list",
    ];

    const { mutate: createListMutate } = useMutation({
      mutationKey: createListMutationKey,
      mutationFn: createListMutationFn,
      onSuccess: (data) => {
        const { bookmarkListName: newBookmarkListName } = data;
        setTimeout(() => {
          searchInputRef?.current?.focus();
        }, 0);

        handleCreateListOptimisticUpdate(queryClient, data, {
          onSuccess: () => {
            setIsAddNewListDialogOpen(false);
            setIsInputError(false);
            setNewBookmarkListNameInput("");
          },
          addChosenBookmarkList: () => {},
        });

        toast.success(`Question added to ${newBookmarkListName}`, {
          duration: 2000,
          position: isMobileDevice ? "top-center" : "bottom-right",
        });
      },
      onError: (error, variables) => {
        handleBookmarkError(error, variables as CreateListMutationVariables, isMobileDevice);
      },
    });

    const removeFromListMutationKey = [
      "user_saved_activities",
      "bookmarks",
      question.id,
      "remove_from_list",
    ];

    const { mutate: removeFromListMutate } = useMutation({
      mutationKey: removeFromListMutationKey,
      mutationFn: toggleBookmarkMutationFn,
      onSuccess: (data) => {
        const { bookmarkListName: newBookmarkListName } = data;

        handleToggleBookmarkOptimisticUpdate(queryClient, data, {
          removeChosenBookmarkList: () => {
            setIsRemoveFromListDialogOpen(false);
          },
        });

        toast.success(`Question removed from ${newBookmarkListName}`, {
          duration: 2000,
          position: isMobileDevice ? "top-center" : "bottom-right",
        });
      },
      onError: (error, variables) => {
        handleBookmarkError(error, variables, isMobileDevice);
      },
    });

    const createNewList = () => {
      setIsBlockingDialogInput(true);

      if (
        newBookmarkListNameInput.trim() === "" ||
        newBookmarkListNameInput.length > LIST_NAME_MAX_LENGTH
      ) {
        setIsInputError(true);
        return;
      }
      if (bookmarksData && bookmarksData.length >= MAXIMUM_BOOKMARK_LISTS_PER_USER) {
        toast.error(
          "Failed to update bookmarks. You can only have maximum of " +
            MAXIMUM_BOOKMARK_LISTS_PER_USER +
            " bookmark lists.",
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          },
        );
        return;
      }
      setNewBookmarkListNameInput(newBookmarkListNameInput.trim());
      setTimeout(() => {
        createListMutate({
          question,
          bookmarkListName: newBookmarkListNameInput.trim(),
          visibility,
        });
        setIsBlockingDialogInput(false);
      }, 0);
    };

    const removeFromList = useCallback(
      ({ listId }: { listId: string }) => {
        if (isHavingUnsafeChangesRef) {
          if (
            isHavingUnsafeChangesRef.current.question ||
            isHavingUnsafeChangesRef.current.answer
          ) {
            if (
              question.id === isHavingUnsafeChangesRef.current.questionId &&
              !isAnnotationGuardDialogOpen
            ) {
              setIsPendingRemoveFromList(true);
              setIsAnnotationGuardDialogOpen?.(true);
              return;
            }
          }
        }

        const list = bookmarksData?.find((bookmark) => bookmark.id === listId);
        if (!list) {
          toast.error("List not found, please refresh the page!", {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          });
          return;
        }
        if (!chosenBookmarkList.has(listId)) {
          toast.error("The question is not in this list already!", {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          });
          setIsRemoveFromListDialogOpen(false);
          return;
        }
        removeFromListMutate({
          question,
          listId,
          bookmarkListName: list.listName,
          isBookmarked: true,
        });
      },
      [
        bookmarksData,
        chosenBookmarkList,
        isAnnotationGuardDialogOpen,
        isHavingUnsafeChangesRef,
        isMobileDevice,
        question,
        removeFromListMutate,
        setIsAnnotationGuardDialogOpen,
      ],
    );

    const onGuardComplete = useEffectEvent(({ _listId }: { _listId: string }) => {
      setIsPendingRemoveFromList(false);
      removeFromList({ listId: _listId });
    });

    useEffect(() => {
      if (isPendingRemoveFromList && !isAnnotationGuardDialogOpen && listId) {
        onGuardComplete({ _listId: listId });
      }
    }, [isAnnotationGuardDialogOpen, isPendingRemoveFromList, listId, removeFromList]);

    return (
      <div className="flex w-full items-center justify-center gap-2 px-2">
        <AlertDialog
          open={isAddNewListDialogOpen}
          onOpenChange={(value) => {
            setIsAddNewListDialogOpen(value);
            if (value === true) {
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <div className="flex-1">
              <Button className="mt-2 w-full cursor-pointer" variant="outline">
                <Plus /> New list
              </Button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-accent z-100014" overlayClassName="z-[100013] ">
            <AlertDialogHeader>
              <AlertDialogTitle>New list</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex flex-col items-center justify-center">
              <p className="mb-1 w-full text-left text-sm">List name</p>
              <div className="flex w-full items-center justify-center gap-2">
                <Input
                  onChange={(e) => {
                    if (e.target.value.length > LIST_NAME_MAX_LENGTH) {
                      setIsInputError(true);
                    } else {
                      setIsInputError(false);
                    }
                    setNewBookmarkListNameInput(e.target.value);
                  }}
                  ref={inputRef}
                  readOnly={isBlockingDialogInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createNewList();
                    }
                  }}
                  onClick={() => {
                    inputRef.current?.focus();
                    setIsBlockingDialogInput(false);
                  }}
                  disabled={isMutatingThisQuestion}
                  value={newBookmarkListNameInput}
                  placeholder="e.g. Super hard questions"
                  className="placeholder:text-[13px]"
                />
                <X
                  className={cn(
                    "cursor-pointer text-red-500",
                    isMutatingThisQuestion && "opacity-50",
                  )}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={() => {
                    if (isMutatingThisQuestion) return;
                    setNewBookmarkListNameInput("");
                    inputRef.current?.focus();
                    setIsBlockingDialogInput(false);
                    setIsInputError(false);
                  }}
                  size={20}
                />
              </div>
              <p className="mt-3 mb-1 w-full text-left text-sm">Visibility</p>
              <div className="flex w-full items-center justify-center gap-2">
                <SelectVisibility
                  isMutatingThisQuestion={isMutatingThisQuestion}
                  visibility={visibility}
                  setVisibility={setVisibility}
                />
              </div>
            </div>
            {isInputError && (
              <p className="mt-1 text-center text-xs text-red-500">
                Please enter valid a list name. Max {LIST_NAME_MAX_LENGTH} characters.
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-left text-xs">
              If list name with the same visibility already exists, the question will be added to
              the list.
            </p>
            <div className="flex w-full gap-2">
              <AlertDialogCancel asChild>
                <Button
                  className="mt-2 w-1/2 cursor-pointer"
                  variant="outline"
                  onClick={() => {
                    setIsBlockingDialogInput(true);
                    setTimeout(() => {
                      searchInputRef?.current?.focus();
                      setIsBlockingDialogInput(false);
                    }, 0);
                  }}
                >
                  Back
                </Button>
              </AlertDialogCancel>
              <Button
                className="mt-2 flex flex-1 cursor-pointer items-center justify-center gap-0"
                disabled={isInputError || isMutatingThisQuestion}
                onClick={createNewList}
              >
                {isMutatingThisQuestion ? (
                  <>
                    Processing
                    <Loader2 className="ml-1 animate-spin" />
                  </>
                ) : (
                  <>
                    <Plus />
                    Create
                  </>
                )}
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        {listId && (
          <AlertDialog
            open={isRemoveFromListDialogOpen}
            onOpenChange={(value) => {
              setIsRemoveFromListDialogOpen(value);
            }}
          >
            <AlertDialogTrigger asChild>
              <div className="flex-1">
                <Button className="mt-2 w-full cursor-pointer" variant="destructive">
                  <Trash2 />
                  Remove
                </Button>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-accent z-100011" overlayClassName="z-[100010] ">
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from this list</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="flex flex-col items-center justify-center">
                <p className="mb-1 w-full text-left text-sm">
                  Do you want to remove this question from this bookmark list.
                </p>

                <div className="flex w-full gap-2">
                  <AlertDialogCancel asChild>
                    <Button
                      className="mt-2 w-1/2 cursor-pointer"
                      variant="outline"
                      disabled={isMutatingThisQuestion}
                    >
                      Back
                    </Button>
                  </AlertDialogCancel>
                  <Button
                    className="mt-2 flex flex-1 cursor-pointer items-center justify-center gap-0"
                    disabled={isMutatingThisQuestion}
                    onClick={() => removeFromList({ listId })}
                  >
                    {isMutatingThisQuestion ? (
                      <>
                        Processing
                        <Loader2 className="ml-1 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Trash2 />
                        Remove from this list
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  },
);

BookmarkActionDialogs.displayName = "BookmarkActionDialogs";
