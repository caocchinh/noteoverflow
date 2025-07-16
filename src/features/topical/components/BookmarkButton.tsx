import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type KeyboardEvent,
  memo,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Globe, Loader2, Lock, Plus, X } from "lucide-react";
import { Bookmark } from "lucide-react";
import {
  createBookmarkListAction,
  removeBookmarkAction,
} from "../server/actions";
import { addBookmarkAction } from "../server/actions";
import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookmarkContextProps, SelectedBookmark } from "../constants/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DOES_NOT_EXIST,
  LIMIT_EXCEEDED,
  MAXIMUM_BOOKMARK_LISTS_PER_USER,
  MAXIMUM_BOOKMARKS_PER_LIST,
} from "@/constants/constants";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import createBookmarkStore, {
  BookmarkState,
  BookmarkStore,
} from "../store/useBookmark";
import { createContext, useContext } from "react";
import { useStore } from "zustand";

const BookmarkContext = createContext<BookmarkStore | null>(null);

function useBookmarkContext<T>(selector: (state: BookmarkState) => T): T {
  const store = useContext(BookmarkContext);
  if (!store) throw new Error("Missing BookmarkContext.Provider in the tree");
  return useStore(store, selector);
}

export const BookmarkButton = memo(
  ({
    bookmarks,
    questionId,
    isBookmarkDisabled,
    isBookmarksFetching,
    isBookmarkError,
    popOverAlign = "end",
    badgeClassName,
    isPopoverOpen: openProp,
    setIsPopoverOpen: setOpenProp,
    triggerButtonClassName,
    isValidSession,
  }: {
    bookmarks: SelectedBookmark;
    questionId: string;
    isBookmarkDisabled: boolean;
    isPopoverOpen?: boolean;
    popOverAlign?: "start" | "end";
    setIsPopoverOpen?: (open: boolean) => void;
    isBookmarksFetching: boolean;
    isBookmarkError: boolean;
    badgeClassName?: string;
    triggerButtonClassName?: string;
    isValidSession: boolean;
  }) => {
    const bookmarkStore = useRef(
      createBookmarkStore({
        isBookmarksFetching,
        isBookmarkDisabled,
        isBookmarkError,
        isValidSession,
        questionId,
        bookmarks,
        badgeClassName,
        triggerButtonClassName,
      })
    ).current;

    const queryClient = useQueryClient();

    const mutationKey = ["all_user_bookmarks", questionId, bookmarkListName];

    const isMobileDevice = useIsMobile();

    const chosenBookmarkListName = useMemo(() => {
      const set = new Set<string>();
      for (const bookmark of bookmarks) {
        if (bookmark.userBookmarks.some((b) => b.questionId === questionId)) {
          set.add(bookmark.listName);
        }
      }
      return set;
    }, [bookmarks, questionId]);

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
            throw new Error(result.error + "list");
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
            throw new Error(result.error + "bookmark");
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
              const newBookmarks = [...prev];
              chosenBookmarkListName.add(newBookmarkListName);
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
            };

            if (isCreateNew) {
              const isListAlreadyExist = prev.some(
                (bookmark) => bookmark.listName === newBookmarkListName
              );

              setIsAddNewListDialogOpen(false);
              setIsInputError(false);
              setNewBookmarkListNameInput("");
              scrollAreaRef.current?.scrollTo({
                top: 0,
              });
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
                  visibility: "private",
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
              chosenBookmarkListName.delete(newBookmarkListName);
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
            ? `Question removed from ${newBookmarkListName}`
            : `Question added to ${newBookmarkListName}`,
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
      },
      onError: (error, variables) => {
        if (error instanceof Error) {
          if (error.message.includes(LIMIT_EXCEEDED)) {
            if (error.message.includes("list")) {
              toast.error(
                "Failed to update bookmarks. You can only have maximum of " +
                  MAXIMUM_BOOKMARK_LISTS_PER_USER +
                  " bookmark lists.",
                {
                  duration: 2000,
                  position: isMobileDevice ? "top-center" : "bottom-right",
                }
              );
            } else if (error.message.includes("bookmark")) {
              toast.error(
                "Failed to update bookmarks. You can only have maximum of " +
                  MAXIMUM_BOOKMARKS_PER_LIST +
                  " bookmarks per list.",
                {
                  duration: 2000,
                  position: isMobileDevice ? "top-center" : "bottom-right",
                }
              );
            }
          } else if (error.message.includes(DOES_NOT_EXIST)) {
            toast.error(
              `Failed to update bookmarks. The list ${variables.realBookmarkListName} does not exist.`,
              {
                duration: 2000,
                position: isMobileDevice ? "top-center" : "bottom-right",
              }
            );
          } else {
            toast.error("Failed to update bookmarks: " + error.message, {
              duration: 2000,
              position: isMobileDevice ? "top-center" : "bottom-right",
            });
          }
        } else {
          toast.error("Failed to update bookmarks: Unknown error", {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          });
        }
      },
    });

    const createNewList = () => {
      if (
        newBookmarkListNameInput.trim() === "" ||
        newBookmarkListNameInput.length > 100
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
      setBookmarkListName(newBookmarkListNameInput.trim());
      setTimeout(() => {
        updateBookmarkMutation.mutate({
          realQuestionId: questionId,
          realBookmarkListName: newBookmarkListNameInput.trim(),
          isRealBookmarked: false,
          isCreateNew: true,
        });
      }, 0);
    };

    const onListSelect = ({
      bookmark,
      isItemBookmarked,
    }: {
      bookmark: SelectedBookmark[number];
      isItemBookmarked: boolean;
    }) => {
      if (bookmark.listName.trim() === "") {
        toast.error("Failed to update bookmarks: Bad Request.");
        return;
      }
      if (bookmark.userBookmarks.length >= MAXIMUM_BOOKMARKS_PER_LIST) {
        toast.error(
          "Failed to update bookmarks. You can only have maximum of " +
            MAXIMUM_BOOKMARKS_PER_LIST +
            " bookmarks per list.",
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
        return;
      }
      setBookmarkListName(bookmark.listName);
      setTimeout(() => {
        updateBookmarkMutation.mutate({
          realQuestionId: questionId,
          realBookmarkListName: bookmark.listName,
          isRealBookmarked: isItemBookmarked,
          isCreateNew: false,
        });
      }, 0);
    };

    const openUI = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isBookmarkDisabled || isBookmarksFetching) {
        return;
      }
      if (isBookmarkError) {
        toast.error("Bookmark error. Please refresh the page.", {
          duration: 2000,
          position: isMobileDevice ? "top-center" : "bottom-right",
        });
        return;
      }
      if (!isValidSession) {
        toast.error("Please sign in to bookmark questions.", {
          duration: 2000,
          position: isMobileDevice ? "top-center" : "bottom-right",
        });
        return;
      }
      setIsBlockingInput(true);
      setTimeout(() => {
        setIsBlockingInput(false);
      }, 0);
      setOpen(true);
    };

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          if (searchInput) {
            setSearchInput("");
            return;
          }
          searchInputRef.current?.blur();
          if (open) {
            setOpen(false);
          }
        }
      },
      [open, searchInput, setOpen]
    );

    return (
      <BookmarkContext.Provider value={bookmarkStore}>
        <Command
          onKeyDown={handleKeyDown}
          className=" bg-transparent overflow-visible !w-max"
        >
          {isMobileDevice ? (
            <>
              <BookmarkTrigger />
              <Drawer
                onOpenChange={(open) => {
                  bookmarkStore.getState().actions.setOpen(open);
                }}
                open={bookmarkStore.getState().open}
              >
                <DrawerContent
                  className="z-[100007] h-[95vh] max-h-[95vh] dark:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <DrawerHeader className="sr-only">
                    <DrawerTitle>Select</DrawerTitle>
                    <DrawerDescription />
                    Save to book mark list
                  </DrawerHeader>
                  <div
                    className="w-full pt-2 pb-4"
                    onTouchEnd={() => {
                      setTimeout(() => {
                        bookmarkStore
                          .getState()
                          .actions.setIsBlockingInput(false);
                      }, 0);
                    }}
                    onTouchStart={() => {
                      bookmarkStore.getState().actions.setIsBlockingInput(true);
                    }}
                  >
                    <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
                  </div>

                  <div
                    className="flex flex-row gap-3 p-2 "
                    onTouchEnd={() => {
                      setTimeout(() => {
                        bookmarkStore
                          .getState()
                          .actions.setIsBlockingInput(false);
                      }, 0);
                    }}
                    onTouchStart={() => {
                      bookmarkStore.getState().actions.setIsBlockingInput(true);
                    }}
                  >
                    <Button
                      className="flex-1/3 cursor-pointer mb-4"
                      onClick={() => {
                        bookmarkStore.getState().actions.setOpen(false);
                      }}
                      variant="outline"
                    >
                      Close
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <BookmarkList />
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <Popover
              modal={true}
              open={bookmarkStore.getState().open}
              onOpenChange={bookmarkStore.getState().actions.setOpen}
            >
              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                <BookmarkTrigger />
              </PopoverTrigger>
              <PopoverContent
                className="h-full z-[100006] w-[250px] !px-0 dark:bg-accent"
                onClick={(e) => e.stopPropagation()}
                align={popOverAlign}
              >
                <X
                  className="absolute top-1 right-1 cursor-pointer"
                  onClick={() =>
                    bookmarkStore.getState().actions.setOpen(false)
                  }
                  size={15}
                />
                <BookmarkList />
              </PopoverContent>
            </Popover>
          )}
        </Command>
      </BookmarkContext.Provider>
    );
  }
);

