import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Plus, X } from "lucide-react";
import { Bookmark } from "lucide-react";
import {
  createBookmarkListAction,
  removeBookmarkAction,
} from "../server/actions";
import { addBookmarkAction } from "../server/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectedBookmark } from "../constants/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export const BookmarkButton = ({
  bookmarks,
  questionId,
  isBookmarkDisabled,
  isBookmarksFetching,
  isBookmarkError,
  isPopoverOpen: openProp,
  setIsPopoverOpen: setOpenProp,
  className,
  isValidSession,
}: {
  bookmarks: SelectedBookmark;
  questionId: string;
  isBookmarkDisabled: boolean;
  isPopoverOpen?: boolean;
  setIsPopoverOpen?: (open: boolean) => void;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  className?: string;
  isValidSession: boolean;
}) => {
  const [currentTab, setCurrentTab] = useState("add-existing");
  const [_open, _setOpen] = useState(false);
  const open = openProp ?? _open;
  const [newBookmarkListNameInput, setNewBookmarkListNameInput] = useState("");
  const [isInputError, setIsInputError] = useState(false);

  const setOpen = useCallback(
    (value: boolean | ((_value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      if (!openState) {
        setNewBookmarkListNameInput("");
      }
    },
    [setOpenProp, open]
  );

  const isBookmarked = useMemo(() => {
    if (bookmarks && bookmarks.length > 0) {
      return bookmarks.some((bookmark) =>
        bookmark.userBookmarks?.some(
          (bookmark) => bookmark.questionId === questionId
        )
      );
    }
    return false;
  }, [bookmarks, questionId]);
  const queryClient = useQueryClient();

  const mutationKey = ["all_user_bookmarks", questionId];

  const updateBookmarkMutation = useMutation({
    mutationKey: mutationKey,
    mutationFn: async ({
      realQuestionId,
      realBookmarkListName,
      isRealBookmarked,
      isCreateNew,
    }: {
      realQuestionId: string;
      isRealBookmarked: boolean;
      realBookmarkListName: string;
      isCreateNew: boolean;
    }): Promise<{
      userId: string;
      realQuestionId: string;
      realBookmarkListName: string;
      isRealBookmarked: boolean;
      isCreateNew: boolean;
    }> => {
      if (isCreateNew) {
        const result = await createBookmarkListAction({
          listName: realBookmarkListName,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      if (isRealBookmarked) {
        const result = await removeBookmarkAction({
          questionId: realQuestionId,
          bookmarkListName: realBookmarkListName,
        });
        return {
          userId: result.data!,
          realQuestionId: realQuestionId,
          realBookmarkListName: realBookmarkListName,
          isRealBookmarked: true,
          isCreateNew: isCreateNew,
        };
      } else {
        const result = await addBookmarkAction({
          questionId: realQuestionId,
          bookmarkListName: realBookmarkListName,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
        return {
          userId: result.data!,
          realQuestionId: realQuestionId,
          realBookmarkListName: realBookmarkListName,
          isRealBookmarked: false,
          isCreateNew: isCreateNew,
        };
      }
    },
    onSuccess: ({
      realQuestionId: newQuestionId,
      isRealBookmarked,
      realBookmarkListName: newBookmarkListName,
      isCreateNew,
      userId,
    }: {
      realQuestionId: string;
      isRealBookmarked: boolean;
      realBookmarkListName: string;
      isCreateNew: boolean;
      userId: string;
    }) => {
      queryClient.setQueryData<SelectedBookmark>(
        ["all_user_bookmarks"],
        (prev: SelectedBookmark | undefined) => {
          if (!prev) {
            return prev;
          }

          const addNewBookmark = () => {
            const isBookmarkedDoubleCheck = prev[
              prev.findIndex(
                (bookmark) => bookmark.listName === newBookmarkListName
              )
            ].userBookmarks?.some(
              (bookmark) => bookmark.questionId === questionId
            );
            if (!isBookmarkedDoubleCheck) {
              const newBookmarks = [...prev];
              newBookmarks[
                prev.findIndex(
                  (bookmark) => bookmark.listName === newBookmarkListName
                )
              ].userBookmarks.push({
                questionId: newQuestionId,
                updatedAt: new Date(),
                userId,
                listName: newBookmarkListName,
              });
              return newBookmarks;
            }
          };

          if (isCreateNew) {
            const isListAlreadyExist = prev.some(
              (bookmark) => bookmark.listName === newBookmarkListName
            );
            if (isListAlreadyExist) {
              return addNewBookmark();
            }
            return [
              ...prev,
              {
                createdAt: new Date(),
                updatedAt: new Date(),
                userId,
                listName: newBookmarkListName,
                userBookmarks: [
                  {
                    questionId: newQuestionId,
                    updatedAt: new Date(),
                    userId,
                    listName: newBookmarkListName,
                  },
                ],
              },
            ];
          } else if (!isCreateNew && !isRealBookmarked) {
            return addNewBookmark();
          } else if (!isCreateNew && isRealBookmarked) {
            return prev.map((oldBookmarkList) => {
              if (oldBookmarkList.listName === newBookmarkListName) {
                return {
                  ...oldBookmarkList,
                  userBookmarks: oldBookmarkList.userBookmarks.filter(
                    (oldBookmark) => oldBookmark.questionId !== newQuestionId
                  ),
                };
              }
              return oldBookmarkList;
            });
          }
        }
      );

      toast.success(
        isRealBookmarked
          ? "Question removed from bookmarks."
          : "Question added to bookmarks.",
        {
          duration: 2000,
        }
      );
    },
    onError: (error) => {
      toast.error(
        "Failed to update bookmarks: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            className,
            "rounded-[3px]",
            isBookmarked && "!bg-logo-main !text-white "
          )}
          disabled={isBookmarkDisabled || isBookmarksFetching}
          title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isBookmarkError) {
              toast.error("Bookmark error. Please refresh the page.");
              return;
            }
            if (!isValidSession) {
              toast.error("Please sign in to bookmark questions.");
              return;
            }
            setOpen(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {isBookmarksFetching ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Bookmark size={10} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full h-full z-[100006] !px-0"
        onClick={(e) => e.stopPropagation()}
      >
        <X
          className="absolute top-1 right-1 cursor-pointer"
          onClick={() => setOpen(false)}
          size={15}
        />
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsContent value="add-existing">
            <Command>
              <CommandInput
                placeholder="Search bookmark lists"
                wrapperClassName="border-b border-border p-1 pb-2 px-2"
                onClick={(e) => {
                  e.currentTarget.focus();
                }}
                onDoubleClick={(e) => {
                  e.currentTarget.select();
                }}
              />
              <CommandList className="w-full h-[200px]">
                <ScrollArea>
                  <CommandEmpty>No lists found.</CommandEmpty>
                  <CommandGroup heading="Save to">
                    {bookmarks.length > 0 && (
                      <>
                        {bookmarks.map((bookmark) => {
                          const isItemBookmarked = bookmark.userBookmarks.some(
                            (bookmark) => bookmark.questionId === questionId
                          );
                          return (
                            <CommandItem
                              key={bookmark.listName}
                              className="cursor-pointer flex items-center justify-start"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onSelect={() => {
                                updateBookmarkMutation.mutate({
                                  realQuestionId: questionId,
                                  realBookmarkListName: bookmark.listName,
                                  isRealBookmarked: isItemBookmarked,
                                  isCreateNew: false,
                                });
                              }}
                            >
                              <Checkbox
                                checked={isItemBookmarked}
                                className="data-[state=checked]:!bg-logo-main"
                              />
                              {bookmark.listName}
                            </CommandItem>
                          );
                        })}
                      </>
                    )}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
            <div className="px-2 w-full">
              <Button
                onClick={() => setCurrentTab("add-new")}
                className="w-full mt-2 cursor-pointer"
                variant="outline"
              >
                <Plus /> New list
              </Button>
            </div>
          </TabsContent>
          <TabsContent
            value="add-new"
            className="flex flex-col items-center w-full justify-center gap-2 px-4"
          >
            <h3 className="w-full text-left">New list</h3>
            <Input
              onChange={(e) => {
                setNewBookmarkListNameInput(e.target.value);
                setIsInputError(false);
              }}
              value={newBookmarkListNameInput}
              placeholder="e.g. Super hard questions"
            />
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => setCurrentTab("add-existing")}
                className="w-1/2 mt-2 cursor-pointer"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 mt-2 cursor-pointer flex items-center gap-0 justify-center "
                onClick={() => {
                  if (newBookmarkListNameInput.trim() === "") {
                    setIsInputError(true);
                    return;
                  }
                  updateBookmarkMutation.mutate({
                    realQuestionId: questionId,
                    realBookmarkListName: newBookmarkListNameInput.trim(),
                    isRealBookmarked: false,
                    isCreateNew: true,
                  });
                }}
              >
                Create <Plus />
              </Button>
            </div>
            {isInputError && (
              <p className="text-red-500 text-xs mt-1">
                Please enter valid a list name.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
