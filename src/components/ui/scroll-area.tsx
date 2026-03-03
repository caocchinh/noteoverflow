"use client";

import {
  Corner as ScrollAreaPrimitiveCorner,
  Root as ScrollAreaPrimitiveRoot,
  ScrollAreaScrollbar as ScrollAreaPrimitiveScrollAreaScrollbar,
  ScrollAreaThumb as ScrollAreaPrimitiveScrollAreaThumb,
  Viewport as ScrollAreaPrimitiveViewport,
} from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  viewPortClassName,
  viewportRef,
  viewPortOnScrollEnd,
  viewPortOnScroll,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitiveRoot> & {
  viewPortClassName?: string;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  viewPortOnScroll?: () => void;
  viewPortOnScrollEnd?: () => void;
}) {
  return (
    <ScrollAreaPrimitiveRoot
      className={cn("relative", className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitiveViewport
        className={cn(
          "focus-visible:ring-ring/50 flex size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          viewPortClassName,
        )}
        data-slot="scroll-area-viewport"
        onScroll={viewPortOnScroll}
        onScrollEnd={viewPortOnScrollEnd}
        ref={viewportRef}
      >
        {children}
      </ScrollAreaPrimitiveViewport>
      <ScrollBar />
      <ScrollAreaPrimitiveCorner />
    </ScrollAreaPrimitiveRoot>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitiveScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitiveScrollAreaScrollbar
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitiveScrollAreaThumb
        className="bg-border relative flex-1 rounded-full"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitiveScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
