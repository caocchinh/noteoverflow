"use client";

import {
  Atom,
  ChartLine,
  Code,
  Dna,
  FlaskConical,
  Github,
  HandCoins,
  Pi,
  RectangleEllipsis,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, RefObject } from "react";
import { GridPattern } from "@/features/home/components/animation/grid-pattern";
import { Button } from "@/components/ui/button";
import AnimatedText from "@/features/home/components/animation/AnimatedText";
import RotatingText from "@/features/home/components/animation/RotatingText";
import InfiniteScroll from "@/features/home/components/animation/InfiniteScroll";
import CountUp from "@/features/home/components/animation/CountUp";
import GridMotion from "@/features/home/components/animation/GridMotion";
import Beams from "@/features/home/components/animation/Beams";
import { TextScramble } from "@/features/home/components/animation/text-scramble";
import ClickSpark from "@/features/home/components/animation/ClickSpark";
import PixelCard from "@/features/home/components/animation/PixelCard";
import ProfileCard from "@/features/home/components/ProfileCard/ProfileCard";
import Crosshair from "@/features/home/components/animation/Crosshair";
import { Sparkles } from "@/features/home/components/animation/Sparkles";
import { LOGO_MAIN_COLOR } from "@/constants/constants";

const items = Array.from({ length: 22 }, (_, i) => {
  const num = i + 1;
  return (
    <Image
      key={`logo${num}`}
      src={`/assets/demo/${num}.webp`}
      alt="NoteOverflow"
      className="w-full !h-full object-contain object-left rounded-lg"
      width={65}
      height={65}
    />
  );
});
const InfiniteScrollItems = [
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <Dna /> Biology (9700)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <FlaskConical /> Chemistry (9701)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <Atom /> Physics (9702)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <Code /> Computer Science (9618)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <Pi /> Further Mathematics (9231)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <ChartLine /> Economics (9708)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 justify-center hover:cursor-pointer w-max p-6 text-2xl rounded-lg text-[var(--home-page-text)] border border-[var(--home-page-border)] transition-all duration-300 ease-in-out hover:bg-[var(--home-page-hover-bg)]">
          <RectangleEllipsis /> Many more...
        </div>
      </div>
    ),
  },
];

