"use client";

import { cn } from "@/lib/utils";
import {
  Content as TabsPrimitiveContent,
  List as TabsPrimitiveList,
  Root as TabsPrimitiveRoot,
  Trigger as TabsPrimitiveTrigger,
} from "@radix-ui/react-tabs";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitiveRoot>) {
  return (
    <TabsPrimitiveRoot
      className={cn("flex flex-col gap-2", className)}
      data-slot="tabs"
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitiveList>) {
  return (
    <TabsPrimitiveList
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className,
      )}
      data-slot="tabs-list"
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitiveTrigger>) {
  return (
    <TabsPrimitiveTrigger
      className={cn(
        "dark:data-[state=active]:text-foreground'size-'])]:size-4 text-foreground [&_svg:not([class*= focus-visible:border-ring focus-visible:outline-ring focus-visible:ring-ring/50 data-[state=active]:bg-background dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitiveContent>) {
  return (
    <TabsPrimitiveContent
      className={cn("flex-1 outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
