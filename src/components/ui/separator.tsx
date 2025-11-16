"use client";

import { Root as SeparatorPrimitiveRoot } from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";
import { memo } from "react";

const Separator = memo(
  ({
    className,
    orientation = "horizontal",
    decorative = true,
    ...props
  }: React.ComponentProps<typeof SeparatorPrimitiveRoot>) => {
    return (
      <SeparatorPrimitiveRoot
        className={cn(
          "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
          className
        )}
        data-slot="separator"
        decorative={decorative}
        orientation={orientation}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };
