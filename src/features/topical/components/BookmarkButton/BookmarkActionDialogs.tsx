import { memo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsMutating } from "@tanstack/react-query";
import { SelectVisibility } from "../SelectVisibility";
import { MAXIMUM_BOOKMARK_LISTS_PER_USER } from "@/constants/constants";
import { LIST_NAME_MAX_LENGTH } from "../../constants/constants";
import { BookmarkActionDialogsProps } from "../../constants/types";

export const BookmarkActionDialogs = memo(
  ({
    isAddNewListDialogOpen,
    setIsAddNewListDialogOpen,
    newBookmarkListNameInput,
    setNewBookmarkListNameInput,
    isInputError,
    setIsInputError,
    bookmarks,
    question,
    visibility,
    setVisibility,
    mutate,
    chosenBookmarkList,
    listId,
    isRemoveFromListDialogOpen,
    setIsRemoveFromListDialogOpen,
    searchInputRef,
  }: BookmarkActionDialogsProps) => {
    const isMobileDevice = useIsMobile();
    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: ["user_saved_activities", "bookmarks", question.id],
      }) > 0;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isBlockingDialogInput, setIsBlockingDialogInput] = useState(false);

    const createNewList = () => {
      setIsBlockingDialogInput(true);

      if (
        newBookmarkListNameInput.trim() === "" ||
        newBookmarkListNameInput.length > LIST_NAME_MAX_LENGTH
      ) {
        setIsInputError(true);
        return;
      }
      if (bookmarks.length >= MAXIMUM_BOOKMARK_LISTS_PER_USER) {
        toast.error(
          "Failed to update bookmarks. You can only have maximum of " +
            MAXIMUM_BOOKMARK_LISTS_PER_USER +
            " bookmark lists.",
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
        return;
      }
      setNewBookmarkListNameInput(newBookmarkListNameInput.trim());
      setTimeout(() => {
        mutate?.({
          realQuestion: question,
          realListId: "",
          realBookmarkListName: newBookmarkListNameInput.trim(),
          isRealBookmarked: false,
          isCreateNew: true,
          realVisibility: visibility,
        });
        setIsBlockingDialogInput(false);
      }, 0);
    };

    const removeFromList = ({ listId }: { listId: string }) => {
      const list = bookmarks.find((bookmark) => bookmark.id === listId);
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
      mutate?.({
        realQuestion: question,
        realListId: listId,
        realBookmarkListName: list.listName,
        isRealBookmarked: true,
        isCreateNew: false,
        realVisibility: list.visibility as "public" | "private",
      });
    };

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
              <Button className="w-full mt-2 cursor-pointer" variant="outline">
                <Plus /> New list
              </Button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="z-[100011] dark:bg-accent"
            overlayClassName="z-[100010] "
          >
            <AlertDialogHeader>
              <AlertDialogTitle>New list</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex items-center justify-center flex-col">
              <p className="text-sm w-full text-left mb-1">List name</p>
              <div className="flex items-center justify-center gap-2 w-full">
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
                    isMutatingThisQuestion && "opacity-50"
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
              <p className="text-sm w-full text-left mt-3 mb-1">Visibility</p>
              <div className="flex items-center justify-center gap-2 w-full">
                <SelectVisibility
                  isMutatingThisQuestion={isMutatingThisQuestion}
                  visibility={visibility}
                  setVisibility={setVisibility}
                />
              </div>
            </div>
            {isInputError && (
              <p className="text-red-500 text-xs mt-1 text-center">
                Please enter valid a list name. Max {LIST_NAME_MAX_LENGTH}{" "}
                characters.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1 text-left">
              If list name with the same visibility already exists, the question
              will be added to the list.
            </p>
            <div className="flex gap-2 w-full">
              <AlertDialogCancel asChild>
                <Button
                  className="w-1/2 mt-2 cursor-pointer"
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
                className="flex-1 mt-2 cursor-pointer flex items-center gap-0 justify-center "
                disabled={isInputError || isMutatingThisQuestion}
                onClick={createNewList}
              >
                {isMutatingThisQuestion ? (
                  <>
                    Processing
                    <Loader2 className="animate-spin ml-1" />
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
                <Button
                  className="w-full mt-2 cursor-pointer"
                  variant="destructive"
                >
                  <Trash2 />
                  Remove
                </Button>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="z-[100011] dark:bg-accent"
              overlayClassName="z-[100010] "
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from this list</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="flex items-center justify-center flex-col">
                <p className="text-sm w-full text-left mb-1">
                  Do you want to remove this question from this bookmark list.
                </p>

                <div className="flex gap-2 w-full">
                  <AlertDialogCancel asChild>
                    <Button
                      className="w-1/2 mt-2 cursor-pointer"
                      variant="outline"
                    >
                      Back
                    </Button>
                  </AlertDialogCancel>
                  <Button
                    className="flex-1 mt-2 cursor-pointer flex items-center gap-0 justify-center "
                    disabled={isMutatingThisQuestion}
                    onClick={() => removeFromList({ listId })}
                  >
                    {isMutatingThisQuestion ? (
                      <>
                        Processing
                        <Loader2 className="animate-spin ml-1" />
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
  }
);

BookmarkActionDialogs.displayName = "BookmarkActionDialogs";
