/* eslint-disable @next/next/no-img-element */
"use client";
import { Fragment, useState } from "react";
import { Loader2, Edit3, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractQuestionNumber } from "../lib/utils";
import { ImageTheme } from "../constants/types";
import { Button } from "@/components/ui/button";
import { ImageAnnotator } from "./ImageAnnotator";

export const AnnotatableInspectImages = ({
  imageSource,
  currentQuestionId,
  imageTheme,
}: {
  imageSource: string[] | undefined;
  currentQuestionId: string | undefined;
  imageTheme: ImageTheme;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  if (!imageSource || imageSource.length === 0) {
    return <p className="text-center text-red-600">Unable to fetch resource</p>;
  }

  // Filter only image URLs
  const imageUrls = imageSource.filter((item) => item.includes("http"));
  const textItems = imageSource.filter((item) => !item.includes("http"));

  return (
    <div className="flex flex-col w-full relative">
      {/* Edit Mode Toggle */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {isEditMode ? "Edit Mode" : "View Mode"}
          </p>
          {isEditMode && (
            <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
              Draw on images to annotate
            </span>
          )}
        </div>
        <Button
          type="button"
          variant={isEditMode ? "default" : "outline"}
          className="cursor-pointer gap-2"
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? (
            <>
              <Eye className="h-4 w-4" />
              View Mode
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" />
              Edit Mode
            </>
          )}
        </Button>
      </div>

      {/* Loading indicator */}
      {!isEditMode && imageUrls.length > 0 && (
        <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0 top-20" />
      )}

      {/* Image Display */}
      <div className="flex flex-col gap-6 w-full items-center">
        {isEditMode ? (
          // Edit Mode: Show combined annotatable images
          <ImageAnnotator
            imageUrls={imageUrls}
            currentQuestionId={currentQuestionId}
            isEditMode={isEditMode}
          />
        ) : (
          // View Mode: Show regular images
          <>
            {imageSource.map((item) => (
              <Fragment
                key={`${item}${currentQuestionId}${
                  currentQuestionId &&
                  extractQuestionNumber({
                    questionId: currentQuestionId,
                  })
                }`}
              >
                {item.includes("http") ? (
                  <img
                    className={cn(
                      "w-full h-full object-contain relative z-10 !max-w-[750px]",
                      imageTheme === "dark" && "!invert"
                    )}
                    src={item}
                    alt="Question image"
                    loading="lazy"
                  />
                ) : (
                  <p>{item}</p>
                )}
              </Fragment>
            ))}
          </>
        )}

        {/* Text items (if any) */}
        {textItems.map((item, index) => (
          <p key={`text-${index}`}>{item}</p>
        ))}
      </div>

      {/* Export Tip (only in edit mode with multiple images) */}
      {isEditMode && imageUrls.length > 1 && (
        <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">
            💡 Tip: Use the &ldquo;Export Combined&rdquo; button to export all
            images with annotations as a single image, or save your annotations
            to load them later.
          </p>
        </div>
      )}
    </div>
  );
};
