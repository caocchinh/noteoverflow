"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Layers } from "lucide-react";
import ShinyText from "@/components/ShinyText";
import { ModeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import User from "./User";
import Search from "./Search";
import { GlowEffect } from "../ui/glow-effect";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="flex justify-between min-w-screen items-center px-1 sm:px-10 lg:px-20 py-3 fixed top-0 left-0 right-0 z-[100000] bg-[var(--navbar-bg)] border-b border-[var(--navbar-border)]">
      <nav className="flex items-center justify-center sm:justify-between gap-3 sm:gap-8 w-full">
        {pathname !== "/" ? (
          <>
            <Link href="/" className="block">
              <Image
                src="/assets/logo-bg-colorised-modified-small.webp"
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
                src="/assets/logo-full-colorised-white.webp"
                alt="logo"
                width={245}
                height={28}
              />
            </a>
            <a href="#" className="lg:hidden block">
              <Image
                src="/assets/logo-bg-colorised-modified-small.webp"
                alt="logo"
                width={40}
                height={40}
              />
            </a>
          </>
        )}

        <Search />
        <div className="flex items-center header-content-group gap-4">
          <Button
            className="bg-[var(--navbar-bg)] hover:bg-[var(--navbar-bg)] rounded-lg border border-[var(--navbar-border)] group text-[var(--navbar-text)] relative "
            asChild
          >
            <Link className="relative" href="/topical">
              <GlowEffect
                colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
                mode="colorShift"
                blur="soft"
                className="z-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                duration={3}
                scale={1}
              />

              <div className="flex items-center gap-2 justify-center">
                <Layers />
                <ShinyText
                  text="Topical questions"
                  className="hidden sm:inline-block"
                />
                <ShinyText text="Topical" className="inline-block sm:hidden" />
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
