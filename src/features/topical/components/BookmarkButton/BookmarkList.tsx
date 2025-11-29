import { memo } from "react";
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
import { BookmarkListProps, SelectedBookmark } from "../../constants/types";
import { MAXIMUM_BOOKMARKS_PER_LIST } from "@/constants/constants";
import { BookmarkSearchInput } from "./BookmarkSearchInput";
import { BookmarkItem } from "./BookmarkItem";
import { BookmarkActionDialogs } from "./BookmarkActionDialogs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handleBookmarkError,
  handleToggleBookmarkOptimisticUpdate,
  toggleBookmarkMutationFn,
  ToggleBookmarkMutationVariables,
} from "../../utils/bookmarkUtils";

export const BookmarkList = memo(
  ({
    scrollAreaRef,
    searchInputRef,
    setOpen,
    bookmarks,
    chosenBookmarkList,
    question,
    searchInput,
    setSearchInput,

    setVisibility,
    listId,
    isAddNewListDialogOpen,
    setIsAddNewListDialogOpen,
    newBookmarkListNameInput,
    setNewBookmarkListNameInput,
    isInputError,
    setIsInputError,
    visibility,
    isRemoveFromListDialogOpen,
    setIsRemoveFromListDialogOpen,
  }: BookmarkListProps) => {
    const isMobileDevice = useIsMobile();
    const queryClient = useQueryClient();

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

      setTimeout(() => {
        mutate({
          question,
          listId: bookmark.id,
          bookmarkListName: bookmark.listName,
          isBookmarked: isItemBookmarked,
        });
      }, 0);
    };

    return (
      <div className="h-full flex flex-col mb-2 md:mb-0">
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
          <CommandList
            className="w-full h-max flex flex-col"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <CommandEmpty>No lists found.</CommandEmpty>
            {bookmarks.length > 0 && (
              <>
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
                            question={question}
                            chosenBookmarkList={chosenBookmarkList}
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
        <BookmarkActionDialogs
          isAddNewListDialogOpen={isAddNewListDialogOpen}
          setIsAddNewListDialogOpen={setIsAddNewListDialogOpen}
          newBookmarkListNameInput={newBookmarkListNameInput}
          setNewBookmarkListNameInput={setNewBookmarkListNameInput}
          isInputError={isInputError}
          setIsInputError={setIsInputError}
          bookmarks={bookmarks}
          question={question}
          visibility={visibility}
          setVisibility={setVisibility}
          chosenBookmarkList={chosenBookmarkList}
          listId={listId}
          isRemoveFromListDialogOpen={isRemoveFromListDialogOpen}
          setIsRemoveFromListDialogOpen={setIsRemoveFromListDialogOpen}
          searchInputRef={searchInputRef}
        />
      </div>
    );
  }
);

BookmarkList.displayName = "BookmarkList";
