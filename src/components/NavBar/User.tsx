"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ImageIcon,
  Loader2,
  LogOut,
  RefreshCcw,
  ShieldUser,
  SquareUserRound,
  MessageCircle,
  Mail,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth/auth-client";
import GlareHover from "../GlazeHover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const User = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile({ breakpoint: 515 });

  const { data, isPending, isError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await authClient.getSession();
    },
    retry: 3,
    retryDelay: 1000,
  });

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

  function handleSignOut() {
    signOutMutation.mutate();
  }

  if (isError) {
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

        <DropdownMenuContent className="relative z-[100001] flex flex-col bg-background px-0 text-foreground">
          <DropdownMenuItem asChild>
            <Button
              className="w-full cursor-pointer px-4 py-2 hover:bg-muted"
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

  if (isPending) {
    return <Skeleton className="!bg-navbar-skelenton h-8 w-8 rounded-full" />;
  }
  if (!data?.data) {
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
            className="rounded-lg bg-[var(--navbar-text)] text-[var(--navbar-bg)] hover:bg-[var(--navbar-text)] hover:text-[var(--navbar-bg)] hover:opacity-90"
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
        currentAvatar={
          data.data.user.selectedImage || "/assets/avatar/blue.webp"
        }
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        userId={data.data.user.id}
        defaultAvatar={data.data.user.image}
      />

      <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
        <DropdownMenuTrigger>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={data.data.user.selectedImage}
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
                    src={
                      data.data.user.selectedImage || "/assets/avatar/blue.webp"
                    }
                  />
                  <AvatarFallback className="h-[32px] w-[32px]">
                    {data.data.user.name.split(" ")[0]?.charAt(0) +
                      data.data.user.name.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </GlareHover>
              </Avatar>
            </motion.div>
          </AnimatePresence>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="relative z-[100001] flex w-[200px] flex-col border-white/50 bg-background px-1 text-foreground"
        >
          <DropdownMenuSub
            defaultOpen={false}
            onOpenChange={setIsSubMenuOpen}
            open={isSubMenuOpen}
          >
            <Button
              className="!p-0 flex h-full w-full cursor-pointer items-center justify-start"
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
                    src={
                      data.data?.user.selectedImage ||
                      "/assets/avatar/blue.webp"
                    }
                  />
                  <AvatarFallback className="h-[32px] w-[32px]">
                    {data.data.user.name.split(" ")[0]?.charAt(0) +
                      data.data.user.name.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="w-max max-w-[120px] whitespace-pre-line font-medium text-sm">
                  {data.data.user.name}
                </p>
              </DropdownMenuSubTrigger>
            </Button>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                alignOffset={isMobile ? 50 : undefined}
                className="z-[100002] border-white/60"
                sideOffset={isMobile ? -95 : undefined}
              >
                <DropdownMenuItem asChild title="Change avatar">
                  <Button
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 hover:bg-muted"
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

          {(data.data.user.role === "admin" ||
            data.data.user.role === "owner") && (
            <>
              <DropdownMenuSeparator className="!mx-0 !my-0" />
              <DropdownMenuItem asChild title="Admin Panel">
                <Button
                  asChild
                  className="w-full cursor-pointer px-4 py-2 hover:bg-muted"
                  variant="ghost"
                >
                  <Link
                    className="flex w-full items-center justify-start gap-2"
                    href="/admin"
                  >
                    <ShieldUser />
                    Admin Panel
                  </Link>
                </Button>
              </DropdownMenuItem>{" "}
            </>
          )}

          <DropdownMenuSeparator className="!mx-0 !my-0" />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="flex w-full cursor-pointer items-center justify-start px-3 py-2 hover:bg-muted data-[variant=destructive]:*:[svg]:!text-destructive relative  select-none  gap-2 rounded-sm text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0"
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
                Send me your feedback, suggestions or critiques thorugh my
                email.
              </DialogDescription>
              <Button
                className="text-sm !text-background dark:hover:bg-white hover:bg-foreground-secondary bg-foreground w-max cursor-pointer rounded-md px-2 py-1"
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

          <DropdownMenuSeparator className="!mx-0 !my-0" />

          <DropdownMenuItem
            asChild
            onSelect={(e) => {
              e.preventDefault();
              setIsMenuOpen(true);
            }}
            title="Sign out"
          >
            <Button
              className="flex w-full cursor-pointer items-center justify-start px-4 py-2 hover:bg-muted"
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
