"use client";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { memo } from "react";

const MultiSelectorFilterNavigation = memo(({ items }: { items: string[] }) => {
  return (
    <div className="mt-2 flex h-max w-full flex-wrap items-center justify-start gap-4 sm:flex-nowrap">
      <AnimatedBackground
        className=" h-full w-full border-[#0084ff] border-b-2"
        defaultValue={items[0]}
        transition={{
          type: "spring",
          bounce: 0.1,
          duration: 0.3,
        }}
      >
        {items.map((item) => (
          <p
            className="cursor-pointer rounded-none bg-transparent p-2 text-primary shadow-none hover:bg-transparent hover:text-primary"
            key={item}
          >
            {item}
          </p>
        ))}
      </AnimatedBackground>
    </div>
  );
});

MultiSelectorFilterNavigation.displayName = "MultiSelectorFilterNavigation";

export default MultiSelectorFilterNavigation;
