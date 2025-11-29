import {
  memo,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BookmarkListProps,
  BookmarkListRef,
  SelectedBookmark,
  ToggleBookmarkMutationVariables,
} from "../../constants/types";
import { MAXIMUM_BOOKMARKS_PER_LIST } from "@/constants/constants";
import { BookmarkSearchInput } from "./BookmarkSearchInput";
import { BookmarkItem } from "./BookmarkItem";
import { BookmarkActionDialogs } from "./BookmarkActionDialogs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handleBookmarkError,
  handleToggleBookmarkOptimisticUpdate,
  toggleBookmarkMutationFn,
} from "../../utils/bookmarkUtils";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { fuzzySearch } from "../../lib/utils";

export const BookmarkList = memo(
  forwardRef<BookmarkListRef, BookmarkListProps>(
    ({ setOpen, question, listId }, ref) => {
      const isMobileDevice = useIsMobile();
      const queryClient = useQueryClient();
      const { bookmarksData } = useTopicalApp();
      const [searchInput, setSearchInput] = useState("");
      const scrollAreaRef = useRef<HTMLDivElement | null>(null);
      const searchInputRef = useRef<HTMLInputElement | null>(null);

      const filteredAvailableOption = useMemo(() => {
        if (!bookmarksData) {
          return [];
        }
        return bookmarksData.filter((item) => {
          return fuzzySearch(searchInput, item.listName);
        });
      }, [bookmarksData, searchInput]);

      const chosenBookmarkList = useMemo(() => {
        const set = new Set<string>();
        for (const bookmark of bookmarksData ?? []) {
          if (
            bookmark.userBookmarks.some((b) => b.question.id === question.id)
          ) {
            set.add(bookmark.id);
          }
        }
        return set;
      }, [bookmarksData, question.id]);

      const filteredSelectedValue = useMemo(() => {
        if (!bookmarksData) {
          return [];
        }
        return bookmarksData.filter((item) => {
          return (
            chosenBookmarkList.has(item.id) &&
            fuzzySearch(searchInput, item.listName)
          );
        });
      }, [bookmarksData, chosenBookmarkList, searchInput]);

      useImperativeHandle(
        ref,
        () => ({
          searchInput,
          setSearchInput,
        }),
        [searchInput]
      );

      const mutationKey = [
        "user_saved_activities",
        "bookmarks",
        question.id,
        "list_update",
      ];

      const { mutate } = useMutation({
        mutationKey: mutationKey,
        mutationFn: toggleBookmarkMutationFn,
        onSuccess: (data) => {
          const { isBookmarked, bookmarkListName: newBookmarkListName } = data;

          setTimeout(() => {
            searchInputRef?.current?.focus();
          }, 0);

          handleToggleBookmarkOptimisticUpdate(queryClient, data);

          toast.success(
            isBookmarked
              ? `Question removed from ${newBookmarkListName}`
              : `Question added to ${newBookmarkListName}`,
            {
              duration: 2000,
              position: isMobileDevice ? "top-center" : "bottom-right",
            }
          );
        },
        onError: (error, variables) => {
          handleBookmarkError(
            error,
            variables as ToggleBookmarkMutationVariables,
            isMobileDevice
          );
        },
      });

      const onListSelect = useCallback(
        ({
          bookmark,
          isItemBookmarked,
        }: {
          bookmark: SelectedBookmark;
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

          setTimeout(() => {
            mutate({
              question,
              listId: bookmark.id,
              bookmarkListName: bookmark.listName,
              isBookmarked: isItemBookmarked,
            });
          }, 0);
        },
        [isMobileDevice, mutate, question]
      );

      return (
        <div className="h-full flex flex-col md:mb-0">
          <BookmarkSearchInput
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchInputRef={searchInputRef}
            setOpen={setOpen}
          />
          <ScrollArea
            viewportRef={scrollAreaRef}
            className="h-[60%] md:h-[200px] [&_.bg-border]:bg-logo-main/50"
            type="always"
          >
            <CommandList className="w-full h-max flex flex-col">
              <Collapsible>
                {!searchInput && (
                  <CollapsibleTrigger
                    className="flex w-full cursor-pointer items-center justify-between gap-2 px-3"
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
                      filteredSelectedValue.map((bookmark) => (
                        <BookmarkItem
                          key={bookmark.id}
                          onSelect={() => {
                            onListSelect({
                              bookmark,
                              isItemBookmarked: true,
                            });
                          }}
                          listName={bookmark.listName}
                          listId={bookmark.id}
                          visibility={
                            bookmark.visibility as "public" | "private"
                          }
                          question={question}
                          chosenBookmarkList={chosenBookmarkList}
                        />
                      ))}
                  </CollapsibleContent>
                </CommandGroup>
              </Collapsible>
              <CommandSeparator />

              <CommandGroup
                heading={searchInput.length > 0 ? "Search result" : "Save to"}
                className={cn(searchInput && "-mt-4")}
              >
                {filteredAvailableOption.length > 0 && (
                  <>
                    {filteredAvailableOption.map((bookmark) => {
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
                            });
                          }}
                          listName={bookmark.listName}
                          listId={bookmark.id}
                          visibility={
                            bookmark.visibility as "public" | "private"
                          }
                          question={question}
                          chosenBookmarkList={chosenBookmarkList}
                        />
                      );
                    })}
                  </>
                )}
              </CommandGroup>
              <CommandEmpty>No lists found.</CommandEmpty>
            </CommandList>
          </ScrollArea>
          <BookmarkActionDialogs
            question={question}
            chosenBookmarkList={chosenBookmarkList}
            listId={listId}
            searchInputRef={searchInputRef}
          />
        </div>
      );
    }
  )
);

BookmarkList.displayName = "BookmarkList";
