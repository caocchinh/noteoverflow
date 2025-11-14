"use client";

import {
  Indicator as CheckboxPrimitiveIndicator,
  Root as CheckboxPrimitiveRoot,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitiveRoot>) {
  return (
    <CheckboxPrimitiveRoot
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitiveIndicator
        className="!text-white flex items-center justify-center transition-none"
        data-slot="checkbox-indicator"
      >
        <CheckIcon className="size-3.5 text-white" />
      </CheckboxPrimitiveIndicator>
    </CheckboxPrimitiveRoot>
  );
}

export { Checkbox };
