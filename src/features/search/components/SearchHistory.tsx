/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SearchHistoryItem,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistoryItem,
} from "@/lib/client-cache";
import { cn } from "@/lib/utils";
import { History, ImageIcon, Trash2, Type, X } from "lucide-react";
import { memo, useCallback, useEffect, useEffectEvent, useState } from "react";

interface SearchHistoryProps {
  onSelectHistory: (item: SearchHistoryItem) => void;
  className?: string;
  isSearching: boolean;
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const truncateQuery = (query: string, maxLength = 67) => {
  if (query.length <= maxLength) return query;
  return query.substring(0, maxLength) + "...";
};

const SearchHistory = memo(({ onSelectHistory, className, isSearching }: SearchHistoryProps) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    const items = await getSearchHistory();
    setHistory(items);
  }, []);

  const onOpen = useEffectEvent(() => {
    loadHistory();
  });

  useEffect(() => {
    if (isOpen) {
      onOpen();
    }
  }, [isOpen]);

  const handleClearHistory = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  const handleDeleteItem = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeSearchHistoryItem(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSelectItem = useCallback(
    (item: SearchHistoryItem) => {
      onSelectHistory(item);
      setIsOpen(false);
    },
    [onSelectHistory],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground h-10 cursor-pointer gap-2 rounded-sm px-4 transition-all",
            className,
          )}
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-accent max-h-[95vh] max-w-2xl p-0" showCloseButton={false}>
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Local Search History</DialogTitle>
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
                className="h-8 cursor-pointer px-3 text-xs"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="h-[67dvh] overflow-x-hidden [&>div>div]:block!">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="text-muted-foreground/30 mb-4 h-16 w-16" />
              <p className="text-muted-foreground text-base font-medium">No search history</p>
              <p className="text-muted-foreground/60 mt-2 text-sm">
                Your recent searches will appear here
              </p>
            </div>
          ) : (
            <div className="w-full p-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!isSearching) {
                      handleSelectItem(item);
                    }
                  }}
                  className={cn(
                    "hover:bg-muted/50 group hover:border-primary/20 mb-2 w-full cursor-pointer rounded-lg border border-transparent p-4 text-left transition-colors",
                    {
                      "cursor-not-allowed opacity-50": isSearching,
                    },
                  )}
                >
                  <div className="flex w-full items-start gap-4">
                    <div className="mt-0.5">
                      {item.type === "text" ? (
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <Type className="text-primary h-5 w-5" />
                        </div>
                      ) : (
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt="Search preview"
                              className="h-full! w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon className="text-primary h-5 w-5" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex w-[77%] flex-col">
                      <p className="text-foreground text-sm font-medium wrap-break-word">
                        {item.type === "text" ? truncateQuery(item.query, 120) : "Image search"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-muted-foreground text-xs">
                          {formatTimestamp(item.timestamp)}
                        </p>
                        {item.filter && (
                          <>
                            {item.filter.subject && (
                              <Badge
                                variant="secondary"
                                className="h-4 rounded-sm px-1.5 text-[10px]"
                              >
                                {item.filter.subject}
                              </Badge>
                            )}
                            {item.filter.year && item.filter.year.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-4 rounded-sm px-1.5 text-[10px]"
                              >
                                {item.filter.year.length === 1
                                  ? `${item.filter.year[0]} year`
                                  : `${item.filter.year.length} years`}
                              </Badge>
                            )}
                            {item.filter.season && item.filter.season.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-4 rounded-sm px-1.5 text-[10px]"
                              >
                                {item.filter.season.length === 1
                                  ? `${item.filter.season[0]} season`
                                  : `${item.filter.season.length} seasons`}
                              </Badge>
                            )}
                            {item.filter.paperType && item.filter.paperType.length > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-4 rounded-sm px-1.5 text-[10px]"
                              >
                                {item.filter.paperType.length === 1
                                  ? `${item.filter.paperType[0]} paper`
                                  : `${item.filter.paperType.length} papers`}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 cursor-pointer rounded-full"
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        title="Remove from history"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="flex items-center justify-center border-t px-6 py-4">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

SearchHistory.displayName = "SearchHistory";

export default SearchHistory;
