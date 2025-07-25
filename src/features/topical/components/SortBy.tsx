import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";

export const SortBy = ({
  sortBy,
  setSortBy,
  disabled = false,
}: {
  sortBy: "ascending" | "descending";
  setSortBy: Dispatch<SetStateAction<"ascending" | "descending">>;
  disabled?: boolean;
}) => {
  return (
    <Select
      value={sortBy}
      onValueChange={(value) => {
        setSortBy(value as "ascending" | "descending");
      }}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="z-[1000010] dark:bg-accent">
        <SelectItem value="descending">Newest first</SelectItem>
        <SelectItem value="ascending">Oldest first</SelectItem>
      </SelectContent>
    </Select>
  );
};
