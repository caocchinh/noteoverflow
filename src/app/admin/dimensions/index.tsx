/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectedQuestion } from "@/features/topical/types/models";

interface Question {
  id: string;
  questionImages: string[];
  answers: string[];
}

export default function ImageDimensionsClient() {
  const queryClient = useQueryClient();

  // Processing State
  const [processParams, setProcessParams] = useState({ offset: 0, limit: 10 });
  const [processResult, setProcessResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({
    current: 0,
    total: 0,
    processed: 0,
    failed: 0,
    skipped: 0,
  });

  // Stats Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dimensions-stats"],
    queryFn: async () => {
      const { data, error } = await api.admin.dimensions.stats.get();
      if (error) throw error;
      return data;
    },
  });

  // Process a single question
  const processSingleQuestion = async (question: Question) => {
    const { data, error } = await api.admin.dimensions.process.post({
      id: question.id,
      questionImages: question.questionImages,
      answers: question.answers,
    });

    if (error) {
      // @ts-expect-error type inference issue
      throw new Error(error.value.error || "Processing failed");
    }

    return data;
  };

  const handleProcessDimensions = useCallback(async () => {
    setProcessResult(null);
    setError(null);
    setIsProcessing(true);
    setCurrentProgress({
      current: 0,
      total: 0,
      processed: 0,
      failed: 0,
      skipped: 0,
    });

    try {
      // Step 1: Fetch all unprocessed questions
      const { data: questionsData, error: fetchError } =
        await api.admin.dimensions.questions.get({
          query: processParams,
        });

      if (fetchError) {
        // @ts-expect-error type inference issue
        throw new Error(fetchError.value.error || "Failed to fetch questions");
      }

      const questions = questionsData.questions as SelectedQuestion[];

      if (questions.length === 0) {
        setProcessResult({
          message: "No questions to process",
          progress: { processed: 0, failed: 0, skipped: 0 },
        });
        setIsProcessing(false);
        return;
      }

      setCurrentProgress((prev) => ({ ...prev, total: questions.length }));

      // Step 2: Loop through each question and process it
      let totalProcessed = 0;
      let totalFailed = 0;
      let totalSkipped = 0;

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        try {
          setCurrentProgress((prev) => ({ ...prev, current: i + 1 }));

          const result = await processSingleQuestion(question);

          totalProcessed += result.processed || 0;
          totalFailed += result.failed || 0;
          totalSkipped += result.skipped || 0;

          setCurrentProgress((prev) => ({
            ...prev,
            processed: totalProcessed,
            failed: totalFailed,
            skipped: totalSkipped,
          }));
        } catch (err: any) {
          console.error(`Failed to process question ${question.id}:`, err);
          totalFailed++;
          setCurrentProgress((prev) => ({
            ...prev,
            failed: totalFailed,
          }));
        }
      }

      // Update final result
      const finalResult = {
        message: `Processed ${totalProcessed} images (${totalFailed} failed, ${totalSkipped} skipped)`,
        progress: {
          processed: totalProcessed,
          failed: totalFailed,
          skipped: totalSkipped,
        },
      };

      setProcessResult(finalResult);

      // Update stats
      queryClient.setQueryData(["dimensions-stats"], (oldStats: any) => {
        if (!oldStats) return oldStats;

        return {
          ...oldStats,
          processed: oldStats.processed + questions.length - totalFailed,
          notProcessed: Math.max(
            0,
            oldStats.notProcessed - (questions.length - totalFailed),
          ),
          total: oldStats.total,
        };
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [processParams, queryClient]);

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Image Dimensions Admin</h1>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="py-4">
                <div className="h-8 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2 mx-auto mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-green-600 text-center">
                  {stats.processed}
                </CardTitle>
                <CardDescription className="text-center">
                  Processed
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-gray-600 text-center">
                  {stats.notProcessed}
                </CardTitle>
                <CardDescription className="text-center">
                  Not Processed
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-purple-600 text-center">
                  {stats.total}
                </CardTitle>
                <CardDescription className="text-center">Total</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )
      )}

      {/* Processing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Dimension Processing</CardTitle>
          <CardDescription>
            Process image dimensions for questions that haven&apos;t been
            processed yet. This will fetch each question image and extract its
            width and height.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offset">Offset</Label>
              <Input
                id="offset"
                type="number"
                value={processParams.offset}
                onChange={(e) =>
                  setProcessParams((p) => ({
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
                value={processParams.limit}
                onChange={(e) =>
                  setProcessParams((p) => ({
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
            onClick={handleProcessDimensions}
            disabled={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            {isProcessing
              ? `Processing ${currentProgress.current}/${currentProgress.total}...`
              : "Process Dimensions"}
          </Button>

          {/* Current Progress Indicator */}
          {isProcessing && currentProgress.total > 0 && (
            <div className="p-4 bg-blue-50 rounded-md text-sm border border-blue-200 dark:bg-blue-900/30">
              <p className="font-semibold mb-2">
                Processing question {currentProgress.current} of{" "}
                {currentProgress.total}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-100 p-2 rounded dark:bg-green-900/30">
                  <div className="text-xl font-bold text-green-700 dark:text-green-400">
                    {currentProgress.processed}
                  </div>
                  <div className="text-xs text-green-800 dark:text-green-500">
                    Processed
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

          {processResult && (
            <div className="p-4 bg-muted rounded-md text-sm border">
              <p className="font-semibold mb-2">{processResult.message}</p>
              {processResult.progress && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-100 p-2 rounded dark:bg-green-900/30">
                    <div className="text-xl font-bold text-green-700 dark:text-green-400">
                      {processResult.progress.processed}
                    </div>
                    <div className="text-xs text-green-800 dark:text-green-500">
                      Processed
                    </div>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded dark:bg-yellow-900/30">
                    <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                      {processResult.progress.skipped}
                    </div>
                    <div className="text-xs text-yellow-800 dark:text-yellow-500">
                      Skipped
                    </div>
                  </div>
                  <div className="bg-red-100 p-2 rounded dark:bg-red-900/30">
                    <div className="text-xl font-bold text-red-700 dark:text-red-400">
                      {processResult.progress.failed}
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

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
