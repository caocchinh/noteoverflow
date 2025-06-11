"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Layers, Search, SquareUserRound } from "lucide-react";
import ShinyText from "@/components/ShinyText";
import { ModeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="flex justify-between min-w-screen items-center px-1 sm:px-10 lg:px-20 py-3 fixed top-0 left-0 right-0 z-[999999] bg-[var(--navbar-bg)] border-b border-[var(--navbar-border)]">
      <nav className="flex items-center justify-center sm:justify-between gap-3 sm:gap-8 w-full">
        {pathname !== "/" ? (
          <>
            <Link href="/" className="hidden lg:block">
              <Image
                src="/assets/logo-full-colorised-white.png"
                alt="logo"
                width={245}
                height={28}
              />
            </Link>
            <Link href="/" className="lg:hidden block">
              <Image
                src="/assets/logo-bg-colorised-modified-small.png"
                alt="logo"
                width={40}
                height={40}
              />
            </Link>
          </>
        ) : (
          <>
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
          </>
        )}

        <div className="hidden sm:flex items-center w-full max-w-md h-10">
          <Input
            placeholder="Enter paper code"
            className="w-full rounded-xl placeholder:text-white/50 max-w-md rounded-r-none h-full bg-[var(--navbar-bg)] border border-[var(--navbar-input-border)] text-[var(--navbar-text)]"
          />
          <Button className="rounded-xl rounded-l-none hover:cursor-pointer h-full lg:w-14 w-10 bg-[var(--navbar-button-bg)] border border-[var(--navbar-input-border)] hover:bg-[var(--navbar-border)]">
            <Search className="text-[var(--navbar-text)]" />
          </Button>
        </div>
        <div className="flex items-center header-content-group gap-4">
          <Button className="sm:hidden bg-transparent hover:cursor-pointer w-9 p-2 h-full flex items-center justify-center border border-[var(--navbar-border)] text-[var(--navbar-text)] hover:bg-[var(--navbar-border)]">
            <Search />
          </Button>
          <Button
            className="bg-transparent  dark:hover:bg-white/5 rounded-lg border border-[var(--navbar-border)] text-[var(--navbar-text)]"
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
            className="rounded-lg hover:opacity-90 bg-[var(--navbar-text)] text-[var(--navbar-bg)] hover:bg-[var(--navbar-text)] hover:text-[var(--navbar-bg)]"
            asChild
            title="Sign in to access all features"
          >
            <Link href="/authentication">
              <SquareUserRound />
              Sign in
            </Link>
          </Button>
          {pathname !== "/" && <ModeToggle />}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
