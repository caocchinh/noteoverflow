import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Layers, Search, SquareUserRound } from "lucide-react";
import ShinyText from "../../features/home/components/animation/ShinyText";
import LanguageBar from "./LanguageBar";

const NavBar = () => {
  return (
    <header className="flex justify-between min-w-screen items-center px-1 sm:px-10 lg:px-20 py-3 bg-foreground border-b border-background/10 fixed top-0 left-0 right-0 z-[999999]">
      <nav className="flex items-center justify-center sm:justify-between gap-3 sm:gap-8 w-full">
        <a href="#" className="hidden lg:block">
          <Image
            src="/assets/logo-full-colorised-white.png"
            alt="logo"
            width={245}
            height={28}
          />
        </a>
        <a href="#" className="lg:hidden block">
          <Image
            src="/assets/logo-bg-colorised-modified-small.png"
            alt="logo"
            width={40}
            height={40}
          />
        </a>

        <div className="hidden sm:flex items-center w-full max-w-md h-10">
          <Input
            placeholder="Enter paper code"
            className="w-full rounded-xl bg-foreground max-w-md border-background/20 rounded-r-none h-full text-background"
          />
          <Button className="rounded-xl rounded-l-none hover:cursor-pointer h-full lg:w-14 w-10 border-background/20 border-1 bg-foreground-secondary">
            <Search />
          </Button>
        </div>
        <div className="flex items-center header-content-group gap-4">
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
              <ShinyText
                text="Topical questions"
                className="hidden sm:inline-block"
              />
              <ShinyText text="Topical" className="inline-block sm:hidden" />
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
          <LanguageBar />
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
