import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Layers, Search, SquareUserRound } from "lucide-react";

const NavBar = () => {
  return (
    <header className="flex justify-between min-w-screen items-center px-1 sm:px-10 lg:px-20 py-3 bg-transparent backdrop-blur-sm border-b border-background/10 fixed top-0 left-0 right-0 z-50">
      <nav className="flex items-center justify-evenly sm:justify-between gap-2 sm:gap-8 w-full">
        <Image
          className="hidden lg:block"
          src="/assets/logo-full-colorised-white.png"
          alt="logo"
          width={245}
          height={28}
        />
        <Image
          className="block lg:hidden"
          src="/assets/logo-bg-colorised-modified-small.png"
          alt="logo"
          width={40}
          height={40}
        />
        <div className="hidden sm:flex items-center w-full max-w-md h-10">
          <Input
            placeholder="Search"
            className="w-full rounded-xl max-w-md border-background/20 rounded-r-none h-full text-background"
          />
          <Button className="rounded-xl rounded-l-none hover:cursor-pointer h-full lg:w-14 w-10 border-background/20 border-1 bg-foreground-secondary">
            <Search />
          </Button>
        </div>
        <div className="flex items-center sm:gap-4 gap-2">
          <Button className=" sm:hidden bg-transparent text-background hover:cursor-pointer border-1 border-background/20 w-9 p-2 h-full flex items-center justify-center">
            <Search />
          </Button>
          <Button
            className="bg-transparent rounded-lg border-1 border-background/20"
            asChild
            title="Access topical questions"
          >
            <Link href="/app">
              <Layers />
              Topical questions
            </Link>
          </Button>
          <Button
            className="bg-background text-foreground hover:bg-background/80 hover:text-foreground"
            asChild
            title="Login to access all features"
          >
            <Link href="/login">
              <SquareUserRound />
              Login
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
