"use client";

import type React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Bricolage_Grotesque } from "next/font/google";
import { Spotlight } from "./spotlight";
import { Particles } from "./particles";
import { cn } from "@/lib/utils";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import AnimatedText from "@/features/home/components/animation/AnimatedText";
import RotatingText from "@/features/home/components/animation/RotatingText";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const brico = Bricolage_Grotesque({
  subsets: ["latin"],
});

export default function WaitlistPage() {
  const color = "#ffffff";

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden xl:h-screen">
      <Spotlight />

      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        refresh
        color={color}
      />

      <div className="relative z-[100] mx-auto max-w-4xl px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="mb-0 inline-flex items-center gap-2 rounded-full"
        >
          <Image
            alt="NoteOverflow"
            className="relative z-10"
            height={65}
            src="/assets/logo-bg-colorised-modified-small.webp"
            width={65}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={cn(
            "mb-4 cursor-crosshair bg-gradient-to-b dark:from-foreground dark:via-foreground/80 dark:to-foreground/40 from-background via-background/80 to-background/40  bg-clip-text text-4xl font-bold text-transparent sm:text-7xl",
            brico.className
          )}
        >
          CIE Exams Preparation.
        </motion.h1>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: 2,
            type: "tween",
          }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="relative z-10 flex flex-col items-center justify-center gap-4">
              <RotatingText
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                initial={{ y: "100%" }}
                mainClassName="px-2 mt-1 sm:px-2 md:px-3 bg-logo-main overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg text-4xl md:text-5xl font-bold text-[var(--home-page-text)]"
                rotationInterval={4000}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                staggerDuration={0.025}
                staggerFrom={"last"}
                texts={[
                  "Free forever.",
                  "Reimagined.",
                  "Simplified.",
                  "Accelerated.",
                  "Refined.",
                ]}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            </div>
          </motion.div>
        </motion.div>
        <motion.div>
          <AnimatedText
            className="relative z-10 mx-auto max-w-2xl text-[var(--home-page-text-muted)]"
            delay={1}
            text="World's most robust IGCSE, AS & A-level study materials platform."
          />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 w-full"
            initial={{ opacity: 0, y: 20 }}
            transition={{
              delay: 1.9,
              type: "spring",
              damping: 10,
              stiffness: 100,
            }}
          >
            <Button
              asChild
              className="!px-6 w-[90%] cursor-pointer rounded-lg border border-[var(--home-page-text)] bg-transparent p-6 text-[var(--home-page-text)] shadow-lg transition-all hover:bg-[var(--home-page-text)] hover:text-[var(--home-page-bg)] hover:opacity-90 active:scale-[0.99] md:w-[50%]"
            >
              <Link href={TOPICAL_QUESTION_APP_ROUTE}>
                Get Started
                <Sparkles />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
