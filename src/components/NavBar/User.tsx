"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  SquareUserRound,
  AlertTriangle,
  RefreshCcw,
  ImageIcon,
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import GlareHover from "../GlazeHover";
import styles from "./Navbar.module.css";
import AvatarChange from "./AvatarChange";

const User = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await authClient.getSession();
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      setIsMenuOpen(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  function handleSignOut() {
    signOutMutation.mutate();
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

        <DropdownMenuContent className="relative z-[100001] px-0 flex flex-col text-foreground bg-background">
          <DropdownMenuItem asChild>
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
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full !bg-navbar-skelenton" />;
  }
  if (!data.data) {
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
    <>
      <AvatarChange
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentAvatar={data.data.user.image || "/assets/avatar/blue.png"}
        userId={data.data.user.id}
      />
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

        <DropdownMenuContent
          className="relative z-[100001] w-[200px] px-1 flex flex-col text-foreground bg-background border-white/50"
          align="end"
        >
          <DropdownMenuSub open={isSubMenuOpen} onOpenChange={setIsSubMenuOpen}>
            <DropdownMenuSubTrigger asChild disabled={true} title="Preferences">
              <Button
                variant="ghost"
                className="flex items-center gap-2 justify-start w-full px-4 p-2 h-full hover:bg-muted cursor-pointer"
                onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
              >
                <Image
                  src={data.data?.user.image || "/assets/avatar/blue.png"}
                  alt="user avatar"
                  className="object-cover rounded-full overflow-hidden"
                  width={32}
                  height={32}
                />
                <p className="text-sm font-medium whitespace-pre-line w-max max-w-[120px]">
                  {data.data.user.name}
                </p>
              </Button>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className={`z-[100002] border-white/60 ${styles.subUserMenuContent}`}
              >
                <DropdownMenuItem asChild title="Change avatar">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                    className="w-full px-4 py-2 hover:bg-muted flex items-center gap-2 cursor-pointer"
                  >
                    Change avatar
                    <ImageIcon />
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="!mx-0 !my-0" />
          <DropdownMenuItem asChild title="Dashboard">
            <Button
              variant="ghost"
              className="w-full px-4 py-2 hover:bg-muted cursor-pointer"
              asChild
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-2 w-full justify-start"
              >
                <LayoutDashboard />
                Dashboard
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="!mx-0 !my-0" />

          <DropdownMenuItem
            asChild
            title="Sign out"
            onSelect={(e) => {
              e.preventDefault();
              setIsMenuOpen(true);
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="w-full flex justify-start items-center  px-4 py-2 hover:bg-muted cursor-pointer"
            >
              {signOutMutation.isPending ? (
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
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default User;
