/* eslint-disable @next/next/no-img-element */
"use client";
import { Fragment, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractQuestionNumber } from "@/features/topical/lib/utils";
import { ImageAnnotator } from "@/features/topical/components/ImageAnnotator";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "@/features/topical/components/AnnotatableInspectImages/react-photo-view.css";

export const AnnotatableInspectImages = ({
  imageSource,
  currentQuestionId,
}: {
  imageSource: string[] | undefined;
  currentQuestionId: string | undefined;
}) => {
  const [isEditMode] = useState(false);
  const { uiPreferences } = useTopicalApp();
  if (!imageSource || imageSource.length === 0) {
    return <p className="text-center text-red-600">Unable to fetch resource</p>;
  }

  // Filter only image URLs
  const imageUrls = imageSource.filter((item) => item.includes("http"));
  const textItems = imageSource.filter((item) => !item.includes("http"));

  return (
    <div className="flex flex-col w-full relative">
      {/* Edit Mode Toggle - Temporarily commented out */}
      {/*
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
      */}

      {/* Loading indicator */}
      {!isEditMode && imageUrls.length > 0 && (
        <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0 top-20" />
      )}

      {/* Image Display */}
      <div className="flex flex-col w-full items-center">
        {isEditMode ? (
          // Edit Mode: Show combined annotatable images
          <ImageAnnotator
            imageUrls={imageUrls}
            currentQuestionId={currentQuestionId}
            isEditMode={isEditMode}
          />
        ) : (
          <PhotoProvider>
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
                  <PhotoView src={item}>
                    <img
                      className={cn(
                        "w-full h-full object-contain relative z-10 !max-w-[750px] cursor-pointer",
                        uiPreferences.imageTheme === "dark" && "!invert"
                      )}
                      src={item}
                      alt="Question image"
                      loading="lazy"
                    />
                  </PhotoView>
                ) : (
                  <p>{item}</p>
                )}
              </Fragment>
            ))}
          </PhotoProvider>
        )}

        {textItems.map((item, index) => (
          <p key={`text-${index}`}>{item}</p>
        ))}
      </div>
    </div>
  );
};
