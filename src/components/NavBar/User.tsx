"use client";

import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ImageIcon,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  RefreshCcw,
  ShieldUser,
  SquareUserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import GlareHover from "../GlazeHover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import AvatarChange from "./AvatarChange";

const User = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile({ breakpoint: 515 });
  const { user, isSessionPending, isSessionError, isAuthenticated } = useAuth();
  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.setQueryData(["all_user_bookmarks"], null);
      queryClient.setQueryData(["user_recent_query"], null);
      queryClient.setQueryData(["user_finished_questions"], null);
      setIsMenuOpen(false);
      router.push("/authentication");
    },
    onError: () => {
      toast.error("Error signing out, please try again.");
    },
  });

  const handleSignOut = useCallback(() => {
    signOutMutation.mutate();
  }, [signOutMutation]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.banned) {
        handleSignOut();
      }
    }
  }, [user, handleSignOut, isAuthenticated]);

  if (isSessionError) {
    return (
      <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="cursor-pointer rounded-lg bg-red-600 text-white hover:bg-red-600 hover:opacity-90"
            title="Error fetching data, please refresh"
          >
            <AlertTriangle />
            Error!
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-background text-foreground relative z-100001 flex flex-col px-0">
          <DropdownMenuItem asChild>
            <Button
              className="hover:bg-muted w-full cursor-pointer px-4 py-2"
              onClick={() => {
                setIsMenuOpen(false);
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
              variant="ghost"
            >
              Refresh
              <RefreshCcw />
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isSessionPending) {
    return <Skeleton className="bg-navbar-skelenton! h-8 w-8 rounded-full" />;
  }
  if (!isAuthenticated || !user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <Button
            asChild
            className="rounded-lg bg-(--navbar-text) text-(--navbar-bg) hover:bg-(--navbar-text) hover:text-(--navbar-bg) hover:opacity-90"
            title="Sign in to access all features"
          >
            <Link href="/authentication">
              <SquareUserRound />
              Sign in
            </Link>
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }
  return (
    <>
      <AvatarChange
        currentAvatar={user.selectedImage || "/assets/avatar/blue.webp"}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        defaultAvatar={user.image}
      />

      <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
        <DropdownMenuTrigger>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={user.selectedImage}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              <Avatar>
                <GlareHover
                  className="h-max w-max rounded-full"
                  glareAngle={-30}
                  glareColor="#ffffff"
                  glareOpacity={0.3}
                  glareSize={300}
                  playOnce={false}
                  title="Account Settings"
                  transitionDuration={800}
                >
                  <AvatarImage
                    className="h-[32px] w-[32px]"
                    src={user.selectedImage || "/assets/avatar/blue.webp"}
                  />
                  <AvatarFallback className="h-[32px] w-[32px]">
                    {user.name.split(" ")[0]?.charAt(0) + user.name.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </GlareHover>
              </Avatar>
            </motion.div>
          </AnimatePresence>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="bg-background text-foreground relative z-100001 flex w-[200px] flex-col border-white/50 px-1"
        >
          <DropdownMenuSub defaultOpen={false} onOpenChange={setIsSubMenuOpen} open={isSubMenuOpen}>
            <Button
              className="flex h-full w-full cursor-pointer items-center justify-start p-0!"
              onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
              variant="ghost"
            >
              <DropdownMenuSubTrigger
                className="pointer-events-none flex w-full items-center justify-start gap-2 px-4 py-2"
                title="Preferences"
              >
                <Avatar>
                  <AvatarImage
                    className="h-[32px] w-[32px]"
                    src={user.selectedImage || "/assets/avatar/blue.webp"}
                  />
                  <AvatarFallback className="h-[32px] w-[32px]">
                    {user.name.split(" ")[0]?.charAt(0) + user.name.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="w-max max-w-[120px] text-sm font-medium whitespace-pre-line">
                  {user.name}
                </p>
              </DropdownMenuSubTrigger>
            </Button>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                alignOffset={isMobile ? 50 : undefined}
                className="z-100002 border-white/60"
                sideOffset={isMobile ? -95 : undefined}
              >
                <DropdownMenuItem asChild title="Change avatar">
                  <Button
                    className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 px-4 py-2"
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                    variant="ghost"
                  >
                    Change avatar
                    <ImageIcon />
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {(user.role === "admin" || user.role === "owner") && (
            <>
              <DropdownMenuSeparator className="mx-0! my-0!" />
              <DropdownMenuItem asChild title="Admin Panel">
                <Button
                  asChild
                  className="hover:bg-muted w-full cursor-pointer px-4 py-2"
                  variant="ghost"
                >
                  <Link className="flex w-full items-center justify-start gap-2" href="/admin">
                    <ShieldUser />
                    Admin Panel
                  </Link>
                </Button>
              </DropdownMenuItem>{" "}
            </>
          )}

          <DropdownMenuSeparator className="mx-0! my-0!" />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="hover:bg-muted data-[variant=destructive]:*:[svg]:text-destructive! focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-3 py-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                size="icon"
                variant="ghost"
              >
                <MessageCircle />
                Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Feedback</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Send me your feedback, suggestions or critiques thorugh my email.
              </DialogDescription>
              <Button
                className="text-background! hover:bg-foreground-secondary bg-foreground w-max cursor-pointer rounded-md px-2 py-1 text-sm dark:hover:bg-white"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText("founder@noteoverflow.com");
                  toast.success("Email copied to clipboard");
                }}
              >
                <Mail />
                founder@noteoverflow.com
              </Button>
            </DialogContent>
          </Dialog>

          <DropdownMenuSeparator className="mx-0! my-0!" />

          <DropdownMenuItem
            asChild
            onSelect={(e) => {
              e.preventDefault();
              setIsMenuOpen(true);
            }}
            title="Sign out"
          >
            <Button
              className="hover:bg-muted flex w-full cursor-pointer items-center justify-start px-4 py-2"
              onClick={handleSignOut}
              size="icon"
              variant="ghost"
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
