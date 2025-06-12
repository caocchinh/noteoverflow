"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  SquareUserRound,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import GlareHover from "../GlazeHover";

const User = () => {
  const [trigger, setTrigger] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data, isPending, error } = useQuery({
    queryKey: ["user", trigger],
    queryFn: async () => {
      console.log("fetching user");
      return await authClient.getSession();
    },
  });

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      setTrigger((prev) => !prev);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningOut(false);
    }
  }

  if (error) {
    return (
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-lg hover:opacity-90 bg-red-600 hover:bg-red-600 text-white cursor-pointer"
            title="Error fetching data, please refresh"
          >
            <AlertTriangle />
            Error!
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="relative z-[101] px-0 flex flex-col text-foreground bg-background">
          <Button
            variant="ghost"
            className="w-full px-4 py-2 hover:bg-muted cursor-pointer"
            onClick={() => {
              setIsMenuOpen(false);
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          >
            Refresh
            <RefreshCcw />
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full !bg-navbar-skelenton" />;
  }
  if (!data?.data) {
    return (
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
    );
  }
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <GlareHover
          glareColor="#ffffff"
          glareOpacity={0.3}
          glareAngle={-30}
          glareSize={300}
          transitionDuration={800}
          playOnce={false}
          className="w-max h-max rounded-full"
          title="Account Settings"
        >
          <Image
            src={data.data?.user.image || "/assets/avatar/blue.png"}
            alt="user avatar"
            className="object-cover"
            width={32}
            height={32}
          />
        </GlareHover>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="relative z-[101] px-0 flex flex-col text-foreground bg-background">
        <div className="flex items-center gap-2 justify-start w-full px-4 py-2 hover:bg-muted">
          <Image
            src={data.data?.user.image || "/assets/avatar/blue.png"}
            alt="user avatar"
            className="object-cover rounded-full overflow-hidden"
            width={32}
            height={32}
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium">{data.data?.user.name}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="!mx-0 !my-0" />
        <Button
          variant="ghost"
          className="w-full px-4 py-2 hover:bg-muted cursor-pointer"
          asChild
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 w-full justify-start"
            onClick={() => setIsMenuOpen(false)}
          >
            <LayoutDashboard />
            Dashboard
          </Link>
        </Button>
        <DropdownMenuSeparator className="!mx-0 !my-0" />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="w-full flex justify-start items-center  px-4 py-2 hover:bg-muted cursor-pointer"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut />
              Sign out
            </>
          )}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default User;
