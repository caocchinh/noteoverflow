"use client";

import { Button } from "@/components/ui/button";
import Silk from "@/features/auth/components/animation/Silk";
import { LOGO_MAIN_COLOR } from "@/constants/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const AuthPageClient = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadingMessages = useMemo(
    () => [
      "Destination in sight...",
      "Bribing the login gods...",
      "Untangling the internet cables...",
      "Feeding the hamsters that power our servers...",
      "Waiting for the Wi-Fi to wake up...",
      "Convincing your browser to cooperate...",
      "Googling 'how to login'...",
      "Dusting off your account...",
      "Waking up the login fairy...",
      "Performing ancient login rituals...",
      "Consulting the magic 8-ball...",
      "Summoning your digital self...",
      "Negotiating with the firewall...",
      "Teaching robots to trust you...",
      "Polishing your virtual doorknob...",
      "Searching for your lost password in the couch cushions...",
      "Reversing the polarity...",
      "Spinning up the flux capacitor...",
      "Loading your awesomeness...",
      "Calibrating the cool factor...",
      "Initializing maximum security mode...",
      "Activating VIP treatment...",
    ],
    []
  );

  useEffect(() => {
    if (Object.keys(searchParams).includes("error")) {
      if (searchParams.error === "access_denied") {
        setError("Access denied. Please try again.");
      } else {
        setError("Login failed, please try again");
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchParams]);

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[randomIndex];
  };

  const startAuthTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setError("Authentication timed out. Please try again.");
      setIsNavigating(false);
    }, 30000);
  };

  const handleSignInWithGoogle = async () => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setError("Something went wrong, please try again");
      setIsNavigating(false);
    }
  };

  const handleSignInWithApple = async () => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/app",
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setError("Something went wrong, please try again");
      setIsNavigating(false);
    }
  };

  const handleSignInWithMicrosoft = async () => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: "/app",
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setError("Something went wrong, please try again");
      setIsNavigating(false);
    }
  };

  const handleSignInWithReddit = async () => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      await authClient.signIn.social({
        provider: "reddit",
        callbackURL: "/app",
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setError("Something went wrong, please try again");
      setIsNavigating(false);
    }
  };

  const handleSignInWithDiscord = async () => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/app",
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setError("Something went wrong, please try again");
      setIsNavigating(false);
    }
  };

  return (
    <div className="grid min-h-svh md:grid-cols-2 bg-background">
      <motion.div
        className="w-full flex items-center justify-center flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="w-[85%] items-center justify-center flex flex-col gap-6"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1 },
          }}
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.1 }}
        >
          <div className="flex flex-col w-full">
            <div
              className={cn(
                "after:border-foreground w-full after:w-[50%] after:max-w-[275px] relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:z-0 after:flex after:items-center after:border-t-2 flex justify-center mb-2",
                isNavigating && "after:!border-transparent"
              )}
            >
              <motion.h1
                className="text-3xl bg-background text-foreground relative z-10 px-2 font-semibold text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                {isNavigating ? loadingText : "Sign In"}
              </motion.h1>
            </div>

            {error && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                className="w-full flex items-center justify-center mb-2"
              >
                <div className="text-red-500 font-medium text-center">
                  {error}
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full flex items-center justify-center"
          >
            <Button
              variant="outline"
              className="!w-[200px] !h-[40px] border-1 border-[#747775] text-[#1F1F1F] !font-medium !font-roboto !rounded-[4px] flex items-center justify-center !gap-[10px] !px-[12px] hover:cursor-pointer dark:text-[#E3E3E3] dark:border-[#8E918F]"
              onClick={handleSignInWithGoogle}
              disabled={isNavigating}
            >
              <Image
                src="/assets/google.svg"
                alt="Google Logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full flex items-center justify-center"
          >
            <Button
              variant="outline"
              className="!w-[200px] !h-[41px] border-1 border-black !font-semibold !font !rounded-[4px] flex items-center justify-center !gap-[3px] !px-[12px] hover:cursor-pointer bg-white dark:bg-black dark:border-white dark:text-white text-black"
              onClick={handleSignInWithApple}
              disabled={isNavigating}
            >
              <Image
                src="/assets/apple-white.svg"
                alt="Apple Logo"
                width={20}
                height={20}
                className="dark:hidden"
              />
              <Image
                src="/assets/apple-black.svg"
                alt="Apple Logo"
                width={20}
                height={20}
                className="hidden dark:block"
              />
              Sign in with Apple
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full flex items-center justify-center"
          >
            <Button
              variant="outline"
              className="!w-[200px] !h-[41px] border-1 border-[#8C8C8C] text-[#5E5E5E] !font-medium !font !rounded-[4px] flex items-center justify-center !gap-[10px] !px-[12px] hover:cursor-pointer bg-white dark:bg-[#2F2F2F] dark:border-[#8E918F] dark:text-white"
              onClick={handleSignInWithMicrosoft}
              disabled={isNavigating}
            >
              <Image
                src="/assets/microsoft.svg"
                alt="Microsoft Logo"
                width={20}
                height={20}
              />
              Sign in with Microsoft
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full flex items-center justify-center"
          >
            <Button
              variant="outline"
              className="!w-[200px] !h-[40px] border-1 border-[#747775] !text-white !font-medium !font-roboto !rounded-[4px] flex items-center justify-center !gap-[10px] !px-[12px] hover:cursor-pointer !bg-[#ff4500]  dark:border-[#8E918F]"
              onClick={handleSignInWithReddit}
              disabled={isNavigating}
            >
              <Image
                src="/assets/reddit.svg"
                alt="Reddit Logo"
                width={20}
                height={20}
              />
              Sign in with Reddit
            </Button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            className="w-full flex items-center justify-center"
          >
            <Button
              variant="outline"
              className="!w-[200px] !h-[40px] border-1 border-[#747775] !text-white !font-medium !font-roboto !rounded-[4px] flex items-center justify-center !gap-[10px] !px-[12px] hover:cursor-pointer !bg-[#5865F2]  dark:border-[#8E918F]"
              onClick={handleSignInWithDiscord}
              disabled={isNavigating}
            >
              <Image
                src="/assets/discord.svg"
                alt="Discord Logo"
                width={20}
                height={20}
              />
              Sign in with Discord
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        className="hidden md:block w-full h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Silk
          speed={5}
          scale={1}
          color={LOGO_MAIN_COLOR}
          noiseIntensity={1.5}
          rotation={0}
        />
      </motion.div>
    </div>
  );
};

export default AuthPageClient;
