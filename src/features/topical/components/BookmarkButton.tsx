import React, {
  useCallback,
  useRef,
  type KeyboardEvent,
  memo,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronsUpDown,
  Globe,
  Loader2,
  Lock,
  Plus,
  Trash2,
  X,
  XIcon,
} from "lucide-react";
import { Bookmark } from "lucide-react";
import {
  createBookmarkListAndAddBookmarkAction,
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
import {
  SavedActivitiesResponse,
  SelectedBookmark,
  SelectedQuestion,
} from "../constants/types";
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
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import createBookmarkStore, {
  BookmarkState,
  BookmarkStore,
} from "../store/useBookmark";
import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { LIST_NAME_MAX_LENGTH } from "../constants/constants";
import { SelectVisibility } from "./SelectVisibility";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

const BookmarkContext = createContext<BookmarkStore | null>(null);

function useBookmarkContext<T>(selector: (state: BookmarkState) => T): T {
  const store = useContext(BookmarkContext);
  if (!store) throw new Error("Missing BookmarkContext.Provider in the tree");
  return useStore(store, selector);
}

export const BookmarkButton = memo(
  ({
    question,
    isBookmarkDisabled,
    isPopoverOpen: openProp,
    setIsPopoverOpen: setOpenProp,
    setIsHovering,
    setShouldOpen,
    popOverAlign = "end",
    listId,
    badgeClassName,
    popOverTriggerClassName,
    triggerButtonClassName,
    isValidSession,
    isInView,
  }: {
    question: SelectedQuestion;
    isBookmarkDisabled: boolean;
    isPopoverOpen?: boolean;
    setIsPopoverOpen?: (open: boolean) => void;
    setIsHovering?: (value: boolean) => void;
    popOverAlign?: "start" | "end";
    setShouldOpen?: (value: boolean) => void;
    listId?: string;
    badgeClassName?: string;
    popOverTriggerClassName?: string;
    triggerButtonClassName?: string;
    isValidSession: boolean;
    isInView: boolean;
  }) => {
    const [_open, _setOpen] = useState(false);

    // Use the open prop if provided, otherwise use local state
    const open = openProp ?? _open;

    // Create a function to handle state changes, respecting both local and prop state
    const handleOpenChange = useCallback(
      (value: boolean | ((prev: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value;

        // Update the prop state if provided
        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpen(newOpenState);
        }
        if (setIsHovering && !newOpenState) {
          setIsHovering(false);
        }
        if (setShouldOpen && !newOpenState) {
          setShouldOpen(false);
        }
      },
      [open, setOpenProp, setIsHovering, setShouldOpen]
    );

    const bookmarkStore = useRef<BookmarkStore | null>(null);
    const { bookmarksData: bookmarks } = useTopicalApp();
    // Only create the store once when component mounts
    if (bookmarkStore.current === null && isInView) {
      bookmarkStore.current = createBookmarkStore({
        isBookmarkDisabled,
        isValidSession,
        question,
        chosenBookmarkList: (() => {
          const set = new Set<string>();
          for (const bookmark of bookmarks ?? []) {
            if (
              bookmark.userBookmarks.some((b) => b.question.id === question.id)
            ) {
              set.add(bookmark.id);
            }
          }
          return set;
        })(),
        bookmarks: bookmarks ?? [],
        popOverAlign,
        badgeClassName,
        popOverTriggerClassName,
        triggerButtonClassName,
        open,
        isInView,
        listId,
      });
    }

    // Update the store with new props when they change
    useEffect(() => {
      if (!isInView) {
        return;
      }
      if (bookmarkStore.current) {
        bookmarkStore.current.setState((state) => ({
          ...state,
          isBookmarkDisabled,
          isValidSession,
          question,
          chosenBookmarkList: (() => {
            const set = new Set<string>();
            for (const bookmark of bookmarks ?? []) {
              if (
                bookmark.userBookmarks.some(
                  (b) => b.question.id === question.id
                )
              ) {
                set.add(bookmark.id);
              }
            }
            return set;
          })(),
          bookmarks,
          popOverAlign,
          badgeClassName,
          popOverTriggerClassName,
          triggerButtonClassName,
          open,
          isInView,
          listId,
        }));
      }
    }, [
      isBookmarkDisabled,
      isValidSession,
      question,
      bookmarks,
      popOverAlign,
      badgeClassName,
      popOverTriggerClassName,
      triggerButtonClassName,
      open,
      isInView,
      listId,
    ]);

    if (!isInView) {
      return null;
    }

    return (
      <BookmarkContext.Provider value={bookmarkStore.current}>
        <BookmarkButtonConsumer open={open} setOpen={handleOpenChange} />
      </BookmarkContext.Provider>
    );
  }
);

BookmarkButton.displayName = "BookmarkButton";

const BookmarkButtonConsumer = memo(
  ({
    open,
    setOpen,
  }: {
    open: boolean;
    setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  }) => {
    const question = useBookmarkContext((state) => state.question);
    const bookmarkListName = useBookmarkContext(
      (state) => state.bookmarkListName
    );
    const queryClient = useQueryClient();
    const searchInput = useBookmarkContext((state) => state.searchInput);
    const setSearchInput = useBookmarkContext(
      (state) => state.actions.setSearchInput
    );
    const setIsBlockingInput = useBookmarkContext(
      (state) => state.actions.setIsBlockingInput
    );
    const popOverAlign = useBookmarkContext((state) => state.popOverAlign);
    const isBookmarkDisabled = useBookmarkContext(
      (state) => state.isBookmarkDisabled
    );
    const visibility = useBookmarkContext((state) => state.visibility);
    // const isInView = useBookmarkContext((state) => state.isInView);
    const isValidSession = useBookmarkContext((state) => state.isValidSession);
    const mutationKey = [
      "user_saved_activities",
      "bookmarks",
      question.id,
      bookmarkListName,
      visibility,
    ];

    const setIsInputError = useBookmarkContext(
      (state) => state.actions.setIsInputError
    );
    const setIsAddNewListDialogOpen = useBookmarkContext(
      (state) => state.actions.setIsAddNewListDialogOpen
    );
    const setIsRemoveFromListDialogOpen = useBookmarkContext(
      (state) => state.actions.setIsRemoveFromListDialogOpen
    );
    const setNewBookmarkListNameInput = useBookmarkContext(
      (state) => state.actions.setNewBookmarkListNameInput
    );

    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const store = useContext(BookmarkContext);

    useEffect(() => {
      if (store) {
        // Set refs directly to store
        store.setState((state) => ({
          ...state,
          scrollAreaRef: scrollAreaRef,
          searchInputRef: searchInputRef,
        }));
      }
    }, [store]);

    const isMobileDevice = useIsMobile();
    const setMutate = useBookmarkContext((state) => state.actions.setMutate);

    const addChosenBookmarkList = useBookmarkContext(
      (state) => state.actions.addChosenBookmarkList
    );
    const removeChosenBookmarkList = useBookmarkContext(
      (state) => state.actions.removeChosenBookmarkList
    );
    const isOpen = useBookmarkContext((state) => state.open);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const { mutate } = useMutation({
      mutationKey: mutationKey,
      mutationFn: async ({
        realQuestion,
        realBookmarkListName,
        isRealBookmarked,
        realVisibility,
        realListId,
        isCreateNew,
      }: {
        realQuestion: SelectedQuestion;
        isRealBookmarked: boolean;
        realBookmarkListName: string;
        realVisibility: "public" | "private";
        realListId: string;
        isCreateNew: boolean;
      }): Promise<{
        realQuestion: SelectedQuestion;
        realBookmarkListName: string;
        isRealBookmarked: boolean;
        realListId: string;
        isCreateNew: boolean;
        realVisibility: "public" | "private";
      }> => {
        if (isCreateNew) {
          const result = await createBookmarkListAndAddBookmarkAction({
            listName: realBookmarkListName,
            visibility: realVisibility,
            questionId: realQuestion.id,
          });
          if (!result.success) {
            throw new Error(result.error + "list");
          }
          return {
            realQuestion: realQuestion,
            realBookmarkListName: realBookmarkListName,
            isRealBookmarked: false,
            realListId: result.data as string,
            isCreateNew: true,
            realVisibility: realVisibility,
          };
        }
        if (isRealBookmarked) {
          const result = await removeBookmarkAction({
            questionId: realQuestion.id,
            listId: realListId,
          });
          if (result.error) {
            throw new Error(result.error);
          }
          return {
            realQuestion: realQuestion,
            realListId: realListId,
            realBookmarkListName: realBookmarkListName,
            isRealBookmarked: true,
            isCreateNew: isCreateNew,
            realVisibility: realVisibility,
          };
        } else {
          const result = await addBookmarkAction({
            questionId: realQuestion.id,
            listId: realListId,
          });
          if (result.error) {
            throw new Error(result.error + "bookmark");
          }
          return {
            realQuestion: realQuestion,
            realBookmarkListName: realBookmarkListName,
            realListId: realListId,
            isRealBookmarked: false,
            isCreateNew: isCreateNew,
            realVisibility: realVisibility,
          };
        }
      },
      onSuccess: ({
        realQuestion: newQuestion,
        isRealBookmarked,
        realListId,
        realBookmarkListName: newBookmarkListName,
        isCreateNew,
        realVisibility,
      }: {
        realQuestion: SelectedQuestion;
        isRealBookmarked: boolean;
        realListId: string;
        realBookmarkListName: string;
        isCreateNew: boolean;
        realVisibility: "public" | "private";
      }) => {
        setIsBlockingInput(true);
        setTimeout(() => {
          searchInputRef?.current?.focus();
          setTimeout(() => {
            setIsBlockingInput(false);
          }, 0);
        }, 0);

        queryClient.setQueryData<SavedActivitiesResponse>(
          ["user_saved_activities"],
          (prev: SavedActivitiesResponse | undefined) => {
            if (!prev) {
              return prev;
            }

            const updatedBookmarks = prev.bookmarks ?? [];

            if (isCreateNew) {
              const isListAlreadyExist = updatedBookmarks.some(
                (bookmark) => bookmark.id === realListId
              );

              setIsAddNewListDialogOpen(false);
              setIsInputError(false);
              setNewBookmarkListNameInput("");

              // Use the scrollAreaRef directly from the component
              scrollAreaRef?.current?.scrollTo({
                top: 0,
              });

              if (isListAlreadyExist) {
                // Add bookmark to existing list
                addChosenBookmarkList(realListId);
                const existingBookmark = updatedBookmarks.find(
                  (bookmark) => bookmark.id === realListId
                );
                if (existingBookmark) {
                  existingBookmark.userBookmarks.push({
                    question: {
                      year: newQuestion.year,
                      season: newQuestion.season,
                      paperType: newQuestion.paperType,
                      questionImages: newQuestion.questionImages,
                      answers: newQuestion.answers,
                      topics: newQuestion.topics,
                      id: newQuestion.id,
                    },
                    updatedAt: new Date(),
                  });
                }
              } else {
                // Create new list and add bookmark
                addChosenBookmarkList(realListId);
                updatedBookmarks.push({
                  id: realListId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  listName: newBookmarkListName,
                  visibility: realVisibility as "public" | "private",

                  userBookmarks: [
                    {
                      question: {
                        year: newQuestion.year,
                        season: newQuestion.season,
                        paperType: newQuestion.paperType,
                        questionImages: newQuestion.questionImages,
                        answers: newQuestion.answers,
                        topics: newQuestion.topics,
                        id: newQuestion.id,
                      },
                      updatedAt: new Date(),
                    },
                  ],
                });
                // Use the scrollAreaRef directly from the component
                scrollAreaRef?.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }
            } else if (!isCreateNew && !isRealBookmarked) {
              // Add bookmark to existing list
              addChosenBookmarkList(realListId);
              const existingBookmark = updatedBookmarks.find(
                (bookmark) => bookmark.id === realListId
              );
              if (existingBookmark) {
                existingBookmark.userBookmarks.push({
                  question: {
                    year: newQuestion.year,
                    season: newQuestion.season,
                    paperType: newQuestion.paperType,
                    questionImages: newQuestion.questionImages,
                    answers: newQuestion.answers,
                    topics: newQuestion.topics,
                    id: newQuestion.id,
                  },
                  updatedAt: new Date(),
                });
              }
            } else if (!isCreateNew && isRealBookmarked) {
              // Remove bookmark from list
              removeChosenBookmarkList(realListId);
              setIsRemoveFromListDialogOpen(false);
              const existingBookmark = updatedBookmarks.find(
                (bookmark) => bookmark.id === realListId
              );
              if (existingBookmark) {
                existingBookmark.userBookmarks =
                  existingBookmark.userBookmarks.filter(
                    (userBookmark) =>
                      userBookmark.question.id !== newQuestion.id
                  );
              }
            }

            return {
              ...prev,
              bookmarks: updatedBookmarks,
            };
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

    useEffect(() => {
      setMutate(mutate);
    }, [mutate, setMutate]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          if (searchInput) {
            setSearchInput("");
            return;
          }
          if (open) {
            setOpen(false);
            setNewBookmarkListNameInput("");
          }
        }
      },
      [searchInput, open, setNewBookmarkListNameInput, setSearchInput, setOpen]
    );
    const { savedActivitiesIsLoading, savedActivitiesIsError } =
      useTopicalApp();
    const openUI = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isBookmarkDisabled || savedActivitiesIsLoading) {
        return;
      }
      if (savedActivitiesIsError) {
        toast.error("Bookmark error. Please refresh the page.", {
          duration: 2000,
          position: isMobileDevice ? "top-center" : "bottom-right",
        });
        return;
      }
      if (!isValidSession) {
        toast.error("Please sign in to bookmark questions.", {
          duration: 2000,
          position: isMobileDevice && isOpen ? "top-center" : "bottom-right",
        });
        return;
      }
      setIsBlockingInput(true);
      setTimeout(() => {
        setIsBlockingInput(false);
      }, 0);
      setOpen(true);
    };
    const popOverTriggerClassName = useBookmarkContext(
      (state) => state.popOverTriggerClassName
    );

    return (
      <Command
        onKeyDown={handleKeyDown}
        className="!h-max bg-transparent overflow-visible !w-max"
      >
        {isMobileDevice ? (
          <Drawer
            onOpenChange={(open) => {
              setOpen(open);
              if (!open) {
                setNewBookmarkListNameInput("");
              }
            }}
            open={open}
          >
            <DrawerTrigger
              asChild
              onClick={(e) => {
                openUI(e);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <BookmarkTrigger />
              </div>
            </DrawerTrigger>
            <DrawerContent
              className="z-[100009] h-[95vh] max-h-[95vh] dark:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onInteractOutside={() => {
                setSearchInput("");
                setOpen(false);
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
                <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
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
                  className="flex-1/3 cursor-pointer mb-4"
                  onClick={() => {
                    setOpen(false);
                  }}
                  variant="outline"
                >
                  Close
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <BookmarkList
                scrollAreaRef={scrollAreaRef}
                searchInputRef={searchInputRef}
                isMobileDevice={true}
              />
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover modal={true} open={open}>
            <PopoverTrigger
              onClick={(e) => {
                openUI(e);
              }}
              ref={triggerRef}
              asChild
            >
              <div
                className={popOverTriggerClassName}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <BookmarkTrigger />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="flex flex-col z-[100010] w-[270px] !px-0 dark:bg-accent"
              onClick={(e) => e.stopPropagation()}
              align={popOverAlign}
              side="left"
              onInteractOutside={(e) => {
                if (triggerRef.current?.contains(e.target as Node)) {
                  return;
                }
                console.log("interact outside", e.target);
                setOpen(false);
                setSearchInput("");
              }}
            >
              <BookmarkList
                scrollAreaRef={scrollAreaRef}
                searchInputRef={searchInputRef}
                isMobileDevice={false}
              />
              <div className="w-full px-2 mt-2 flex items-center justify-center">
                <Button
                  className="w-full cursor-pointer"
                  variant="destructive"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </Command>
    );
  }
);

BookmarkButtonConsumer.displayName = "BookmarkButtonConsumer";

const BookmarkTrigger = memo(() => {
  const badgeClassName = useBookmarkContext((state) => state.badgeClassName);

  const triggerButtonClassName = useBookmarkContext(
    (state) => state.triggerButtonClassName
  );

  const isBookmarkDisabled = useBookmarkContext(
    (state) => state.isBookmarkDisabled
  );
  const question = useBookmarkContext((state) => state.question);

  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["user_saved_activities", question.id, "bookmarks"],
    }) > 0;

  const { savedActivitiesIsFetching, bookmarksData } = useTopicalApp();
  const isBookmarked = bookmarksData?.some((bookmark) =>
    bookmark.userBookmarks.some((b) => b.question.id === question.id)
  );

  if (isMutatingThisQuestion) {
    return (
      <Badge
        className={cn(
          "text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black rounded-[3px] min-h-[28px]",
          badgeClassName
        )}
      >
        Saving
        <Loader2 className="animate-spin" />
      </Badge>
    );
  }

  return (
    <Button
      className={cn(
        triggerButtonClassName,
        "rounded-[3px]",
        isBookmarked && "!bg-logo-main !text-white",
        (isBookmarkDisabled || savedActivitiesIsFetching) && "opacity-50"
      )}
      tabIndex={-1}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {savedActivitiesIsFetching ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Bookmark size={10} />
      )}
    </Button>
  );
});

BookmarkTrigger.displayName = "BookmarkTrigger";

const BookmarkSearchInput = memo(
  ({
    searchInputRef,
  }: {
    searchInputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    const setSearchInput = useBookmarkContext(
      (state) => state.actions.setSearchInput
    );
    const isBlockingInput = useBookmarkContext(
      (state) => state.isBlockingInput
    );
    const searchInput = useBookmarkContext((state) => state.searchInput);
    return (
      <div className="flex w-full items-center justify-between gap-1 dark:bg-accent mb-2 pb-3 border-b border-border ">
        <CommandInput
          placeholder="Search bookmark lists"
          wrapperClassName="w-full  ml-2"
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
        <XIcon
          className="!bg-transparent cursor-pointer mr-2 text-destructive"
          size={20}
          onClick={(e) => {
            e.stopPropagation();
            setSearchInput("");
            if (searchInput) {
              searchInputRef.current?.focus();
            }
          }}
        />
      </div>
    );
  }
);

BookmarkSearchInput.displayName = "BookmarkSearchInput";

const BookmarkList = memo(
  ({
    scrollAreaRef,
    searchInputRef,
    isMobileDevice,
  }: {
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    isMobileDevice: boolean;
  }) => {
    const searchInput = useBookmarkContext((state) => state.searchInput);
    const setIsBlockingInput = useBookmarkContext(
      (state) => state.actions.setIsBlockingInput
    );
    const chosenBookmarkList = useBookmarkContext(
      (state) => state.chosenBookmarkList
    );
    const bookmarks = useBookmarkContext((state) => state.bookmarks);
    const question = useBookmarkContext((state) => state.question);
    const setBookmarkListName = useBookmarkContext(
      (state) => state.actions.setBookmarkListName
    );
    const mutate = useBookmarkContext((state) => state.mutate);
    const setVisibility = useBookmarkContext(
      (state) => state.actions.setVisibility
    );
    const onListSelect = ({
      bookmark,
      isItemBookmarked,
      visibility,
    }: {
      bookmark: SelectedBookmark;
      isItemBookmarked: boolean;
      visibility: "public" | "private";
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
      setVisibility(visibility);
      setBookmarkListName(bookmark.listName);
      setTimeout(() => {
        mutate?.({
          realQuestion: question,
          realListId: bookmark.id,
          realBookmarkListName: bookmark.listName,
          isRealBookmarked: isItemBookmarked,
          isCreateNew: false,
          realVisibility: visibility,
        });
      }, 0);
    };

    return (
      <div className="h-full flex flex-col mb-2 md:mb-0">
        <BookmarkSearchInput searchInputRef={searchInputRef} />
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
            {bookmarks.length > 0 && (
              <>
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
                          chosenBookmarkList.size > 0
                            ? "text-logo-main"
                            : "text-muted-foreground"
                        )}
                      >
                        {`${chosenBookmarkList.size} selected`}
                      </h3>
                      <ChevronsUpDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                  )}
                  <CommandGroup value={`${chosenBookmarkList.size} selected`}>
                    <CollapsibleContent>
                      {chosenBookmarkList.size > 0 &&
                        !searchInput &&
                        bookmarks
                          .filter((bookmark) =>
                            chosenBookmarkList.has(bookmark.id)
                          )
                          .map((bookmark) => (
                            <BookmarkItem
                              key={bookmark.id}
                              onSelect={() => {
                                onListSelect({
                                  bookmark,
                                  isItemBookmarked: true,
                                  visibility: bookmark.visibility as
                                    | "public"
                                    | "private",
                                });
                              }}
                              listName={bookmark.listName}
                              isPlaceholder={true}
                              listId={bookmark.id}
                              visibility={
                                bookmark.visibility as "public" | "private"
                              }
                              searchInputRef={searchInputRef}
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
                        const isItemBookmarked = chosenBookmarkList.has(
                          bookmark.id
                        );

                        return (
                          <BookmarkItem
                            key={bookmark.id}
                            onSelect={() => {
                              onListSelect({
                                bookmark,
                                isItemBookmarked,
                                visibility: bookmark.visibility as
                                  | "public"
                                  | "private",
                              });
                            }}
                            listName={bookmark.listName}
                            listId={bookmark.id}
                            visibility={
                              bookmark.visibility as "public" | "private"
                            }
                            isPlaceholder={false}
                            searchInputRef={searchInputRef}
                          />
                        );
                      })}
                    </>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </ScrollArea>
        <ActionDialogs />
      </div>
    );
  }
);

BookmarkList.displayName = "BookmarkList";

const BookmarkItem = memo(
  ({
    listName,
    visibility,
    listId,
    isPlaceholder,
    onSelect,
    searchInputRef,
  }: {
    listName: string;
    listId: string;
    visibility: "public" | "private";
    isPlaceholder: boolean;
    onSelect: () => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    const question = useBookmarkContext((state) => state.question);
    const setIsBlockingInput = useBookmarkContext(
      (state) => state.actions.setIsBlockingInput
    );
    const searchInput = useBookmarkContext((state) => state.searchInput);
    const chosenBookmarkList = useBookmarkContext(
      (state) => state.chosenBookmarkList
    );
    const isMutating =
      useIsMutating({
        mutationKey: [
          "user_saved_activities",
          "bookmarks",
          question.id,
          listName,
          visibility,
        ],
      }) > 0;

    return (
      <CommandItem
        className={cn(
          "cursor-pointer wrap-anywhere flex items-center justify-between",
          isMutating && "opacity-50 cursor-default"
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            searchInputRef?.current?.focus();
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
        onSelect={() => {
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
          if (isMutating) {
            return;
          }
          onSelect();
        }}
      >
        <div className="flex items-center justify-start gap-2">
          <Checkbox
            checked={chosenBookmarkList.has(listId)}
            className="data-[state=checked]:!bg-logo-main "
          />
          {listName}
          <span className="sr-only">{visibility}</span>
          {isPlaceholder && <span className="sr-only">skibidi toilet</span>}
          {isMutating && <Loader2 className="animate-spin" />}
        </div>
        {visibility === "private" ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </CommandItem>
    );
  }
);

BookmarkItem.displayName = "BookmarkItem";

const ActionDialogs = memo(() => {
  const newBookmarkListNameInput = useBookmarkContext(
    (state) => state.newBookmarkListNameInput
  );
  const setIsAddNewListDialogOpen = useBookmarkContext(
    (state) => state.actions.setIsAddNewListDialogOpen
  );
  const setIsInputError = useBookmarkContext(
    (state) => state.actions.setIsInputError
  );
  const bookmarks = useBookmarkContext((state) => state.bookmarks);
  const isMobileDevice = useIsMobile();
  const setNewBookmarkListNameInput = useBookmarkContext(
    (state) => state.actions.setNewBookmarkListNameInput
  );
  const question = useBookmarkContext((state) => state.question);
  const isInputError = useBookmarkContext((state) => state.isInputError);
  const isAddNewListDialogOpen = useBookmarkContext(
    (state) => state.isAddNewListDialogOpen
  );
  const setIsRemoveFromListDialogOpen = useBookmarkContext(
    (state) => state.actions.setIsRemoveFromListDialogOpen
  );
  const isRemoveFromListDialogOpen = useBookmarkContext(
    (state) => state.isRemoveFromListDialogOpen
  );
  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: ["user_saved_activities", "bookmarks", question.id],
    }) > 0;
  const mutate = useBookmarkContext((state) => state.mutate);

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
  const chosenBookmarkList = useBookmarkContext(
    (state) => state.chosenBookmarkList
  );

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

  const setVisibility = useBookmarkContext(
    (state) => state.actions.setVisibility
  );
  const visibility = useBookmarkContext((state) => state.visibility);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isBlockingDialogInput, setIsBlockingDialogInput] = useState(false);
  const listId = useBookmarkContext((state) => state.listId);
  const setIsBlockingSearchInput = useBookmarkContext(
    (state) => state.actions.setIsBlockingInput
  );
  const searchInputRef = useBookmarkContext((state) => state.searchInputRef);

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
                  setIsBlockingSearchInput(true);
                  setTimeout(() => {
                    searchInputRef?.current?.focus();
                    setIsBlockingDialogInput(false);
                    setTimeout(() => {
                      setIsBlockingSearchInput(false);
                    }, 0);
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
});

ActionDialogs.displayName = "ActionDialogs";