BookmarkButton.displayName = "BookmarkButton";

const BookmarkTrigger = forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => {
  const badgeClassName = useBookmarkContext((state) => state.badgeClassName);
  const triggerButtonClassName = useBookmarkContext(
    (state) => state.triggerButtonClassName
  );
  const isBookmarksFetching = useBookmarkContext(
    (state) => state.isBookmarksFetching
  );
  const isBookmarkDisabled = useBookmarkContext(
    (state) => state.isBookmarkDisabled
  );
  const questionId = useBookmarkContext((state) => state.questionId);
  const chosenBookmarkListName = useBookmarkContext(
    (state) => state.chosenBookmarkListName
  );
  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["all_user_bookmarks", questionId],
    }) > 0;
  const setOpen = useBookmarkContext((state) => state.actions.setOpen);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
      (
        props.onClick as
          | ((event: React.MouseEvent<Element>) => void)
          | undefined
      )?.(e);

      setOpen(true);
    },
    [props.onClick, setOpen]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement | HTMLDivElement>) => {
      (
        props.onTouchStart as
          | ((event: React.TouchEvent<Element>) => void)
          | undefined
      )?.(e);
      e.stopPropagation();
    },
    [props.onTouchStart]
  );

  if (isMutatingThisQuestion) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _omitVariant, ...badgeProps } = props;

    return (
      <Badge
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black rounded-[3px] min-h-[28px]",
          badgeClassName
        )}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        {...badgeProps}
      >
        Saving
        <Loader2 className="animate-spin" />
      </Badge>
    );
  }

  return (
    <Button
      ref={ref}
      className={cn(
        triggerButtonClassName,
        "rounded-[3px]",
        chosenBookmarkListName.size > 0 && "!bg-logo-main !text-white",
        (isBookmarkDisabled || isBookmarksFetching) && "opacity-50"
      )}
      title={
        chosenBookmarkListName.size > 0
          ? "Remove from bookmarks"
          : "Add to bookmarks"
      }
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      disabled={isBookmarkDisabled || isBookmarksFetching}
      {...props}
    >
      {isBookmarksFetching ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Bookmark size={10} />
      )}
    </Button>
  );
});

