"use client";
import { Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ShinyText from "@/components/ShinyText";
import { Button } from "@/components/ui/button";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import { GlowEffect } from "../ui/glow-effect";
import SearchPastPaper from "./SearchPastPaper";
import { ModeToggle } from "./ThemeToggle";
import User from "./User";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 right-0 left-0 z-100000 flex min-w-screen items-center justify-between border-(--navbar-border) border-b bg-(--navbar-bg) px-1 py-[7px] sm:px-10 lg:px-20">
      <nav className="flex w-full items-center justify-center gap-3 sm:justify-between sm:gap-8">
        {pathname !== "/" ? (
          <>
            <Link className="hidden lg:block" href="/">
              <Image
                alt="logo"
                height={28}
                src="/assets/logo-full-colorised-white.webp"
                width={245}
              />
            </Link>
            <Link className="block lg:hidden" href="/">
              <Image
                alt="logo"
                height={40}
                src="/assets/logo-bg-colorised-modified-small.webp"
                width={40}
              />
            </Link>
          </>
        ) : (
          <>
            <a className="hidden lg:block" href="#" title="Home">
              <Image
                alt="logo"
                height={28}
                src="/assets/logo-full-colorised-white.webp"
                width={245}
              />
            </a>
            <a className="block lg:hidden" href="#" title="Home">
              <Image
                alt="logo"
                height={40}
                src="/assets/logo-bg-colorised-modified-small.webp"
                width={40}
              />
            </a>
          </>
        )}
        <SearchPastPaper />

        <div className="header-content-group flex items-center gap-2">
          {/* <Button className="flex items-center gap-2" asChild>
            <Link
              className="text-sm font-medium text-[var(--navbar-text)] opacity-80 transition hover:opacity-100 border border-[var(--navbar-border)] bg-[var(--navbar-bg)]"
              href="/resources"
            >
              Resources
            </Link>
          </Button> */}
          <Button
            asChild
            className="group relative rounded-lg border border-(--navbar-border) bg-(--navbar-bg) text-(--navbar-text) hover:bg-(--navbar-bg) "
          >
            <Link className="relative" href={TOPICAL_QUESTION_APP_ROUTE}>
              <GlowEffect
                blur="soft"
                className="z-[-1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                duration={3}
                mode="colorShift"
                scale={1}
              />

              <div className="flex items-center justify-center gap-2">
                <Layers />
                <ShinyText
                  className="hidden sm:inline-block"
                  text="Topical questions"
                />
                <ShinyText className="inline-block sm:hidden" text="Topical" />
              </div>
            </Link>
          </Button>
          <User />
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
