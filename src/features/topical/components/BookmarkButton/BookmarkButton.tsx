import React, {
  useCallback,
  useRef,
  type KeyboardEvent,
  memo,
  useState,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookmarkButtonProps } from "../../constants/types";
import { Command } from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useAuth } from "@/context/AuthContext";
import { BookmarkTrigger } from "./BookmarkTrigger";
import { BookmarkList } from "./BookmarkList";

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
    isInView,
  }: BookmarkButtonProps) => {
    const [_open, _setOpen] = useState(false);
    const open = openProp ?? _open;
    const [searchInput, setSearchInput] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">(
      "public"
    );
    const [newBookmarkListNameInput, setNewBookmarkListNameInput] =
      useState("");
    const [isInputError, setIsInputError] = useState(false);
    const [isAddNewListDialogOpen, setIsAddNewListDialogOpen] = useState(false);
    const [isRemoveFromListDialogOpen, setIsRemoveFromListDialogOpen] =
      useState(false);

    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const {
      bookmarksData: bookmarks,
      savedActivitiesIsLoading,
      savedActivitiesIsError,
    } = useTopicalApp();
    const { isAuthenticated } = useAuth();
    const isMobileDevice = useIsMobile();

    const chosenBookmarkList = useMemo(() => {
      const set = new Set<string>();
      for (const bookmark of bookmarks ?? []) {
        if (bookmark.userBookmarks.some((b) => b.question.id === question.id)) {
          set.add(bookmark.id);
        }
      }
      return set;
    }, [bookmarks, question.id]);

    const handleOpenChange = useCallback(
      (value: boolean | ((prev: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value;

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
        if (!newOpenState) {
          setNewBookmarkListNameInput("");
          setSearchInput("");
        }
      },
      [open, setOpenProp, setIsHovering, setShouldOpen]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          if (searchInput) {
            setSearchInput("");
            return;
          }
          if (open) {
            handleOpenChange(false);
          }
        }
      },
      [searchInput, open, handleOpenChange]
    );

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
      if (!isAuthenticated) {
        toast.error("Please sign in to bookmark questions.", {
          duration: 2000,
          position: isMobileDevice && open ? "top-center" : "bottom-right",
        });
        return;
      }
      handleOpenChange(true);
    };

    if (!isInView) {
      return null;
    }

    return (
      <Command
        onKeyDown={handleKeyDown}
        className="!h-max bg-transparent overflow-visible !w-max"
      >
        {isMobileDevice ? (
          <Drawer
            autoFocus={false}
            onOpenChange={(open) => {
              handleOpenChange(open);
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
                <BookmarkTrigger
                  question={question}
                  isBookmarkDisabled={isBookmarkDisabled}
                  badgeClassName={badgeClassName}
                  triggerButtonClassName={triggerButtonClassName}
                />
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
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              onInteractOutside={() => {
                setSearchInput("");
                handleOpenChange(false);
              }}
            >
              <DrawerHeader className="sr-only">
                <DrawerTitle>Select</DrawerTitle>
                <DrawerDescription />
                Save to book mark list
              </DrawerHeader>
              <div className="w-full pt-2 pb-4">
                <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
              </div>

              <div className="flex flex-row gap-3 p-2 ">
                <Button
                  className="flex-1/3 cursor-pointer mb-4"
                  onClick={() => {
                    handleOpenChange(false);
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
                setOpen={handleOpenChange}
                bookmarks={bookmarks ?? []}
                chosenBookmarkList={chosenBookmarkList}
                question={question}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                setVisibility={setVisibility}
                listId={listId}
                isAddNewListDialogOpen={isAddNewListDialogOpen}
                setIsAddNewListDialogOpen={setIsAddNewListDialogOpen}
                newBookmarkListNameInput={newBookmarkListNameInput}
                setNewBookmarkListNameInput={setNewBookmarkListNameInput}
                isInputError={isInputError}
                setIsInputError={setIsInputError}
                visibility={visibility}
                isRemoveFromListDialogOpen={isRemoveFromListDialogOpen}
                setIsRemoveFromListDialogOpen={setIsRemoveFromListDialogOpen}
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
                <BookmarkTrigger
                  question={question}
                  isBookmarkDisabled={isBookmarkDisabled}
                  badgeClassName={badgeClassName}
                  triggerButtonClassName={triggerButtonClassName}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="flex flex-col z-[100010] w-[270px] !px-0 dark:bg-accent"
              onClick={(e) => e.stopPropagation()}
              align={popOverAlign}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              autoFocus={false}
              side="left"
              onInteractOutside={(e) => {
                if (triggerRef.current?.contains(e.target as Node)) {
                  return;
                }
                handleOpenChange(false);
                setSearchInput("");
              }}
            >
              <BookmarkList
                scrollAreaRef={scrollAreaRef}
                searchInputRef={searchInputRef}
                setOpen={handleOpenChange}
                bookmarks={bookmarks ?? []}
                chosenBookmarkList={chosenBookmarkList}
                question={question}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                setVisibility={setVisibility}
                listId={listId}
                isAddNewListDialogOpen={isAddNewListDialogOpen}
                setIsAddNewListDialogOpen={setIsAddNewListDialogOpen}
                newBookmarkListNameInput={newBookmarkListNameInput}
                setNewBookmarkListNameInput={setNewBookmarkListNameInput}
                isInputError={isInputError}
                setIsInputError={setIsInputError}
                visibility={visibility}
                isRemoveFromListDialogOpen={isRemoveFromListDialogOpen}
                setIsRemoveFromListDialogOpen={setIsRemoveFromListDialogOpen}
              />
              <div className="w-full px-2 mt-2 flex items-center justify-center">
                <Button
                  className="w-full cursor-pointer"
                  variant="destructive"
                  onClick={() => {
                    handleOpenChange(false);
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

BookmarkButton.displayName = "BookmarkButton";
