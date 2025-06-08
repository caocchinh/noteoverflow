"use client";
import AnimatedText from "@/components/ui/animation/AnimatedText";
import NavBar from "@/components/NavBar/NavBar";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import RotatingText from "@/components/ui/animation/RotatingText";

export default function Home() {
  return (
    <div className="bg-foreground min-h-screen">
      <NavBar />
      <section className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 py-12 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 2,
            type: "tween",
          }}
          className="mb-8"
        >
          <Image
            src="/assets/logo-bg-colorised-modified-small.png"
            alt="NoteOverflow"
            width={65}
            height={65}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mb-4"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl md:text-5xl font-bold text-background ">
              Exam preparation.
            </h1>
            <RotatingText
              texts={[
                "Reimagined.",
                "Simplified.",
                "Elevated.",
                "Accelerated.",
                "Refined.",
              ]}
              mainClassName="px-2 mt-1 sm:px-2 md:px-3 bg-logo-main text-background overflow-hidden py-0.5 sm:py-1 md:py-2  justify-center rounded-lg text-4xl md:text-5xl font-bold text-background"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={5000}
            />
          </div>
        </motion.div>

        <AnimatedText
          text="A robust, comprehensive IGCSE, AS & A-level study materials platform"
          className="max-w-2xl mx-auto text-background/50"
          delay={1}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.9,
            type: "spring",
            damping: 10,
            stiffness: 100,
          }}
          className="mt-7"
        >
          <Button className="p-6 !px-6 cursor-pointer bg-transparent hover:bg-background border-1 border-background hover:text-foreground  text-background text-[18px] rounded-lg hover:opacity-90 transition-all shadow-lg">
            Get Started
            <Sparkles />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
