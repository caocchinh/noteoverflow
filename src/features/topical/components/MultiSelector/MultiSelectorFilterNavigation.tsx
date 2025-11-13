"use client";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Dispatch, memo, SetStateAction } from "react";

const MultiSelectorFilterNavigation = memo(
  ({
    items,
    setItems,
  }: {
    items: string[];
    setItems: Dispatch<SetStateAction<string>>;
  }) => {
    return (
      <div className="-my-2 flex h-max w-full flex-wrap items-center justify-center gap-4 sm:flex-nowrap">
        <AnimatedBackground
          className=" h-full w-full border-[#0084ff] border-b-2"
          defaultValue={items[0]}
          onValueChange={(value) => {
            setItems(value ?? items[0]);
          }}
          transition={{
            type: "spring",
            bounce: 0.1,
            duration: 0.3,
          }}
        >
          {items.map((item) => (
            <p
              className="cursor-pointer flex-1 text-center flex items-center justify-center rounded-none bg-transparent p-2 text-primary shadow-none hover:bg-transparent hover:text-primary"
              key={item}
              data-id={item}
            >
              {item}
            </p>
          ))}
        </AnimatedBackground>
      </div>
    );
  }
);

MultiSelectorFilterNavigation.displayName = "MultiSelectorFilterNavigation";

export default MultiSelectorFilterNavigation;
