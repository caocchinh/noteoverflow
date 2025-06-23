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
  ShieldUser,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const User = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
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
      router.push("/authentication");
    },
    onError: () => {
      toast.error("Error signing out, please try again.");
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
  if (!data || !data.data) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
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
        </motion.div>
      </AnimatePresence>
    );
  }
  return (
    <>
      <AvatarChange
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentAvatar={data.data.user.image || "/assets/avatar/blue.webp"}
        userId={data.data.user.id}
      />

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <AnimatePresence mode="wait">
            <motion.div
              key={data.data.user.image}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              <Avatar>
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
                  <AvatarImage
                    src={data.data.user.image || "/assets/avatar/blue.webp"}
                    className="w-[32px] h-[32px]"
                  />
                  <AvatarFallback className="w-[32px] h-[32px]">
                    {data.data.user.name.split(" ")[0].charAt(0) +
                      data.data.user.name.split(" ")[1].charAt(0)}
                  </AvatarFallback>
                </GlareHover>
              </Avatar>
            </motion.div>
          </AnimatePresence>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="relative z-[100001] w-[200px] px-1 flex flex-col text-foreground bg-background border-white/50"
          align="end"
        >
          <DropdownMenuSub
            open={isSubMenuOpen}
            onOpenChange={setIsSubMenuOpen}
            defaultOpen={false}
          >
            <Button
              variant="ghost"
              className="flex items-center !p-0 justify-start w-full h-full  cursor-pointer"
              onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            >
              <DropdownMenuSubTrigger
                title="Preferences"
                className="w-full flex px-4 py-2  items-center gap-2 justify-start pointer-events-none"
              >
                <Avatar>
                  <AvatarImage
                    src={data.data?.user.image || "/assets/avatar/blue.webp"}
                    className="w-[32px] h-[32px]"
                  />
                  <AvatarFallback className="w-[32px] h-[32px]">
                    {data.data.user.name.split(" ")[0].charAt(0) +
                      data.data.user.name.split(" ")[1].charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium whitespace-pre-line w-max max-w-[120px]">
                  {data.data.user.name}
                </p>
              </DropdownMenuSubTrigger>
            </Button>
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

          {(data.data.user.role === "admin" ||
            data.data.user.role === "owner") && (
            <>
              <DropdownMenuSeparator className="!mx-0 !my-0" />
              <DropdownMenuItem asChild title="Admin Panel">
                <Button
                  variant="ghost"
                  className="w-full px-4 py-2 hover:bg-muted cursor-pointer"
                  asChild
                >
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 w-full justify-start"
                  >
                    <ShieldUser />
                    Admin Panel
                  </Link>
                </Button>
              </DropdownMenuItem>{" "}
            </>
          )}

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
