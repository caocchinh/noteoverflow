/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectedQuestion } from "@/features/topical/types/models";
import { api } from "@/lib/eden";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

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
      const { data: questionsData, error: fetchError } = await api.admin.dimensions.questions.get({
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
          notProcessed: Math.max(0, oldStats.notProcessed - (questions.length - totalFailed)),
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
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Image Dimensions Admin</h1>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="py-4">
                <div className="bg-muted h-8 animate-pulse rounded" />
                <div className="bg-muted mx-auto mt-2 h-4 w-1/2 animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        stats && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-center text-2xl text-green-600">
                  {stats.processed}
                </CardTitle>
                <CardDescription className="text-center">Processed</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-center text-2xl text-gray-600">
                  {stats.notProcessed}
                </CardTitle>
                <CardDescription className="text-center">Not Processed</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-center text-2xl text-purple-600">
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
            Process image dimensions for questions that haven&apos;t been processed yet. This will
            fetch each question image and extract its width and height.
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
            className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing
              ? `Processing ${currentProgress.current}/${currentProgress.total}...`
              : "Process Dimensions"}
          </Button>

          {/* Current Progress Indicator */}
          {isProcessing && currentProgress.total > 0 && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm dark:bg-blue-900/30">
              <p className="mb-2 font-semibold">
                Processing question {currentProgress.current} of {currentProgress.total}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-green-100 p-2 dark:bg-green-900/30">
                  <div className="text-xl font-bold text-green-700 dark:text-green-400">
                    {currentProgress.processed}
                  </div>
                  <div className="text-xs text-green-800 dark:text-green-500">Processed</div>
                </div>
                <div className="rounded bg-yellow-100 p-2 dark:bg-yellow-900/30">
                  <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                    {currentProgress.skipped}
                  </div>
                  <div className="text-xs text-yellow-800 dark:text-yellow-500">Skipped</div>
                </div>
                <div className="rounded bg-red-100 p-2 dark:bg-red-900/30">
                  <div className="text-xl font-bold text-red-700 dark:text-red-400">
                    {currentProgress.failed}
                  </div>
                  <div className="text-xs text-red-800 dark:text-red-500">Failed</div>
                </div>
              </div>
            </div>
          )}

          {processResult && (
            <div className="bg-muted rounded-md border p-4 text-sm">
              <p className="mb-2 font-semibold">{processResult.message}</p>
              {processResult.progress && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-green-100 p-2 dark:bg-green-900/30">
                    <div className="text-xl font-bold text-green-700 dark:text-green-400">
                      {processResult.progress.processed}
                    </div>
                    <div className="text-xs text-green-800 dark:text-green-500">Processed</div>
                  </div>
                  <div className="rounded bg-yellow-100 p-2 dark:bg-yellow-900/30">
                    <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                      {processResult.progress.skipped}
                    </div>
                    <div className="text-xs text-yellow-800 dark:text-yellow-500">Skipped</div>
                  </div>
                  <div className="rounded bg-red-100 p-2 dark:bg-red-900/30">
                    <div className="text-xl font-bold text-red-700 dark:text-red-400">
                      {processResult.progress.failed}
                    </div>
                    <div className="text-xs text-red-800 dark:text-red-500">Failed</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}
    </div>
  );
}
