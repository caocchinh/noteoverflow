"use client";

import { Button } from "@/components/ui/button";
import Silk from "@/features/auth/components/animation/Silk";
import { LOADING_MESSAGES, LOGO_MAIN_COLOR } from "@/constants/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TurnstileOptions } from "@/constants/types";

// Cloudflare Turnstile type declarations
declare global {
  interface Window {
    onloadTurnstileCallback: () => void;
  }
}

declare const turnstile: {
  render: (container: string | HTMLElement, options: TurnstileOptions) => void;
};

const AuthPageClient = ({
  searchParams,
  turnstileSiteKey,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  turnstileSiteKey: string;
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isInvisibleVerifying, setIsInvisibleVerifying] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.onloadTurnstileCallback = function () {
        turnstile.render("#cf-turnstile", {
          sitekey: turnstileSiteKey,
          callback: function (token: string) {
            setError(null);
            setTurnstileToken(token);
          },
          "expired-callback": function () {
            setIsInvisibleVerifying(false);
            setError("Widget expired, please try again!");
          },
          "error-callback": function () {
            setIsInvisibleVerifying(false);
            setError("Unable to verify, please try again!");
          },
          "timeout-callback": function () {
            setIsInvisibleVerifying(false);
            setError("Timeout, please try again!");
          },
          "before-interactive-callback": function () {
            setIsInvisibleVerifying(false);
          },
          "unsupported-callback": function () {
            setIsInvisibleVerifying(false);
            setError(
              "Unsupported browser, please try again in a different browser!"
            );
          },
          retry: "never",
        });
      };
    }
  }, [turnstileSiteKey]);

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
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    return LOADING_MESSAGES[randomIndex];
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

  const handleSignIn = async (
    provider: "google" | "apple" | "microsoft" | "reddit" | "discord"
  ) => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      await authClient.signIn.social({
        provider,
        callbackURL: "/app",
        fetchOptions: {
          headers: {
            ...(turnstileToken && { "x-captcha-response": turnstileToken }),
          },
        },
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setError("Something went wrong, please try again");
    } finally {
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
            <motion.div
              className=" w-full text-center flex-row text-sm flex items-center gap-1 justify-center mb-2 flex-wrap"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <h1 className="text-3xl bg-background text-foreground relative z-10 px-2 font-semibold text-center">
                {isNavigating ? loadingText : "Sign In"}
              </h1>
              <Image
                src="/assets/logo-bg-colorised-modified-small.png"
                alt="logo"
                width={35}
                height={35}
                className={cn(isNavigating && "animate-spin")}
              />
            </motion.div>

            {isInvisibleVerifying && (
              <div className="text-center text-sm text-foreground">
                Verifying you are human...
              </div>
            )}

            <div
              id="cf-turnstile"
              className="w-full flex items-center justify-center mt-4"
              data-sitekey={turnstileSiteKey}
              data-callback="handleTurnstileCallback"
            ></div>

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

          {turnstileToken && (
            <motion.div
              className="flex flex-col gap-5"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1 },
              }}
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.1 }}
            >
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
                  onClick={() => handleSignIn("google")}
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
                  className="!w-[200px] !h-[41px] border-1 border-black !font-semibold !font !rounded-[4px] flex items-center justify-center !gap-[3px] !px-[12px] hover:cursor-pointer hover:bg-white bg-white dark:hover:bg-black dark:bg-black dark:border-white dark:text-white text-black"
                  onClick={() => handleSignIn("apple")}
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
                  onClick={() => handleSignIn("microsoft")}
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
                  onClick={() => handleSignIn("reddit")}
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
                  onClick={() => handleSignIn("discord")}
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
          )}
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