BookmarkTrigger.displayName = "BookmarkTrigger";

const BookmarkSearchInput = () => {
  const setSearchInput = useBookmarkContext(
    (state) => state.actions.setSearchInput
  );
  const isBlockingInput = useBookmarkContext((state) => state.isBlockingInput);
  const searchInputRef = useBookmarkContext((state) => state.searchInputRef);
  const searchInput = useBookmarkContext((state) => state.searchInput);
  return (
    <CommandInput
      placeholder="Search bookmark lists"
      wrapperClassName="border-b border-border mb-2 p-2 pb-5"
      onClick={(e) => {
        e.currentTarget.focus();
      }}
      value={searchInput}
      ref={searchInputRef}
      onValueChange={setSearchInput}
      readOnly={isBlockingInput}
      onDoubleClick={(e) => {
        e.currentTarget.select();
      }}
    />
  );
};

const BookmarkList = () => {
  const searchInput = useBookmarkContext((state) => state.searchInput);
  const scrollAreaRef = useBookmarkContext((state) => state.scrollAreaRef);
  const setIsBlockingInput = useBookmarkContext(
    (state) => state.actions.setIsBlockingInput
  );
  const chosenBookmarkListName = useBookmarkContext(
    (state) => state.chosenBookmarkListName
  );
  const onListSelect = useBookmarkContext((state) => state.onListSelect);
  const bookmarks = useBookmarkContext((state) => state.bookmarks);
  const questionId = useBookmarkContext((state) => state.questionId);
  console.log("rerendering");

  return (
    <div className="h-full flex flex-col mb-2 md:mb-0">
      <BookmarkSearchInput />
      <ScrollArea
        viewportRef={scrollAreaRef}
        className="h-[60%] md:h-[200px] [&_.bg-border]:bg-logo-main/50"
        type="always"
      >
        <CommandList
          className="w-full h-max flex flex-col"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={() => {
            setTimeout(() => {
              if (!searchInput) {
                setIsBlockingInput(false);
              }
            }, 0);
          }}
          onTouchStart={() => {
            if (!searchInput) {
              setIsBlockingInput(true);
            }
          }}
        >
          <CommandEmpty>No lists found.</CommandEmpty>
          <Collapsible>
            {!searchInput && (
              <CollapsibleTrigger
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3"
                onTouchStart={() => {
                  setIsBlockingInput(false);
                }}
                title="Toggle selected"
              >
                <h3
                  className={cn(
                    "font-medium text-xs",
                    chosenBookmarkListName.size > 0
                      ? "text-logo-main"
                      : "text-muted-foreground"
                  )}
                >
                  {`${chosenBookmarkListName.size} selected`}
                </h3>
                <ChevronsUpDown className="h-4 w-4" />
              </CollapsibleTrigger>
            )}
            <CommandGroup value={`${chosenBookmarkListName.size} selected`}>
              <CollapsibleContent>
                {chosenBookmarkListName.size > 0 &&
                  !searchInput &&
                  bookmarks
                    .filter((bookmark) =>
                      chosenBookmarkListName.has(bookmark.listName)
                    )
                    .map((bookmark) => (
                      <BookmarkItem
                        key={bookmark.listName}
                        onSelect={() =>
                          onListSelect({
                            bookmark,
                            isItemBookmarked: true,
                          })
                        }
                        listName={bookmark.listName}
                        isPlaceholder={true}
                        visibility={bookmark.visibility}
                      />
                    ))}
              </CollapsibleContent>
            </CommandGroup>
          </Collapsible>
          <CommandSeparator />

          <CommandGroup
            heading={searchInput.length > 0 ? "Search result" : "Save to"}
          >
            {bookmarks.length > 0 && (
              <>
                {bookmarks.map((bookmark) => {
                  const isItemBookmarked = bookmark.userBookmarks.some(
                    (bookmark) => bookmark.questionId === questionId
                  );

                  return (
                    <BookmarkItem
                      key={bookmark.listName}
                      onSelect={() =>
                        onListSelect({ bookmark, isItemBookmarked })
                      }
                      listName={bookmark.listName}
                      visibility={bookmark.visibility}
                      isPlaceholder={false}
                    />
                  );
                })}
              </>
            )}
          </CommandGroup>
        </CommandList>
      </ScrollArea>
      <CreateNewListAlertDialog />
    </div>
  );
};

