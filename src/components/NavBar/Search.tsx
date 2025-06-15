import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [input, setInput] = useState("");
  return (
    <>
      <div className="hidden sm:flex items-center w-full max-w-md h-10">
        <Input
          placeholder="Search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-xl placeholder:text-white/50 max-w-md rounded-r-none h-full dark:bg-[var(--navbar-bg)] bg-[var(--navbar-bg)] border border-[var(--navbar-input-border)] text-[var(--navbar-text)]"
        />
        <Button className="rounded-xl rounded-l-none hover:cursor-pointer h-full lg:w-14 w-10 bg-[var(--navbar-button-bg)] border border-[var(--navbar-input-border)] hover:bg-[var(--navbar-border)]">
          <SearchIcon className="text-[var(--navbar-text)]" />
        </Button>
      </div>
      <Button className="sm:hidden bg-transparent hover:cursor-pointer w-9 p-2 h-full flex items-center justify-center border border-[var(--navbar-border)] text-[var(--navbar-text)] hover:bg-[var(--navbar-border)]">
        <SearchIcon />
      </Button>
    </>
  );
};

export default Search;
