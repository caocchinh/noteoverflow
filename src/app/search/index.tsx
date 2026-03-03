/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import MainContent from "@/features/search/components/MainContent";
import OptionalFilters, {
  OptionalFiltersHandle,
} from "@/features/search/components/OptionalFilters";
import SearchHistory from "@/features/search/components/SearchHistory";
import SearchPastPaper from "@/features/search/components/SearchPastPaper";
import {
  getRandomPhrase,
  MAX_IMAGE_UPLOAD_SIZE,
  MAX_QUERY_LENGTH,
} from "@/features/search/constants/constants";
import { OptionalSearchFilter } from "@/features/search/constants/type";
import { updateSearchQueryParam, validateSearchFilter } from "@/features/search/lib/lib";
import "@/features/topical/components/react-photo-view.css";
import { hashUltil } from "@/features/topical/lib/utils";
import { VectorizeSelectedQuestion } from "@/features/topical/types/models";
import { addSearchHistory, SearchHistoryItem } from "@/lib/client-cache";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FileText, ImageIcon, Search, Type, Upload, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";

const SearchClient = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const [activeTab, setActiveTab] = useState<"image" | "text">("text");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [textareaHeight, setTextareaHeight] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  const [activeSearchType, setActiveSearchType] = useState<"image" | "text" | null>(null);

  const randomPhrase = useMemo(() => getRandomPhrase(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchButtonPortalRef = useRef<HTMLDivElement | null>(null);
  const optionalFiltersRef = useRef<OptionalFiltersHandle>(null);

  const [queryKey, setQueryKey] = useState<string | null>(null);
  const [activeTextQuery, setActiveTextQuery] = useState<string | null>(null);
  const [activeImageQuery, setActiveImageQuery] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<OptionalSearchFilter | null>(null);

  const searchQuery = useQuery({
    queryKey: ["search", queryKey ?? "none"],
    queryFn: async (): Promise<VectorizeSelectedQuestion[]> => {
      if (!(activeTextQuery || activeImageQuery) && !activeSearchType) {
        throw new Error("No search query");
      }
      setFilterError(null);

      if (activeSearchType === "image") {
        const { data, error } = await api["visual-search"].search.post({
          imageBase64: activeImageQuery,
          filter: currentFilter ?? undefined,
        });

        if (error) {
          // @ts-expect-error Wait for the library to fix the type inference
          throw new Error(error.value.error || "Search failed");
        }

        return data as VectorizeSelectedQuestion[];
      } else {
        const { data, error } = await api["visual-search"].text.post({
          query: activeTextQuery,
          filter: currentFilter ?? undefined,
        });

        if (error) {
          // @ts-expect-error Wait for the library to fix the type inference
          throw new Error(error.value.error || "Search failed");
        }

        return data as VectorizeSelectedQuestion[];
      }
    },
    enabled: !!activeTextQuery || (!!activeImageQuery && !!activeSearchType && !!queryKey),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Derived state from query
  const isSearching = searchQuery.isFetching;
  const error = searchQuery.error?.message || null;
  const results = searchQuery.data || null;
  const hasSearched = !!activeTextQuery || !!activeImageQuery;

  // Character limit validation
  const excessCharacters = textQuery.length - MAX_QUERY_LENGTH;
  const isQueryTooLong = excessCharacters > 0;
  const isInputValid =
    activeTab === "image" ? !!selectedImage : textQuery.trim().length > 0 && !isQueryTooLong;

  useEffect(() => {
    if (!searchParams) return;
    const rawQuery = searchParams.q;
    const queryParam = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;

    // Read filter from URL params
    const rawFilter = searchParams.filter;
    const filterParam = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter;
    let parsedFilter: OptionalSearchFilter | null = null;
    let isFilterValid = false;

    if (filterParam) {
      try {
        parsedFilter = JSON.parse(filterParam);

        // Validate filter using the shared validation function
        const validationError = validateSearchFilter(parsedFilter);

        if (validationError) {
          parsedFilter = null;
          setFilterError(validationError);
        } else {
          setCurrentFilter(parsedFilter);
          isFilterValid = true;
          setFilterError(null);
        }
      } catch {
        // Invalid filter JSON, ignore
        setFilterError("Invalid filter format");
      }
    }

    if (queryParam && queryParam.trim().length > 0) {
      setTextQuery(queryParam);
      setActiveTab("text");

      if (queryParam.length <= MAX_QUERY_LENGTH && isFilterValid) {
        setTimeout(() => {
          handleTextSearch({
            filter: parsedFilter,
            query: queryParam,
          });
        }, 0);
      }
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
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
        setImageError(`Image size exceeds 2MB limit. Please upload a smaller image.`);
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
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleImageSearch = useCallback(
    (params: {
      image: string;
      filter: OptionalSearchFilter | null;
      previewUrl?: string | null;
    }) => {
      const { image, filter, previewUrl: providedPreviewUrl } = params;
      if (!image) return;

      setActiveImageQuery(image);
      setActiveSearchType("image");
      addSearchHistory({
        type: "image",
        query: image,
        previewUrl: providedPreviewUrl ?? undefined,
        filter: filter ?? undefined,
      });
      const hashInput = JSON.stringify({
        query: image,
        filter: filter,
      });
      setTimeout(() => {
        hashUltil(hashInput).then(setQueryKey);
      }, 0);
    },
    [],
  );

  const handleTextSearch = useCallback(
    (params: { query: string; filter: OptionalSearchFilter | null }) => {
      const { query, filter } = params;
      if (!query.trim()) return;
      setActiveTextQuery(query.trim());
      updateSearchQueryParam(query.trim(), filter);
      setActiveSearchType("text");
      addSearchHistory({
        type: "text",
        query: query.trim(),
        filter: filter ?? undefined,
      });
      const hashInput = JSON.stringify({
        query: query.trim(),
        filter: filter,
      });
      setTimeout(() => {
        hashUltil(hashInput).then(setQueryKey);
      }, 0);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (textQuery.trim()) {
          optionalFiltersRef.current?.applyFilters();
        }
      }
    },
    [textQuery],
  );

  const handleSearch = useCallback(
    ({ filter }: { filter: OptionalSearchFilter | null }) => {
      if (activeTab === "text") {
        handleTextSearch({ query: textQuery, filter });
      } else {
        handleImageSearch({
          image: selectedImage || "",
          filter,
          previewUrl,
        });
      }
    },
    [activeTab, handleTextSearch, handleImageSearch, textQuery, selectedImage, previewUrl],
  );

  const handleHistorySelect = useCallback(
    (item: SearchHistoryItem) => {
      const filterToUse = item.filter || null;
      setCurrentFilter(filterToUse);

      if (item.type === "text") {
        setActiveTab("text");
        setTextQuery(item.query);
        handleTextSearch({ query: item.query, filter: filterToUse });
      } else {
        setActiveTab("image");
        setSelectedImage(item.query);
        setPreviewUrl(item.previewUrl || null);
        handleImageSearch({
          image: item.query,
          filter: filterToUse,
          previewUrl: item.imageData || null,
        });
      }
    },
    [handleImageSearch, handleTextSearch],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeTab === "image") {
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      if (activeTextQuery) {
        updateSearchQueryParam(activeTextQuery, currentFilter);
      }
    }
  }, [activeTab, activeTextQuery, currentFilter]);

  const handleTabChange = useCallback((value: string) => {
    const newTab = value as "image" | "text";
    setActiveTab(newTab);
  }, []);

  return (
    <div
      className={cn(
        "from-background via-muted/10 to-muted/30 min-h-screen bg-linear-to-b pt-20 pb-12",
        !isSearching && hasSearched ? "pb-18" : "",
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "mx-auto transition-all duration-700 ease-out",
            !results ? "w-full" : "max-w-full",
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            {!hasSearched && (
              <div className="text-center">
                <h1 className="from-logo-main to-logo-main/60 bg-linear-to-r bg-clip-text pb-4 text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:to-white">
                  {randomPhrase}
                </h1>
                <p className="text-muted-foreground mx-auto -mt-2 text-lg">
                  Search through thousands of AS & A-level past paper questions and answers.
                </p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-3xl">
              <div className={cn("flex flex-col gap-6", !results && "items-center")}>
                <div className="flex w-full flex-wrap items-center justify-center gap-4">
                  <TabsList
                    className={cn(
                      "bg-muted/40 grid grid-cols-2 border p-1 shadow-sm backdrop-blur-sm",
                      results ? "w-48" : "w-64",
                    )}
                  >
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-background cursor-pointer rounded-sm transition-all data-[state=active]:shadow-sm"
                    >
                      <Type className="mr-2 h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="data-[state=active]:bg-background cursor-pointer rounded-sm transition-all data-[state=active]:shadow-sm"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Image
                    </TabsTrigger>
                  </TabsList>
                  <OptionalFilters
                    ref={optionalFiltersRef}
                    currentFilter={currentFilter}
                    setCurrentFilter={setCurrentFilter}
                    searchButtonPortalRef={searchButtonPortalRef}
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    isInputValid={isInputValid}
                  />
                  <SearchHistory
                    onSelectHistory={handleHistorySelect}
                    className={!results ? "bg-muted/40" : ""}
                    isSearching={isSearching}
                  />
                  <SearchPastPaper>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground h-10 cursor-pointer gap-2 rounded-sm px-4 transition-all",
                        !results && "bg-muted/40 w-[180px]",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Past Paper Navigator</span>
                    </Button>
                  </SearchPastPaper>
                </div>

                <TabsContent value="text" className="mt-0 mb-2 w-full">
                  <div className={cn("group relative transition-all duration-300")}>
                    <div className="pointer-events-none absolute inset-y-0 z-10 flex items-start pt-4 pl-5">
                      <Search className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
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
                      style={textareaHeight ? { height: `${textareaHeight}px` } : undefined}
                      className={cn(
                        "border-muted-foreground/20 bg-background/60 hover:border-primary/30 focus:border-primary focus:ring-primary/10 h-auto max-h-[500px] min-h-14 resize-y rounded-2xl px-14 pt-4 text-lg shadow-sm backdrop-blur-xl hover:shadow-md focus:shadow-lg focus:ring-4",
                        isQueryTooLong &&
                          "border-destructive focus:border-destructive focus:ring-destructive/10",
                      )}
                    />
                    {isQueryTooLong && (
                      <p className="text-destructive mt-2 ml-1 text-sm">
                        Query is too long. Please reduce by {excessCharacters} character
                        {excessCharacters > 1 ? "s" : ""}.
                      </p>
                    )}
                    {textQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isSearching}
                        onClick={() => setTextQuery("")}
                        className="hover:bg-muted text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 mt-2 h-9 w-9 cursor-pointer rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="image"
                  className="mt-0 mb-2 flex w-full flex-col items-center justify-center"
                >
                  <div
                    className={cn(
                      "relative h-48 w-full max-w-lg overflow-hidden rounded-3xl border-2 border-dashed transition-all sm:h-64",
                      previewUrl
                        ? "border-primary/50 bg-primary/5"
                        : imageError
                          ? "border-destructive/50 bg-destructive/5 hover:border-destructive/60"
                          : "border-muted-foreground/20 hover:border-primary/40 bg-muted/5 hover:bg-muted/20",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    />
                    {previewUrl ? (
                      <div className="bg-background/50 absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-sm">
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
                            className="bg-background/80 hover:bg-background h-8 cursor-pointer rounded-full border px-3 text-xs shadow-sm backdrop-blur-md"
                          >
                            <Upload className="mr-1 h-4 w-4" />
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
                            className="bg-background/80 hover:bg-background h-8 w-8 cursor-pointer rounded-full border shadow-sm backdrop-blur-md"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <PhotoProvider>
                          <PhotoView src={previewUrl}>
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-h-full max-w-full cursor-pointer rounded-xl object-contain shadow-lg"
                            />
                          </PhotoView>
                        </PhotoProvider>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div
                          className={cn(
                            "bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110",
                            imageError && "bg-destructive/5",
                          )}
                        >
                          <Upload
                            className={cn(
                              "text-muted-foreground h-8 w-8",
                              imageError && "text-destructive",
                            )}
                          />
                        </div>
                        <p className="text-foreground text-lg font-medium">Drop an image here</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          or click to upload screenshot (max 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {imageError && <p className="text-destructive mt-2 text-sm">{imageError}</p>}
                </TabsContent>
              </div>
            </Tabs>
            <div className="flex w-full max-w-3xl justify-center gap-3">
              <div ref={searchButtonPortalRef} className="w-full" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-7xl">
          {filterError && (
            <div className="bg-destructive/5 text-destructive border-destructive/20 animate-in fade-in slide-in-from-bottom-2 mb-8 flex items-center gap-3 rounded-2xl border p-4">
              <div className="bg-destructive/10 rounded-full p-2">
                <X className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Invalid filter</p>
                <p className="text-sm opacity-90">{filterError}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-destructive/5 text-destructive border-destructive/20 animate-in fade-in slide-in-from-bottom-2 mb-8 flex items-center gap-3 rounded-2xl border p-4">
              <div className="bg-destructive/10 rounded-full p-2">
                <X className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Search failed</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {isSearching && (
            <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center py-6 duration-500">
              <div className="relative">
                <div className="border-primary/20 border-t-primary h-16 w-16 animate-spin rounded-full border-4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="text-primary/40 h-6 w-6 animate-pulse" />
                </div>
              </div>
              <p className="text-muted-foreground mt-2 font-medium tracking-tight">
                Searching
                <span className="inline-flex w-6">
                  <span className="animate-[dot_1.4s_ease-in-out_infinite]">.</span>
                  <span className="animate-[dot_1.4s_ease-in-out_0.2s_infinite]">.</span>
                  <span className="animate-[dot_1.4s_ease-in-out_0.4s_infinite]">.</span>
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
            currentTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchClient;
