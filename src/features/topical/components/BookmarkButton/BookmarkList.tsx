import {
  memo,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
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
import {
  BookmarkListProps,
  BookmarkListRef,
  SelectedQuestion,
} from "../../constants/types";
import { BookmarkSearchInput } from "./BookmarkSearchInput";
import { BookmarkItem } from "./BookmarkItem";
import { BookmarkActionDialogs } from "./BookmarkActionDialogs";

import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { fuzzySearch } from "../../lib/utils";
import { useMutationState } from "@tanstack/react-query";

export const BookmarkList = memo(
  forwardRef<BookmarkListRef, BookmarkListProps>(
    ({ setOpen, question, listId }, ref) => {
      const { bookmarksData } = useTopicalApp();
      const [searchInput, setSearchInput] = useState("");
      const scrollAreaRef = useRef<HTMLDivElement | null>(null);
      const searchInputRef = useRef<HTMLInputElement | null>(null);

      const isThisBookmarkSettled = useMutationState({
        filters: {
          mutationKey: ["user_saved_activities", "bookmarks", question.id],
          predicate: (mutation) =>
            mutation.state.status === "success" ||
            mutation.state.status === "error",
        },
      });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [bookmarksData, question.id, isThisBookmarkSettled]);

      const filteredAvailableOption = useMemo(() => {
        if (!bookmarksData) {
          return [];
        }
        return bookmarksData.filter((item) => {
          return fuzzySearch(searchInput, item.listName);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [bookmarksData, searchInput, isThisBookmarkSettled]);

      useImperativeHandle(
        ref,
        () => ({
          searchInput,
          setSearchInput,
        }),
        [searchInput]
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
              <SelectedValueList
                searchInput={searchInput}
                question={question}
                chosenBookmarkList={chosenBookmarkList}
              />
              <CommandSeparator />

              <CommandGroup
                heading={searchInput.length > 0 ? "Search result" : "Save to"}
                className={cn(searchInput && "-mt-4")}
              >
                {filteredAvailableOption.length > 0 && (
                  <>
                    {filteredAvailableOption.map((bookmark) => {
                      return (
                        <BookmarkItem
                          key={bookmark.id}
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
            listId={listId}
            searchInputRef={searchInputRef}
            chosenBookmarkList={chosenBookmarkList}
          />
        </div>
      );
    }
  )
);

BookmarkList.displayName = "BookmarkList";

const SelectedValueList = memo(
  ({
    searchInput,
    question,
    chosenBookmarkList,
  }: {
    searchInput: string;
    question: SelectedQuestion;
    chosenBookmarkList: Set<string>;
  }) => {
    const { bookmarksData } = useTopicalApp();

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

    return (
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
                  listName={bookmark.listName}
                  listId={bookmark.id}
                  visibility={bookmark.visibility as "public" | "private"}
                  question={question}
                  chosenBookmarkList={chosenBookmarkList}
                />
              ))}
          </CollapsibleContent>
        </CommandGroup>
      </Collapsible>
    );
  }
);

SelectedValueList.displayName = "SelectedValueList";
