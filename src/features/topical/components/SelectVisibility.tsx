import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { Lock } from "lucide-react";

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
      <SelectTrigger className="w-full py-6">
        <SelectValue placeholder="Select a visibility" />
      </SelectTrigger>
      <SelectContent className="z-[999999] dark:bg-accent">
        <SelectItem value="public">
          <div className="flex items-center justify-start w-max cursor-pointer flex-row gap-3">
            <Globe className="w-4 h-4" />
            <div className="flex flex-col justify-center items-start">
              <p className="text-sm">Public</p>
              <p className="text-xs text-muted-foreground">
                Anyone can see this list
              </p>
            </div>
          </div>
        </SelectItem>
        <SelectItem value="private">
          <div className="flex items-center justify-start w-max cursor-pointer flex-row gap-3 ">
            <Lock className="w-4 h-4" />
            <div className="flex flex-col justify-center items-start">
              <p className="text-sm">Private</p>
              <p className="text-xs text-muted-foreground">
                Only you can see this list
              </p>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
