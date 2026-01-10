/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
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
  getSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem,
} from "@/lib/client-cache";
import { History, Trash2, ImageIcon, Type, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHistoryProps {
  onSelectHistory: (item: SearchHistoryItem) => void;
  className?: string;
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

const SearchHistory = ({ onSelectHistory, className }: SearchHistoryProps) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    const items = await getSearchHistory();
    setHistory(items);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  const handleClearHistory = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  const handleDeleteItem = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await removeSearchHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    },
    []
  );

  const handleSelectItem = useCallback(
    (item: SearchHistoryItem) => {
      onSelectHistory(item);
      setIsOpen(false);
    },
    [onSelectHistory]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-10 px-4 rounded-sm cursor-pointer border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[95vh] p-0 dark:bg-accent"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Local Search History</DialogTitle>
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="h-[67dvh] overflow-x-hidden [&>div>div]:block!">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-base font-medium text-muted-foreground">
                No search history
              </p>
              <p className="text-sm text-muted-foreground/60 mt-2">
                Your recent searches will appear here
              </p>
            </div>
          ) : (
            <div className="p-4 w-full">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer mb-2 border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className="mt-0.5">
                      {item.type === "text" ? (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Type className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt="Search preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col w-[77%]">
                      <p className="text-sm font-medium text-foreground wrap-break-word ">
                        {item.type === "text"
                          ? truncateQuery(item.query, 120)
                          : "Image search"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        title="Remove from history"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t flex items-center justify-center">
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
};

export default SearchHistory;
