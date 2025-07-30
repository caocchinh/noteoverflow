import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const SearchPastPaper = () => {
  // const [input, setInput] = useState("");
  const breakpoint = useIsMobile({ breakpoint: 735 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <div
        className="hidden h-10 w-full max-w-md items-center sm:flex"
        onClick={() => setIsDialogOpen(true)}
      >
        <Input
          className="h-full w-full max-w-md rounded-xl rounded-r-none border border-[var(--navbar-input-border)] bg-[var(--navbar-bg)] text-[var(--navbar-text)] placeholder:text-white/50 dark:bg-[var(--navbar-bg)]"
          placeholder={breakpoint ? "Search" : "Search past papers"}
          // value={input}
          readOnly={true}
        />
        <Button className="h-full w-10 rounded-xl rounded-l-none border border-[var(--navbar-input-border)] bg-[var(--navbar-button-bg)] hover:cursor-pointer hover:bg-[var(--navbar-border)] lg:w-14">
          <SearchIcon className="text-[var(--navbar-text)]" />
        </Button>
      </div>
      <Button
        className="flex h-full w-9 items-center justify-center border border-[var(--navbar-border)] bg-transparent p-2 text-[var(--navbar-text)] hover:cursor-pointer hover:bg-[var(--navbar-border)] sm:hidden"
        onClick={() => setIsDialogOpen(true)}
      >
        <SearchIcon />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AS & A-Level Past Papers Search</DialogTitle>
            <DialogDescription className="sr-only">
              Search for past papers by subject, topic, year, and more.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchPastPaper;
