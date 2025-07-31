import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SkipForward, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const JumpToTabButton = ({
  tab,
  className,
  prefix,
  totalTabs,
  onTabChangeCallback,
}: {
  tab: number;
  totalTabs: number;
  prefix?: "page" | "tab";
  className?: string;
  onTabChangeCallback: ({ tab }: { tab: number }) => void;
}) => {
  const [jumpToTabInput, setJumpToTabInput] = useState(tab + 1);
  const [isInvalidInput, setIsInvalidInput] = useState(false);

  const handleJumpToTab = () => {
    if (jumpToTabInput > 0 && jumpToTabInput <= totalTabs) {
      setIsInvalidInput(false);

      onTabChangeCallback({
        tab: jumpToTabInput - 1,
      });
    } else {
      setIsInvalidInput(true);
    }
  };
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(open) => {
        setIsPopoverOpen(open);
        setIsInvalidInput(false);
        if (open) {
          setJumpToTabInput(tab + 1);
        }
      }}
    >
      <PopoverTrigger className={className}>
        <p
          className="text-md underline cursor-pointer"
          title={`Click to jump to ${prefix ?? "tab"}`}
        >
          {tab + 1}/{totalTabs}
        </p>
      </PopoverTrigger>
      <PopoverContent
        className="z-[999999] dark:bg-accent w-[200px] flex flex-col gap-2"
        side="top"
        sideOffset={17}
      >
        <X
          className="absolute top-2 right-2 cursor-pointer"
          onClick={() => setIsPopoverOpen(false)}
          size={15}
        />
        <div className="flex flex-col gap-3">
          <p className={cn(isInvalidInput && "text-red-500", "text-sm")}>
            Jump to {prefix ?? "tab"}
          </p>
          <p className="text-xs text-muted-foreground">Max: {totalTabs}</p>
          <div className="text-xs text-muted-foreground">
            Current {prefix ?? "tab"}: {tab + 1}
          </div>
          <Input
            type="number"
            min={1}
            max={totalTabs}
            className={cn(isInvalidInput && "border-red-500 text-red-500")}
            value={Number.isNaN(jumpToTabInput) ? "" : jumpToTabInput}
            onChange={(e) => {
              setJumpToTabInput(
                e.target.value.length > 0 ? parseInt(e.target.value, 10) : NaN
              );
              setIsInvalidInput(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJumpToTab();
              }
            }}
          />
          <Button
            onClick={handleJumpToTab}
            className="cursor-pointer"
            variant={isInvalidInput ? "destructive" : "default"}
          >
            Jump
            <SkipForward />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
