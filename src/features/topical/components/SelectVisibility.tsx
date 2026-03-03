import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Lock } from "lucide-react";

export const SelectVisibility = ({
  isMutatingThisQuestion,
  visibility,
  setVisibility,
}: {
  isMutatingThisQuestion: boolean;
  visibility: "public" | "private";
  setVisibility: (value: "public" | "private") => void;
}) => {
  return (
    <Select
      disabled={isMutatingThisQuestion}
      defaultValue="private"
      onValueChange={(value) => setVisibility(value as "public" | "private")}
      value={visibility}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a visibility" />
      </SelectTrigger>
      <SelectContent className="dark:bg-accent z-999999 w-(--radix-select-trigger-width)">
        <SelectItem value="public" className="w-full">
          <div className="flex w-max cursor-pointer flex-row items-center justify-start gap-3">
            <Globe className="h-4 w-4" />
            <div className="flex flex-col items-start justify-center">
              <p className="text-sm">Public</p>
              <p className="text-muted-foreground text-xs">Anyone can see this list</p>
            </div>
          </div>
        </SelectItem>
        <SelectItem value="private" className="w-full">
          <div className="flex w-max cursor-pointer flex-row items-center justify-start gap-3">
            <Lock className="h-4 w-4" />
            <div className="flex flex-col items-start justify-center">
              <p className="text-sm">Private</p>
              <p className="text-muted-foreground text-xs">Only you can see this list</p>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
