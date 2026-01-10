/* eslint-disable @next/next/no-img-element */
"use client";

import "@/features/topical/components/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import { VectorizeSelectedQuestion } from "@/features/topical/constants/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Search, Type, Upload, X, FileText } from "lucide-react";
import OptionalFilters from "@/features/search/components/OptionalFilters";
import { cn } from "@/lib/utils";
import SearchPastPaper from "@/features/search/components/SearchPastPaper";
import { OptionalSearchFilter } from "@/features/search/constants/type";
import {
  getRandomPhrase,
  MAX_IMAGE_UPLOAD_SIZE,
  MAX_QUERY_LENGTH,
} from "@/features/search/constants/constants";
import MainContent from "@/features/search/components/MainContent";
import SearchHistory from "@/features/search/components/SearchHistory";
import { addSearchHistory, SearchHistoryItem } from "@/lib/client-cache";
import { updateSearchQueryParam } from "@/features/search/lib/lib";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"image" | "text">("text");
  const [currentFilter, setCurrentFilter] =
    useState<OptionalSearchFilter | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [textareaHeight, setTextareaHeight] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [lastTextQuery, setLastTextQuery] = useState<string | null>(null);
  const [lastImageQuery, setLastImageQuery] = useState<string | null>(null);

  const randomPhrase = useMemo(() => getRandomPhrase(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchButtonPortalRef = useRef<HTMLDivElement | null>(null);

  // Image Search Mutation
  const imageSearchMutation = useMutation({
    mutationFn: async (
      imageBase64: string
    ): Promise<VectorizeSelectedQuestion[]> => {
      const { data, error } = await api["visual-search"].search.post({
        imageBase64,
        filter: currentFilter ?? undefined,
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Search failed");
      }

      return data.data as VectorizeSelectedQuestion[];
    },
  });

  // Text Search Mutation
  const textSearchMutation = useMutation({
    mutationFn: async (query: string): Promise<VectorizeSelectedQuestion[]> => {
      const { data, error } = await api["visual-search"].text.post({
        query,
        filter: currentFilter ?? undefined,
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Search failed");
      }

      return data.data as VectorizeSelectedQuestion[];
    },
  });

  // Derived state from mutations
  const isSearching =
    imageSearchMutation.isPending || textSearchMutation.isPending;
  const error =
    imageSearchMutation.error?.message ||
    textSearchMutation.error?.message ||
    null;
  const results = imageSearchMutation.data || textSearchMutation.data || null;
  const [hasSearched, setHasSearched] = useState(false);

  // Character limit validation
  const excessCharacters = textQuery.length - MAX_QUERY_LENGTH;
  const isQueryTooLong = excessCharacters > 0;
  const isInputValid =
    activeTab === "image"
      ? !!selectedImage
      : textQuery.trim().length > 0 && !isQueryTooLong;

  const isDuplicateQuery =
    activeTab === "text"
      ? textQuery.trim() === lastTextQuery
      : selectedImage === lastImageQuery;

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && query.trim().length > 0 && query.length <= MAX_QUERY_LENGTH) {
      setTextQuery(query);
      setActiveTab("text");
      // Trigger search after a short delay to ensure state is set
      setTimeout(() => {
        textSearchMutation.mutate(query.trim(), {
          onSuccess: () => {
            setLastTextQuery(query.trim());
            setHasSearched(true);
            addSearchHistory({
              type: "text",
              query: query.trim(),
            });
          },
        });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSearching) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSearching]);

  // Visual Search Handlers
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
          setImageError(
            `Image size exceeds 2MB limit. Please upload a smaller image.`
          );
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        setImageError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data URL prefix for API
          const base64Content = base64String.split(",")[1];
          setSelectedImage(base64Content);
          setPreviewUrl(base64String);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleImageSearch = useCallback(() => {
    if (!selectedImage) return;
    // Prevent searching with the same image
    if (selectedImage === lastImageQuery) return;

    setHasSearched(true);
    textSearchMutation.reset();
    imageSearchMutation.mutate(selectedImage, {
      onSuccess: () => {
        setLastImageQuery(selectedImage);
        // Save to search history
        addSearchHistory({
          type: "image",
          query: selectedImage,
          previewUrl: previewUrl ?? undefined,
        });
      },
      onSettled: () => {
        setLastTextQuery(null);
      },
    });
    // Note: We keep the text query in URL when performing image search
  }, [
    selectedImage,
    lastImageQuery,
    previewUrl,
    imageSearchMutation,
    textSearchMutation,
  ]);

  const handleTextSearch = useCallback(() => {
    if (!textQuery.trim()) return;
    if (textQuery.trim() === lastTextQuery) return;

    updateSearchQueryParam(textQuery.trim());

    setHasSearched(true);
    imageSearchMutation.reset();
    textSearchMutation.mutate(textQuery.trim(), {
      onSuccess: () => {
        setLastTextQuery(textQuery.trim());
        // Save to search history
        addSearchHistory({
          type: "text",
          query: textQuery.trim(),
        });
      },
      onSettled: () => {
        setLastImageQuery(null);
      },
    });
  }, [textQuery, lastTextQuery, textSearchMutation, imageSearchMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (textQuery.trim()) {
          handleTextSearch();
        }
      }
    },
    [handleTextSearch, textQuery]
  );

  const handleSearch = useCallback(() => {
    if (activeTab === "text") {
      handleTextSearch();
    } else {
      handleImageSearch();
    }
  }, [activeTab, handleTextSearch, handleImageSearch]);

  const handleHistorySelect = useCallback(
    (item: SearchHistoryItem) => {
      if (item.type === "text") {
        setActiveTab("text");
        setTextQuery(item.query);
        setTimeout(() => {
          textSearchMutation.reset();
          imageSearchMutation.reset();
          textSearchMutation.mutate(item.query, {
            onSuccess: () => {
              setLastTextQuery(item.query);
              setHasSearched(true);
            },
            onSettled: () => {
              setLastImageQuery(null);
            },
          });
        }, 0);
      } else {
        setActiveTab("image");
        setSelectedImage(item.query);
        setPreviewUrl(item.previewUrl || null);
        setTimeout(() => {
          imageSearchMutation.reset();
          textSearchMutation.reset();
          imageSearchMutation.mutate(item.query, {
            onSuccess: () => {
              setLastImageQuery(item.query);
              setHasSearched(true);
            },
            onSettled: () => {
              setLastTextQuery(null);
            },
          });
        }, 0);
      }
    },
    [textSearchMutation, imageSearchMutation]
  );

  return (
    <div
      className={cn(
        "min-h-screen pt-20 bg-linear-to-b from-background via-muted/10 to-muted/30",
        !isSearching && hasSearched ? "pb-18" : ""
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "mx-auto transition-all duration-700 ease-out",
            !results ? "w-full" : "max-w-full"
          )}
        >
          <div className="flex flex-col gap-3 items-center justify-center">
            {!hasSearched && (
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r pb-4 from-logo-main dark:to-white  to-logo-main/60 bg-clip-text text-transparent sm:text-5xl">
                  {randomPhrase}
                </h1>
                <p className="text-lg text-muted-foreground mx-auto -mt-2">
                  Search through thousands of AS & A-level past paper questions
                  and answers.
                </p>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "image" | "text")}
              className="w-full max-w-3xl"
            >
              <div
                className={cn(
                  "flex flex-col gap-6",
                  !results && "items-center"
                )}
              >
                <div className="w-full flex items-center gap-4 justify-center flex-wrap">
                  <TabsList
                    className={cn(
                      "grid grid-cols-2 p-1 bg-muted/40 backdrop-blur-sm border shadow-sm",
                      results ? "w-48" : "w-64"
                    )}
                  >
                    <TabsTrigger
                      value="text"
                      className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all cursor-pointer"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Image
                    </TabsTrigger>
                  </TabsList>
                  <OptionalFilters
                    currentFilter={currentFilter}
                    setCurrentFilter={setCurrentFilter}
                    searchButtonPortalRef={searchButtonPortalRef}
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    isInputValid={isInputValid}
                    isDuplicateQuery={isDuplicateQuery}
                  />
                  <SearchHistory
                    onSelectHistory={handleHistorySelect}
                    className={!results ? "bg-muted/40" : ""}
                  />
                  <SearchPastPaper>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2 h-10 px-4 rounded-sm cursor-pointer border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground",
                        !results && "w-[180px] bg-muted/40"
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Past Paper Navigator</span>
                    </Button>
                  </SearchPastPaper>
                </div>

                <TabsContent value="text" className="mt-0 w-full mb-2">
                  <div
                    className={cn("relative group transition-all duration-300")}
                  >
                    <div className="flex items-start pt-4 pointer-events-none absolute inset-y-0 pl-5 z-10">
                      <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Textarea
                      disabled={isSearching}
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onMouseUp={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        setTextareaHeight(target.offsetHeight);
                      }}
                      placeholder="Search for questions (e.g. 'Two particles P and Q of masses 0.2kg')..."
                      style={
                        textareaHeight
                          ? { height: `${textareaHeight}px` }
                          : undefined
                      }
                      className={cn(
                        "min-h-14 h-auto px-14 pt-4 text-lg rounded-2xl border-muted-foreground/20 bg-background/60 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-primary/30 focus:border-primary focus:shadow-lg focus:ring-4 focus:ring-primary/10 resize-y max-h-[500px]",
                        isQueryTooLong &&
                          "border-destructive focus:border-destructive focus:ring-destructive/10"
                      )}
                    />
                    {isQueryTooLong && (
                      <p className="text-sm text-destructive mt-2 ml-1">
                        Query is too long. Please reduce by {excessCharacters}{" "}
                        character{excessCharacters > 1 ? "s" : ""}.
                      </p>
                    )}
                    {textQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isSearching}
                        onClick={() => setTextQuery("")}
                        className="absolute inset-y-0 cursor-pointer right-3 mt-2 h-9 w-9 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="image"
                  className="mt-0 w-full flex items-center justify-center flex-col mb-2"
                >
                  <div
                    className={cn(
                      "relative border-2 border-dashed rounded-3xl transition-all overflow-hidden w-full h-48 sm:h-64  max-w-lg ",
                      previewUrl
                        ? "border-primary/50 bg-primary/5"
                        : imageError
                        ? "border-destructive/50 bg-destructive/5 hover:border-destructive/60"
                        : "border-muted-foreground/20 hover:border-primary/40 bg-muted/5 hover:bg-muted/20"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {previewUrl ? (
                      <div className="absolute z-20 inset-0 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
                        <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSearching}
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            title="Choose Another Image"
                            className="cursor-pointer h-8 px-3 rounded-full bg-background/80 hover:bg-background shadow-sm border backdrop-blur-md text-xs"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Change
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isSearching}
                            onClick={(e) => {
                              e.stopPropagation();
                              clearImage();
                            }}
                            title="Clear Image"
                            className="cursor-pointer h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm border backdrop-blur-md"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                        <PhotoProvider>
                          <PhotoView src={previewUrl}>
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-full rounded-xl object-contain shadow-lg cursor-pointer"
                            />
                          </PhotoView>
                        </PhotoProvider>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-full bg-muted/50 mb-4 flex items-center justify-center transition-transform group-hover:scale-110",
                            imageError && "bg-destructive/5"
                          )}
                        >
                          <Upload
                            className={cn(
                              "w-8 h-8 text-muted-foreground",
                              imageError && "text-destructive"
                            )}
                          />
                        </div>
                        <p className="text-lg font-medium text-foreground">
                          Drop an image here
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or click to upload screenshot (max 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {imageError && (
                    <p className="text-sm text-destructive mt-2">
                      {imageError}
                    </p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
            <div className="flex gap-3 w-full max-w-3xl justify-center">
              <div ref={searchButtonPortalRef} className="w-full" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4">
          {error && (
            <div className="p-4 bg-destructive/5 text-destructive rounded-2xl border border-destructive/20 mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 bg-destructive/10 rounded-full">
                <X className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">Search failed</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary/40 animate-pulse" />
                </div>
              </div>
              <p className="text-muted-foreground mt-2 font-medium tracking-tight">
                Searching
                <span className="inline-flex w-6">
                  <span className="animate-[dot_1.4s_ease-in-out_infinite]">
                    .
                  </span>
                  <span className="animate-[dot_1.4s_ease-in-out_0.2s_infinite]">
                    .
                  </span>
                  <span className="animate-[dot_1.4s_ease-in-out_0.4s_infinite]">
                    .
                  </span>
                </span>
              </p>
              <style jsx>{`
                @keyframes dot {
                  0%,
                  20% {
                    opacity: 0;
                  }
                  40% {
                    opacity: 1;
                  }
                  60%,
                  100% {
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          )}
          <MainContent
            results={results}
            isSearching={isSearching}
            enableSavedActivitiesQuery={hasSearched}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
