"use client";
import { Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ShinyText from "@/components/ShinyText";
import { Button } from "@/components/ui/button";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import { GlowEffect } from "../ui/glow-effect";
import Search from "./Search";
import { ModeToggle } from "./ThemeToggle";
import User from "./User";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 right-0 left-0 z-[100000] flex min-w-screen items-center justify-between border-[var(--navbar-border)] border-b bg-[var(--navbar-bg)] px-1 py-[7px] sm:px-10 lg:px-20">
      <nav className="flex w-full items-center justify-center gap-3 sm:justify-between sm:gap-8">
        {pathname !== "/" ? (
          <>
            <Link className="hidden sm:block" href="/">
              <Image
                alt="logo"
                height={28}
                src="/assets/logo-full-colorised-white.webp"
                width={245}
              />
            </Link>
            <Link className="block sm:hidden" href="/">
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
            <a className="hidden sm:block" href="#" title="Home">
              <Image
                alt="logo"
                height={28}
                src="/assets/logo-full-colorised-white.webp"
                width={245}
              />
            </a>
            <a className="block sm:hidden" href="#" title="Home">
              <Image
                alt="logo"
                height={40}
                src="/assets/logo-bg-colorised-modified-small.webp"
                width={40}
              />
            </a>
          </>
        )}

        <Search />
        <div className="header-content-group flex items-center gap-4">
          <Button
            asChild
            className="group relative rounded-lg border border-[var(--navbar-border)] bg-[var(--navbar-bg)] text-[var(--navbar-text)] hover:bg-[var(--navbar-bg)] "
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
