import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
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
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddToBookMarkCommandItem from "./AddToBookMarkCommandItem";
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

const BookmarkContext = createContext<BookmarkContextProps | null>(null);

const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmark must be used within BookmarkProvider");
  }
  return context;
};

export const BookmarkButton = ({
  bookmarks,
  questionId,
  isBookmarkDisabled,
  isBookmarksFetching,
  isBookmarkError,
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
  setIsPopoverOpen?: (open: boolean) => void;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  badgeClassName?: string;
  triggerButtonClassName?: string;
  isValidSession: boolean;
}) => {
  const [_open, _setOpen] = useState(false);
  const open = openProp ?? _open;
  const [newBookmarkListNameInput, setNewBookmarkListNameInput] = useState("");
  const [isInputError, setIsInputError] = useState(false);
  const [bookmarkListName, setBookmarkListName] = useState("");
  const [isAddNewListDialogOpen, setIsAddNewListDialogOpen] = useState(false);
  const [isBlockingInput, setIsBlockingInput] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  const chosenBookmarkListName = bookmarks.reduce((acc, bookmark) => {
    if (
      bookmark.userBookmarks.some(
        (bookmark) => bookmark.questionId === questionId
      )
    ) {
      return acc.add(bookmark.listName);
    }
    return acc;
  }, new Set<string>());

  const queryClient = useQueryClient();

  const mutationKey = ["all_user_bookmarks", questionId, bookmarkListName];

  const isMobileDevice = useIsMobile();

  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["all_user_bookmarks", questionId],
    }) > 0;

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
                " bookmark lists."
            );
          } else if (error.message.includes("bookmark")) {
            toast.error(
              "Failed to update bookmarks. You can only have maximum of " +
                MAXIMUM_BOOKMARKS_PER_LIST +
                " bookmarks per list."
            );
          }
        } else if (error.message.includes(DOES_NOT_EXIST)) {
          toast.error(
            `Failed to update bookmarks. The list ${variables.realBookmarkListName} does not exist.`
          );
        } else {
          toast.error("Failed to update bookmarks: " + error.message);
        }
      } else {
        toast.error("Failed to update bookmarks: Unknown error");
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
          " bookmark lists."
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
          " bookmarks per list."
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
      toast.error("Bookmark error. Please refresh the page.");
      return;
    }
    if (!isValidSession) {
      toast.error("Please sign in to bookmark questions.");
      return;
    }
    setIsBlockingInput(true);
    setTimeout(() => {
      setIsBlockingInput(false);
    }, 100);
    setOpen(true);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }

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
    <BookmarkContext.Provider
      value={{
        open,
        setOpen,
        onListSelect,
        isBlockingInput,
        badgeClassName,
        triggerButtonClassName,
        setIsBlockingInput,
        isMutatingThisQuestion,
        searchInput,
        setSearchInput,
        isBookmarksFetching,
        bookmarks,
        isBookmarkDisabled,
        questionId,
        chosenBookmarkListName,
        scrollAreaRef,
        searchInputRef,
        createNewList,
        openUI,
      }}
    >
      <Command onKeyDown={handleKeyDown}>
        {isMobileDevice ? (
          <>
            <BookmarkTrigger />

            <Drawer onOpenChange={setOpen} open={open}>
              <DrawerContent
                className="z-[100007] h-[95vh] max-h-[95vh]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                  onTouchStart={() => {
                    setIsBlockingInput(true);
                  }}
                >
                  <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-muted pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
                </div>

                <div
                  className="flex flex-row gap-3 p-2 "
                  onTouchEnd={() => {
                    setTimeout(() => {
                      setIsBlockingInput(false);
                    }, 0);
                  }}
                  onTouchStart={() => {
                    setIsBlockingInput(true);
                  }}
                >
                  <Button
                    className="flex-1/3 cursor-pointer"
                    onClick={() => {
                      setOpen(false);
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
          <Popover modal={false} open={open}>
            <PopoverTrigger asChild>
              <div>
                <BookmarkTrigger />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="h-full z-[100006] w-[250px] !px-0"
              onClick={(e) => e.stopPropagation()}
              align="end"
            >
              <X
                className="absolute top-1 right-1 cursor-pointer"
                onClick={() => setOpen(false)}
                size={15}
              />
              <BookmarkList />
            </PopoverContent>
          </Popover>
        )}
      </Command>

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
          className="z-[100008]"
          overlayClassName="z-[100007]"
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
    </BookmarkContext.Provider>
  );
};

const BookmarkTrigger = () => {
  const {
    isMutatingThisQuestion,
    badgeClassName,
    openUI,
    chosenBookmarkListName,
    triggerButtonClassName,
    isBookmarksFetching,
    isBookmarkDisabled,
  } = useBookmark();
  return (
    <>
      {isMutatingThisQuestion ? (
        <Badge
          className={cn(
            "absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black rounded-[3px] min-h-[28px]",
            badgeClassName
          )}
          onClick={(e) => {
            openUI(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          Saving
          <Loader2 className="animate-spin" />
        </Badge>
      ) : (
        <Button
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
          onClick={(e) => {
            openUI(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
        >
          {isBookmarksFetching ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Bookmark size={10} />
          )}
        </Button>
      )}
    </>
  );
};

const BookmarkList = () => {
  const {
    searchInput,
    setSearchInput,
    isBlockingInput,
    scrollAreaRef,
    searchInputRef,
    setIsBlockingInput,
    chosenBookmarkListName,
    onListSelect,
    bookmarks,
    questionId,
  } = useBookmark();

  return (
    <div>
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
      <CommandList
        className="w-full"
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
        <ScrollArea
          viewportRef={scrollAreaRef}
          className=" h-[200px] [&_.bg-border]:bg-logo-main/50"
          type="always"
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
                      <AddToBookMarkCommandItem
                        key={bookmark.listName}
                        inputRef={searchInputRef}
                        inputValue={searchInput}
                        setIsBlockingInput={setIsBlockingInput}
                        onSelect={() =>
                          onListSelect({
                            bookmark,
                            isItemBookmarked: true,
                          })
                        }
                        isItemBookmarked={true}
                        listName={bookmark.listName}
                        isPlaceholder={true}
                        questionId={questionId}
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
                    <AddToBookMarkCommandItem
                      key={bookmark.listName}
                      inputRef={searchInputRef}
                      inputValue={searchInput}
                      setIsBlockingInput={setIsBlockingInput}
                      onSelect={() =>
                        onListSelect({ bookmark, isItemBookmarked })
                      }
                      isItemBookmarked={isItemBookmarked}
                      listName={bookmark.listName}
                      questionId={questionId}
                      visibility={bookmark.visibility}
                    />
                  );
                })}
              </>
            )}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </div>
  );
};
