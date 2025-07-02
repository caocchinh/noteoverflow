import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Search = () => {
  const [input, setInput] = useState('');
  return (
    <>
      <div className="hidden h-10 w-full max-w-md items-center sm:flex">
        <Input
          className="h-full w-full max-w-md rounded-xl rounded-r-none border border-[var(--navbar-input-border)] bg-[var(--navbar-bg)] text-[var(--navbar-text)] placeholder:text-white/50 dark:bg-[var(--navbar-bg)]"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search"
          value={input}
        />
        <Button className="h-full w-10 rounded-xl rounded-l-none border border-[var(--navbar-input-border)] bg-[var(--navbar-button-bg)] hover:cursor-pointer hover:bg-[var(--navbar-border)] lg:w-14">
          <SearchIcon className="text-[var(--navbar-text)]" />
        </Button>
      </div>
      <Button className="flex h-full w-9 items-center justify-center border border-[var(--navbar-border)] bg-transparent p-2 text-[var(--navbar-text)] hover:cursor-pointer hover:bg-[var(--navbar-border)] sm:hidden">
        <SearchIcon />
      </Button>
    </>
  );
};

export default Search;
