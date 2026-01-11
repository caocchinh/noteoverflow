/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import {
  SelectedQuestion,
  VectorizeSelectedQuestion,
} from "@/features/topical/constants/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VisualSearchIndexClient() {
  const [activeTab, setActiveTab] = useState<"image" | "text" | "index">(
    "image"
  );
  const [results, setResults] = useState<SelectedQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // Image Search State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Text Search State
  const [textQuery, setTextQuery] = useState("");

  // Filter State
  const [filterSubject, setFilterSubject] = useState("");
  const [filterCurriculum, setFilterCurriculum] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [filterPaperType, setFilterPaperType] = useState("");

  const queryClient = useQueryClient();

  // Indexing State
  const [indexParams, setIndexParams] = useState({ offset: 0, limit: 10 });
  const [indexResult, setIndexResult] = useState<any>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({
    current: 0,
    total: 0,
    indexed: 0,
    failed: 0,
    skipped: 0,
  });

  // Stats Query
  const { data: stats } = useQuery({
    queryKey: ["visual-search-stats"],
    queryFn: async () => {
      const { data, error } = await api.admin["visual-search"].stats.get();
      if (error) throw error;
      return data;
    },
    enabled: activeTab === "index",
  });

  // Process a single question
  const indexSingleQuestion = async (question: {
    id: string;
    questionImages: string[];
    answers: string[];
    subjectId: string;
    curriculumName: string;
    year: string;
    season: string;
    paperType: string;
  }) => {
    const { data, error } = await api.admin["visual-search"].process.post({
      id: question.id,
      questionImages: question.questionImages,
      answers: question.answers,
      subjectId: question.subjectId || "",
      curriculumName: question.curriculumName || "",
      year: question.year?.toString() || "0",
      season: question.season || "",
      paperType: question.paperType?.toString() || "0",
    });

    if (error) {
      // @ts-expect-error type inference issue
      throw new Error(error.value.error || "Indexing failed");
    }

    return data;
  };

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
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

  const getFilters = useCallback(() => {
    const filters: {
      subject?: string;
      curriculum?: string;
      year?: string[];
      season?: string[];
      paperType?: string[];
    } = {};

    if (filterSubject.trim()) filters.subject = filterSubject.trim();
    if (filterCurriculum.trim()) filters.curriculum = filterCurriculum.trim();

    if (filterYear.trim()) {
      filters.year = filterYear
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    if (filterSeason.trim()) {
      filters.season = filterSeason
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    if (filterPaperType.trim()) {
      filters.paperType = filterPaperType
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [
    filterSubject,
    filterCurriculum,
    filterYear,
    filterSeason,
    filterPaperType,
  ]);

  const handleImageSearch = useCallback(async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setExtractedText(null);

    try {
      const { data, error } = await api["visual-search"].search.post({
        imageBase64: selectedImage,
        filter: getFilters(),
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Search failed");
      }

      setResults(data as VectorizeSelectedQuestion[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedImage, getFilters]);

  const handleTextSearch = useCallback(async () => {
    if (!textQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setExtractedText(null);

    try {
      const { data, error } = await api["visual-search"].text.post({
        query: textQuery,
        filter: getFilters(),
      });

      if (error) {
        // @ts-expect-error Wait for the library to fix the type inference
        throw new Error(error.value.error || "Search failed");
      }

      setResults(data as VectorizeSelectedQuestion[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [textQuery, getFilters]);

  const handleIndexQuestions = useCallback(async () => {
    setIndexResult(null);
    setError(null);
    setIsIndexing(true);
    setCurrentProgress({
      current: 0,
      total: 0,
      indexed: 0,
      failed: 0,
      skipped: 0,
    });

    try {
      // Step 1: Fetch all unindexed questions
      const { data: questionsData, error: fetchError } = await api.admin[
        "visual-search"
      ].questions.get({
        query: indexParams,
      });

      if (fetchError) {
        // @ts-expect-error type inference issue
        throw new Error(fetchError.value.error || "Failed to fetch questions");
      }

      const questions = questionsData.questions;

      if (questions.length === 0) {
        setIndexResult({
          message: "No questions to index",
          progress: { indexed: 0, failed: 0, skipped: 0 },
        });
        setIsIndexing(false);
        return;
      }

      setCurrentProgress((prev) => ({ ...prev, total: questions.length }));

      // Step 2: Loop through each question and index it
      let totalIndexed = 0;
      let totalFailed = 0;
      let totalSkipped = 0;

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        try {
          setCurrentProgress((prev) => ({ ...prev, current: i + 1 }));

          const result = await indexSingleQuestion(question);

          totalIndexed += result.indexed || 0;
          totalFailed += result.failed || 0;
          totalSkipped += result.skipped || 0;

          setCurrentProgress((prev) => ({
            ...prev,
            indexed: totalIndexed,
            failed: totalFailed,
            skipped: totalSkipped,
          }));
        } catch (err: any) {
          console.error(`Failed to index question ${question.id}:`, err);
          totalFailed++;
          setCurrentProgress((prev) => ({
            ...prev,
            failed: totalFailed,
          }));
        }
      }

      // Update final result
      const finalResult = {
        message: `Indexed ${totalIndexed} images (${totalFailed} failed, ${totalSkipped} skipped)`,
        progress: {
          indexed: totalIndexed,
          failed: totalFailed,
          skipped: totalSkipped,
        },
      };

      setIndexResult(finalResult);

      // Update stats
      queryClient.setQueryData(["visual-search-stats"], (oldStats: any) => {
        if (!oldStats) return oldStats;

        return {
          ...oldStats,
          indexed: oldStats.indexed + questions.length - totalFailed,
          notIndexed: Math.max(
            0,
            oldStats.notIndexed - (questions.length - totalFailed)
          ),
          total: oldStats.total,
        };
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsIndexing(false);
    }
  }, [indexParams, queryClient]);

  // Common Filters Component to avoid duplication
  const CommonFilters = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              placeholder="e.g. Math"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="curriculum">Curriculum</Label>
            <Input
              id="curriculum"
              value={filterCurriculum}
              onChange={(e) => setFilterCurriculum(e.target.value)}
              placeholder="e.g. Cambridge"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year (comma-separated)</Label>
            <Input
              id="year"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              placeholder="e.g. 2023, 2024"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="season">Season (comma-separated)</Label>
            <Input
              id="season"
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              placeholder="e.g. m, s, w"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paperType">Paper Type (comma-separated)</Label>
            <Input
              id="paperType"
              value={filterPaperType}
              onChange={(e) => setFilterPaperType(e.target.value)}
              placeholder="e.g. 1, 2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Visual Search Admin</h1>
      </div>

      <Tabs
        defaultValue="image"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" className="cursor-pointer">
            Image Search
          </TabsTrigger>
          <TabsTrigger value="text" className="cursor-pointer">
            Text Search
          </TabsTrigger>
          <TabsTrigger value="index" className="cursor-pointer">
            Indexing
          </TabsTrigger>
        </TabsList>

        {/* Filters - Visible for Search Tabs */}
        {activeTab !== "index" && <CommonFilters />}

        <TabsContent value="image" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search by Image</CardTitle>
              <CardDescription>
                Upload an image to search for similar questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="mt-4 border rounded-lg overflow-hidden w-fit bg-slate-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 object-contain"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleImageSearch}
                disabled={!selectedImage || loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Searching..." : "Search by Image"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search by Text</CardTitle>
              <CardDescription>
                Enter a text query to search for questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-query">Search Query</Label>
                <Input
                  id="text-query"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="Enter specific question text..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleTextSearch}
                disabled={!textQuery.trim() || loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Searching..." : "Search by Text"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="index" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-2xl text-blue-600 text-center">
                    {stats.indexed}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Indexed
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-2xl text-gray-600 text-center">
                    {stats.notIndexed}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Not Indexed
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-2xl text-purple-600 text-center">
                    {stats.total}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Total
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Bulk Indexing</CardTitle>
              <CardDescription>
                Index questions into the vector database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offset">Offset</Label>
                  <Input
                    id="offset"
                    type="number"
                    value={indexParams.offset}
                    onChange={(e) =>
                      setIndexParams((p) => ({
                        ...p,
                        offset: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={indexParams.limit}
                    onChange={(e) =>
                      setIndexParams((p) => ({
                        ...p,
                        limit: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <Button
                onClick={handleIndexQuestions}
                disabled={isIndexing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              >
                {isIndexing
                  ? `Indexing ${currentProgress.current}/${currentProgress.total}...`
                  : "Start Indexing"}
              </Button>

              {/* Current Progress Indicator */}
              {isIndexing && currentProgress.total > 0 && (
                <div className="p-4 bg-blue-50 rounded-md text-sm border border-blue-200 dark:bg-blue-900/30">
                  <p className="font-semibold mb-2">
                    Indexing question {currentProgress.current} of{" "}
                    {currentProgress.total}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-100 p-2 rounded dark:bg-green-900/30">
                      <div className="text-xl font-bold text-green-700 dark:text-green-400">
                        {currentProgress.indexed}
                      </div>
                      <div className="text-xs text-green-800 dark:text-green-500">
                        Indexed
                      </div>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded dark:bg-yellow-900/30">
                      <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                        {currentProgress.skipped}
                      </div>
                      <div className="text-xs text-yellow-800 dark:text-yellow-500">
                        Skipped
                      </div>
                    </div>
                    <div className="bg-red-100 p-2 rounded dark:bg-red-900/30">
                      <div className="text-xl font-bold text-red-700 dark:text-red-400">
                        {currentProgress.failed}
                      </div>
                      <div className="text-xs text-red-800 dark:text-red-500">
                        Failed
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {indexResult && (
                <div className="p-4 bg-muted rounded-md text-sm border">
                  <p className="font-semibold mb-2">{indexResult.message}</p>
                  {indexResult.progress && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-100 p-2 rounded dark:bg-green-900/30">
                        <div className="text-xl font-bold text-green-700 dark:text-green-400">
                          {indexResult.progress.indexed}
                        </div>
                        <div className="text-xs text-green-800 dark:text-green-500">
                          Indexed
                        </div>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded dark:bg-yellow-900/30">
                        <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                          {indexResult.progress.skipped}
                        </div>
                        <div className="text-xs text-yellow-800 dark:text-yellow-500">
                          Skipped
                        </div>
                      </div>
                      <div className="bg-red-100 p-2 rounded dark:bg-red-900/30">
                        <div className="text-xl font-bold text-red-700 dark:text-red-400">
                          {indexResult.progress.failed}
                        </div>
                        <div className="text-xs text-red-800 dark:text-red-500">
                          Failed
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Extracted Text Debug */}
      {extractedText && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground uppercase tracking-wider">
              OCR Extracted Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap border">
              {extractedText}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Results</h2>
            <Badge variant="secondary" className="px-3 py-1">
              {results.length} found
            </Badge>
          </div>

          {results.length === 0 ? (
            <p className="text-muted-foreground italic">No matches found.</p>
          ) : (
            <div className="grid gap-6">
              {results.map((result) => (
                <Card key={result.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            ID: {result.id}
                          </span>
                        </div>
                        <CardTitle className="text-lg">
                          {result.season} {result.year} - paper{" "}
                          {result.paperType}
                        </CardTitle>
                        {result.topics && result.topics.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {result.topics.map((topic, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-4">
                    <div className="gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 flex flex-col">
                      {result.questionImages?.map(
                        (img: string, idx: number) => (
                          <div
                            key={`q-${idx}`}
                            className="shrink-0 relative group w-full "
                          >
                            <Badge className="absolute top-0 left-0 rounded-tl-none rounded-br-md rounded-tr-none rounded-bl-none z-10 pointer-events-none">
                              Q
                            </Badge>
                            <img
                              src={img}
                              alt={`Question ${idx + 1}`}
                              className="w-full rounded-md border bg-white object-contain"
                            />
                          </div>
                        )
                      )}
                      {/* Display Answer Images */}
                      {result.answers?.map((img: string, idx: number) => (
                        <div
                          key={`a-${idx}`}
                          className="shrink-0 relative group"
                        >
                          <Badge
                            variant="default"
                            className="absolute top-0 left-0 rounded-tl-none rounded-br-md rounded-tr-none rounded-bl-none z-10 pointer-events-none bg-emerald-600 hover:bg-emerald-600"
                          >
                            A
                          </Badge>
                          {/\.(webp|png|jpg|jpeg|gif|bmp|svg)$/i.test(img) ? (
                            <img
                              src={img}
                              alt={`Answer ${idx + 1}`}
                              className="h-40 rounded-md border bg-white object-contain"
                            />
                          ) : (
                            <div className="h-40 w-48 p-3 text-xs overflow-y-auto bg-muted border rounded-md font-mono">
                              {img}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
