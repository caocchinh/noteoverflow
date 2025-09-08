/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractQuestionNumber } from "../lib/utils";

export const InspectImages = ({
  imageSource,
  currentQuestionId,
  imageTheme,
}: {
  imageSource: string[] | undefined;
  currentQuestionId: string | undefined;
  imageTheme: "dark" | "light";
}) => {
  if (!imageSource || imageSource.length === 0) {
    return <p className="text-center text-red-600">Unable to fetch resource</p>;
  }
  return (
    <div className="flex flex-col flex-wrap w-full relative items-center">
      {imageSource[0]?.includes("http") && (
        <Loader2 className="animate-spin absolute left-1/2 -translate-x-1/2 z-0" />
      )}
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
    </div>
  );
};
