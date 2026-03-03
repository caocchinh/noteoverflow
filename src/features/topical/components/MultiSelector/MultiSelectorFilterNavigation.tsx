"use client";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { CIE_A_LEVEL_SUBDIVISION, OUTDATED } from "@/constants/types";
import { Dispatch, memo, SetStateAction } from "react";

const MultiSelectorFilterNavigation = memo(
  ({
    items,
    setItems,
    currentItem,
  }: {
    items: string[];
    setItems: Dispatch<SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>>;
    currentItem: string;
  }) => {
    return (
      <div className="-my-2 flex h-max w-full flex-wrap items-center justify-center gap-4 sm:flex-nowrap">
        <AnimatedBackground
          className="h-full w-full border-b-2 border-[#0084ff]"
          defaultValue={currentItem}
          onValueChange={(value) => {
            setItems((value as CIE_A_LEVEL_SUBDIVISION | OUTDATED) ?? items[0]);
          }}
          transition={{
            type: "spring",
            bounce: 0.1,
            duration: 0.3,
          }}
        >
          {items
            .toSorted((a, b) => b.localeCompare(a))
            .map((item) => (
              <div
                className="text-primary hover:text-primary flex flex-1 cursor-pointer items-center justify-center rounded-none bg-transparent p-2 text-center shadow-none hover:bg-transparent"
                key={item}
                data-id={item}
              >
                {item}
              </div>
            ))}
        </AnimatedBackground>
      </div>
    );
  },
);

MultiSelectorFilterNavigation.displayName = "MultiSelectorFilterNavigation";

export default MultiSelectorFilterNavigation;