export default function Home() {
  const [isTrigger, setIsTrigger] = useState(false);
  const alreadyScrambled = useRef(false);
  const scrambleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create an IntersectionObserver to observe the ref's visibility
    const observer = new IntersectionObserver(([entry]) => {
      setIsTrigger(entry.isIntersecting && !alreadyScrambled.current);
      if (entry.isIntersecting) {
        alreadyScrambled.current = true;
      }
    });

    // Start observing the element
    if (scrambleRef.current) {
      observer.observe(scrambleRef.current);
    }

    // Cleanup the observer when the component unmounts or ref changes
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-[var(--home-page-bg)] min-h-screen">
      <ClickSpark
        sparkColor="#fff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <section className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 pb-0 pt-12 text-center relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <GridPattern
              width={30}
              height={30}
              x={-1}
              y={-1}
              strokeDasharray={"4 2"}
              className={cn(
                "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
              )}
            />
          </motion.div>
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
              src="/assets/logo-bg-colorised-modified-small.webp"
              alt="NoteOverflow"
              className="relative z-10"
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
            <div className="flex flex-col items-center justify-center gap-4 relative z-10">
              <h1 className="text-3xl md:text-5xl font-bold text-[var(--home-page-text)] ">
                CAIE Exams Preparation.
              </h1>
              <RotatingText
                texts={[
                  "Free forever.",
                  "Reimagined.",
                  "Simplified.",
                  "Accelerated.",
                  "Refined.",
                ]}
                mainClassName="px-2 mt-1 sm:px-2 md:px-3 bg-logo-main overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg text-4xl md:text-5xl font-bold text-[var(--home-page-text)]"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={4000}
              />
            </div>
          </motion.div>

          <AnimatedText
            text="World's most comprehensive IGCSE, AS & A-level study materials platform."
            className="max-w-2xl mx-auto text-[var(--home-page-text-muted)] relative z-10"
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
            className="mt-7 w-full"
          >
            <Button
              asChild
              className="p-6 !px-6 cursor-pointer rounded-lg transition-all shadow-lg bg-transparent text-[var(--home-page-text)] border border-[var(--home-page-text)] hover:bg-[var(--home-page-text)] hover:text-[var(--home-page-bg)] hover:opacity-90 w-[90%] md:w-[50%] active:scale-[0.99]"
            >
              <Link href="/app">
                Get Started
                <SparklesIcon />
              </Link>
            </Button>
          </motion.div>
        </section>
        <section className="relative min-h-screen gap-12 py-0 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center">
          <div className="w-full md:w-1/2 order-2 md:order-1 overflow-hidden flex items-center justify-center">
            <InfiniteScroll
              items={InfiniteScrollItems}
              isTilted={true}
              width="500px"
              itemMinHeight={70}
              maxHeight="800px"
              tiltDirection="left"
              autoplay={true}
              autoplaySpeed={0.5}
              autoplayDirection="up"
              pauseOnHover={true}
            />
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 overflow-hidden">
            <div>
              <CountUp
                to={200000}
                from={0}
                direction="up"
                delay={0}
                duration={2}
                className="text-logo-main text-5xl font-bold w-full"
              />
              <span className="text-logo-main text-5xl font-bold">+</span>
            </div>
            <h1 className="text-4xl font-bold w-full text-[var(--home-page-text)]">
              Convenient topical past paper questions
            </h1>
            <p className="text-lg w-full mt-2 text-[var(--home-page-text-muted)]">
              from 2009 of the most popular IGCSE, AS & A-level subjects
            </p>
          </div>
        </section>
        <GridMotion items={items} />
        <section
          className="w-full h-screen relative gap-6 flex flex-col items-center justify-center px-5 cursor-none"
          ref={containerRef}
        >
          <Crosshair
            containerRef={containerRef as RefObject<HTMLElement>}
            color="#ffffff"
          />

          <div className="absolute top-0 left-0 w-full h-full">
            <Beams
              beamWidth={3}
              beamHeight={30}
              beamNumber={25}
              lightColor="#7bb2f9"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={30}
            />
          </div>
          <div
            ref={scrambleRef}
            className="w-full flex items-center justify-center"
          >
            <TextScramble
              className="text-6xl -mt-24 sm:text-7xl font-semibold text-center relative z-10 text-[var(--home-page-text)]"
              as="span"
              trigger={isTrigger}
              duration={1.4}
              delay={270}
            >
              FREE. FOREVER.
            </TextScramble>
          </div>
          <PixelCard
            variant="blue"
            className="cursor-none !absolute top-[54%] left-1/2 -translate-x-1/2 w-[300px] h-[80px]"
          >
            <Button
              asChild
              className="absolute hover:cursor-none top-0 left-0 w-full text-xl h-full bg-transparent hover:bg-transparent border-2 border-white/70 text-[var(--home-page-text)] active:scale-[0.98]"
            >
              <Link href="/app">
                Learn with zero cost
                <HandCoins className="!w-6 !h-6" />
              </Link>
            </Button>
          </PixelCard>
        </section>
        <section className="flex flex-col md:flex-row items-center justify-center pb-12 pt-6 md:pt-10 px-4 md:px-8 md:gap-18 gap-10 relative overflow-hidden">
          <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 h-full z-[10] w-screen overflow-hidden ">
            <Sparkles
              density={200}
              speed={1.2}
              color={LOGO_MAIN_COLOR}
              direction="top"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 order-1 md:order-0 z-20">
            <ProfileCard
              avatarUrl="/assets/founder.webp"
              iconUrl="/assets/logo-bg.webp"
              grainUrl="/assets/grain.webp"
              name="Mr. Cao Cự Chính"
              title="Founder & Developer"
              handle="founder@noteoverflow.com"
            />
            <p className="text-left text-xs text-[var(--home-page-text-muted)] w-[350px]">
              *This project is purely 100% created with pride by a 12th grader
              Vietnamese student at Vinschool Central Park.{" "}
              <span>
                <Image
                  src="/assets/vn.svg"
                  alt="Vinschool"
                  className="inline-block -mt-[5px]"
                  width={20}
                  height={20}
                />
              </span>
            </p>
            <motion.a
              href="https://github.com/caocchinh"
              target="_blank"
              title="Visit founder's GitHub"
              className="text-white -mt-2"
              whileHover={{
                rotateZ: -10,
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Github />
            </motion.a>
          </div>

          <div className="flex flex-col items-center justify-center w-[90%] md:w-[450px] relative z-20">
            <p className="text-left text-[32px] text-[var(--home-page-text)]">
              &quot;Be kind whenever possible. It is always{" "}
              <span className="text-rose-700">possible.</span>&quot;
            </p>
            <p className="text-left text-md text-[var(--home-page-text-muted)] after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[-38px] after:w-[35px] after:h-[1px] after:bg-[var(--home-page-text-muted)] after:z-[10] relative self-end">
              14th Dalai Lama (Tenzin Gyatso)
            </p>
          </div>
        </section>
      </ClickSpark>
    </div>
  );
}