const BookmarkItem = ({
  listName,
  visibility,
  isPlaceholder,
  onSelect,
}: {
  listName: string;
  visibility: "public" | "private";
  isPlaceholder: boolean;
  onSelect: () => void;
}) => {
  const {
    questionId,
    searchInputRef,
    setIsBlockingInput,
    chosenBookmarkListName,
    searchInput,
  } = useBookmark();
  const isMutatingThisQuestionInThisList =
    useIsMutating({
      mutationKey: ["all_user_bookmarks", questionId, listName],
    }) > 0;
  return (
    <CommandItem
      className={cn(
        "cursor-pointer wrap-anywhere flex items-center justify-between",
        isMutatingThisQuestionInThisList && "opacity-50 cursor-default"
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchEnd={() => {
        setTimeout(() => {
          searchInputRef.current?.focus();
          setIsBlockingInput(false);
        }, 0);
      }}
      onTouchStart={() => {
        if (!searchInput && isPlaceholder) {
          setIsBlockingInput(true);
        } else if (!isPlaceholder && !searchInput) {
          setIsBlockingInput(true);
        }
      }}
      onSelect={(e) => {
        if (!isPlaceholder) {
          if (!searchInput) {
            setIsBlockingInput(true);
            setTimeout(() => {
              setIsBlockingInput(false);
            }, 0);
          }
        } else {
          setIsBlockingInput(true);
          setTimeout(() => {
            setIsBlockingInput(false);
          }, 0);
        }
        if (isMutatingThisQuestionInThisList) {
          return;
        }
        // onSelect();
      }}
    >
      <div className="flex items-center justify-start gap-2">
        <Checkbox
          checked={chosenBookmarkListName.has(listName)}
          className="data-[state=checked]:!bg-logo-main "
        />
        {listName}
        {isPlaceholder && <span className="sr-only">skibidi toilet</span>}
        {isMutatingThisQuestionInThisList && (
          <Loader2 className="animate-spin" />
        )}
      </div>
      {visibility === "private" ? (
        <Lock className="w-4 h-4" />
      ) : (
        <Globe className="w-4 h-4" />
      )}
    </CommandItem>
  );
};

const CreateNewListAlertDialog = () => {
  const {
    isAddNewListDialogOpen,
    setIsAddNewListDialogOpen,
    newBookmarkListNameInput,
    setNewBookmarkListNameInput,
    isInputError,
    setIsInputError,
    createNewList,
    isMutatingThisQuestion,
  } = useBookmark();

  return (
    <AlertDialog
      open={isAddNewListDialogOpen}
      onOpenChange={setIsAddNewListDialogOpen}
    >
      <AlertDialogTrigger asChild>
        <div className="px-2 w-full">
          <Button className="w-full mt-2 cursor-pointer" variant="outline">
            <Plus /> New list
          </Button>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="z-[100008] dark:bg-accent"
        overlayClassName="z-[100007] "
      >
        <AlertDialogHeader>
          <AlertDialogTitle>New list</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex items-center justify-center gap-2">
          <Input
            onChange={(e) => {
              if (e.target.value.length > 100) {
                setIsInputError(true);
              } else {
                setIsInputError(false);
              }
              setNewBookmarkListNameInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createNewList();
              }
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
              setIsInputError(false);
            }}
            size={20}
          />
        </div>
        {isInputError && (
          <p className="text-red-500 text-xs mt-1 text-center">
            Please enter valid a list name. Max 100 characters.
          </p>
        )}
        <div className="flex gap-2 w-full">
          <AlertDialogCancel asChild>
            <Button className="w-1/2 mt-2 cursor-pointer" variant="outline">
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
  );
};
