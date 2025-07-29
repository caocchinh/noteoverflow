"use client";

import {
  ExternalLink,
  Link as LinkIcon,
  RefreshCcw,
  TriangleAlert,
  ArrowLeft,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LOGO_MAIN_COLOR,
  TOPICAL_QUESTION_APP_ROUTE,
} from "@/constants/constants";
import type { TurnstileOptions } from "@/constants/types";
import Silk from "@/features/authentication/components/animation/Silk";
import VerifyingLoader from "@/features/authentication/components/VerifyingLoader/VerifyingLoader";
import {
  FUNNY_VERIFICATION_MESSAGES,
  LOADING_MESSAGES,
} from "@/features/authentication/constants/constants";
import { authClient } from "@/lib/auth/auth-client";
import {
  cn,
  isEmbeddedBrowser,
  isAppleDevice,
  openInExternalBrowser,
} from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

// Cloudflare Turnstile type declarations
declare global {
  interface Window {
    onloadTurnstileCallback: () => void;
  }
}

declare const turnstile: {
  render: (
    container: string | HTMLElement,
    options: TurnstileOptions
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

const AuthPageClient = ({
  searchParams,
  turnstileSiteKey,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  turnstileSiteKey: string;
}) => {
  const [isEmbededBrowser, setIsEmbededBrowser] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !navigator || !navigator.userAgent) {
      return;
    }
    setIsEmbededBrowser(isEmbeddedBrowser());
  }, []);

  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isInvisibleVerifying, setIsInvisibleVerifying] = useState(true);
  const [isVerificationTimeout, setIsVerificationTimeout] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
    script.async = true;
    script.id = "turnstile-script";
    document.head.appendChild(script);

    if (typeof window !== "undefined") {
      window.onloadTurnstileCallback = () => {
        // Check if widget already exists in this container
        const container = document.getElementById("cf-turnstile");
        if (container?.hasChildNodes()) {
          return;
        }

        turnstile.render("#cf-turnstile", {
          sitekey: turnstileSiteKey,
          callback(token: string) {
            setError(null);
            setIsInvisibleVerifying(false);
            setTurnstileToken(token);
          },
          "expired-callback"() {
            setIsInvisibleVerifying(false);
            setError("Widget expired, please try again!");
          },
          "error-callback"() {
            setIsInvisibleVerifying(false);
            setError("Unable to verify, please try again!");
          },
          "timeout-callback"() {
            setError("Timeout, please try again!");
          },
          "before-interactive-callback"() {
            setIsInvisibleVerifying(false);
          },
          "unsupported-callback"() {
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
    if (isVerificationTimeout) {
      setIsVerificationTimeout(true);
    }
  }, [isVerificationTimeout]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVerificationTimeout(true);
    }, 15_000);
    return () => {
      clearTimeout(timeout);
      const scriptElement = document.getElementById("turnstile-script");
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  useEffect(() => {
    if (Object.keys(searchParams).includes("error")) {
      if (searchParams.error === "access_denied") {
        setError("Access denied. Please try again.");
      } else if (searchParams.error === "banned") {
        setError(searchParams.error_description as string);
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

  useEffect(() => {
    const randomIndex = Math.floor(
      Math.random() * FUNNY_VERIFICATION_MESSAGES.length
    );
    setVerificationMessage(FUNNY_VERIFICATION_MESSAGES[randomIndex]);
  }, []);

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
    }, 30_000);
  };

  const handleSignIn = async (
    provider: "google" | "microsoft" | "reddit" | "discord"
  ) => {
    try {
      setIsNavigating(true);
      setLoadingText(getRandomMessage());
      startAuthTimeout();
      const response = await authClient.signIn.social({
        provider,
        callbackURL: TOPICAL_QUESTION_APP_ROUTE,
        fetchOptions: {
          headers: {
            ...(turnstileToken && { "x-captcha-response": turnstileToken }),
          },
        },
      });
      if (response.error) {
        setError(
          response.error.message ?? "Something went wrong, please try again"
        );
      }
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
    <>
      <AlertDialog open={isEmbededBrowser}>
        <AlertDialogContent className="flex flex-col items-center justify-center gap-3 !py-4 border border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-4xl font-bold">
              Warning
            </AlertDialogTitle>
          </AlertDialogHeader>
          <TriangleAlert className="text-red-500" size={75} />
          <AlertDialogDescription className="text-xl text-center">
            Due to security reasons, sign in within an embedded browser is
            prohibited. Please open the link in an external browser.
          </AlertDialogDescription>
          <AlertDialogFooter className="flex !flex-col items-center justify-center gap-3 w-full">
            <Button
              className="flex items-center justify-center gap-2 cursor-pointer w-full"
              onClick={(e) => {
                e.preventDefault();
                openInExternalBrowser(window.location.href);
              }}
            >
              {isAppleDevice() ? "Open in Safari" : "Open in Chrome"}
              <ExternalLink />
            </Button>
            <Button
              className="flex items-center justify-center gap-2 cursor-pointer w-full"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            >
              {copied ? "Copied!" : "Copy link"}
              <LinkIcon />
            </Button>
            <Link
              className="flex items-center justify-center gap-2 p-2 text-sm rounded-sm cursor-pointer w-full bg-logo-main text-white"
              href="/topical"
            >
              <ArrowLeft size={15} />
              Back to topical question app
            </Link>

            <h5 className="font-light text-center text-red-500 text-sm w-full">
              {isAppleDevice()
                ? "If you are using iOS version 15 and below, please open any external browser manually!"
                : "If Chrome hasn't been installed, please open any external browser manually!"}
            </h5>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="grid min-h-svh bg-background md:grid-cols-2">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex w-full flex-col items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            animate="show"
            className="flex w-[85%] flex-col items-center justify-center gap-6"
            initial="hidden"
            transition={{ staggerChildren: 0.1 }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1 },
            }}
          >
            <div className="flex w-full flex-col">
              <motion.div
                className=" mb-2 flex w-full flex-row flex-wrap items-center justify-center gap-1 text-center text-sm"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <h1 className="relative z-10 bg-background px-2 text-center font-semibold text-3xl text-foreground">
                  {isNavigating ? loadingText : "Sign In"}
                </h1>
                <Image
                  alt="logo"
                  className={cn(isNavigating && "animate-spin")}
                  height={35}
                  src="/assets/logo-bg-colorised-modified-small.webp"
                  width={35}
                />
              </motion.div>

              {isInvisibleVerifying && (
                <div className="mt-2 flex w-full flex-col items-center justify-center gap-2">
                  <div className="text-center text-foreground text-sm">
                    {verificationMessage}
                  </div>
                  <VerifyingLoader />
                </div>
              )}

              <div
                className="mt-4 flex w-full items-center justify-center"
                data-callback="handleTurnstileCallback"
                data-sitekey={turnstileSiteKey}
                id="cf-turnstile"
              />

              {isVerificationTimeout && isInvisibleVerifying && (
                <div className="flex w-full flex-col items-center justify-center gap-2">
                  <Button
                    className="mt-5 w-max cursor-pointer"
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Is this taking too long? Try to refresh the page.
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {error && (
                <motion.div
                  className="mb-2 flex w-full items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="text-center font-medium text-red-500">
                    {error}
                  </div>
                </motion.div>
              )}
            </div>

            {turnstileToken && (
              <motion.div
                animate="show"
                className="flex flex-col gap-5"
                initial="hidden"
                transition={{ staggerChildren: 0.1 }}
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1 },
                }}
              >
                <motion.div
                  className="flex w-full items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Button
                    className="!w-[200px] !h-[40px] !font-medium !font-roboto !rounded-[4px] !gap-[10px] !px-[12px] flex items-center justify-center border-1 border-[#747775] text-[#1F1F1F] hover:cursor-pointer dark:border-[#8E918F] dark:text-[#E3E3E3]"
                    disabled={isNavigating}
                    onClick={() => handleSignIn("google")}
                    variant="outline"
                  >
                    <Image
                      alt="Google Logo"
                      height={20}
                      src="/assets/google.svg"
                      width={20}
                    />
                    Sign in with Google
                  </Button>
                </motion.div>

                <motion.div
                  className="flex w-full items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Button
                    className="!w-[200px] !h-[41px] !font-medium !font !rounded-[4px] !gap-[10px] !px-[12px] flex items-center justify-center border-1 border-[#8C8C8C] bg-white text-[#5E5E5E] hover:cursor-pointer dark:border-[#8E918F] dark:bg-[#2F2F2F] dark:text-white"
                    disabled={isNavigating}
                    onClick={() => handleSignIn("microsoft")}
                    variant="outline"
                  >
                    <Image
                      alt="Microsoft Logo"
                      height={20}
                      src="/assets/microsoft.svg"
                      width={20}
                    />
                    Sign in with Microsoft
                  </Button>
                </motion.div>

                <motion.div
                  className="flex w-full items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Button
                    className="!w-[200px] !h-[40px] !text-white !font-medium !font-roboto !rounded-[4px] !gap-[10px] !px-[12px] !bg-[#ff4500] flex items-center justify-center border-1 border-[#747775] hover:cursor-pointer dark:border-[#8E918F]"
                    disabled={isNavigating}
                    onClick={() => handleSignIn("reddit")}
                    variant="outline"
                  >
                    <Image
                      alt="Reddit Logo"
                      height={20}
                      src="/assets/reddit.svg"
                      width={20}
                    />
                    Sign in with Reddit
                  </Button>
                </motion.div>

                <motion.div
                  className="flex w-full items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Button
                    className="!w-[200px] !h-[40px] !text-white !font-medium !font-roboto !rounded-[4px] !gap-[10px] !px-[12px] !bg-[#5865F2] flex items-center justify-center border-1 border-[#747775] hover:cursor-pointer dark:border-[#8E918F]"
                    disabled={isNavigating}
                    onClick={() => handleSignIn("discord")}
                    variant="outline"
                  >
                    <Image
                      alt="Discord Logo"
                      height={20}
                      src="/assets/discord.svg"
                      width={20}
                    />
                    Sign in with Discord
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        <motion.div
          animate={{ opacity: 1 }}
          className="hidden h-screen w-full md:block"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Silk
            color={LOGO_MAIN_COLOR}
            noiseIntensity={1.5}
            rotation={0}
            scale={1}
            speed={5}
          />
        </motion.div>
      </div>
    </>
  );
};

export default AuthPageClient;
