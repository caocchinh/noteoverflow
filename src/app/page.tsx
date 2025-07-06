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
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LOGO_MAIN_COLOR,
  TOPICAL_QUESTION_APP_ROUTE,
} from "@/constants/constants";
import AnimatedText from "@/features/home/components/animation/AnimatedText";
import Beams from "@/features/home/components/animation/Beams";
import ClickSpark from "@/features/home/components/animation/ClickSpark";
import CountUp from "@/features/home/components/animation/CountUp";
import Crosshair from "@/features/home/components/animation/Crosshair";
import GridMotion from "@/features/home/components/animation/GridMotion";
import { GridPattern } from "@/features/home/components/animation/grid-pattern";
import InfiniteScroll from "@/features/home/components/animation/InfiniteScroll";
import PixelCard from "@/features/home/components/animation/PixelCard";
import RotatingText from "@/features/home/components/animation/RotatingText";
import { Sparkles } from "@/features/home/components/animation/Sparkles";
import { TextScramble } from "@/features/home/components/animation/text-scramble";
import ProfileCard from "@/features/home/components/ProfileCard/ProfileCard";
import { MacbookScroll } from "@/features/home/components/animation/macbook-scroll";
import { cn } from "@/lib/utils";

const items = Array.from({ length: 22 }, (_, i) => {
  const num = i + 1;
  return (
    <Image
      alt="NoteOverflow"
      className="!h-full w-full rounded-lg object-contain object-left"
      height={65}
      key={`logo${num}`}
      src={`/assets/demo/${num}.webp`}
      width={65}
    />
  );
});
const InfiniteScrollItems = [
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
          <Dna /> Biology (9700)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
          <FlaskConical /> Chemistry (9701)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
          <Atom /> Physics (9702)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
          <Code /> Computer Science (9618)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
          <Pi /> Further Mathematics (9231)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
          <ChartLine /> Economics (9708)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex w-max items-center justify-center gap-2 rounded-lg border border-[var(--home-page-border)] p-6 text-2xl text-[var(--home-page-text)] transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[var(--home-page-hover-bg)]">
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
    <div className="min-h-screen bg-[var(--home-page-bg)]">
      <ClickSpark
        duration={400}
        sparkColor="#fff"
        sparkCount={8}
        sparkRadius={15}
        sparkSize={10}
      >
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-12 pb-0 text-center md:px-8">
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <GridPattern
              className={cn(
                "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
              )}
              height={30}
              strokeDasharray={"4 2"}
              width={30}
              x={-1}
              y={-1}
            />
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{
              duration: 2,
              type: "tween",
            }}
          >
            <Image
              alt="NoteOverflow"
              className="relative z-10"
              height={65}
              src="/assets/logo-bg-colorised-modified-small.webp"
              width={65}
            />
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="relative z-10 flex flex-col items-center justify-center gap-4">
              <h1 className="font-bold text-3xl text-[var(--home-page-text)] md:text-5xl ">
                CIE Exams Preparation.
              </h1>
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

          <AnimatedText
            className="relative z-10 mx-auto max-w-2xl text-[var(--home-page-text-muted)]"
            delay={1}
            text="World's most comprehensive IGCSE, AS & A-level study materials platform."
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
                <SparklesIcon />
              </Link>
            </Button>
          </motion.div>
        </section>
        <section className="relative flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-0 md:flex-row md:px-8">
          <div className="order-2 flex w-full items-center justify-center overflow-hidden md:order-1 md:w-1/2">
            <InfiniteScroll
              autoplay={true}
              autoplayDirection="up"
              autoplaySpeed={0.5}
              isTilted={true}
              itemMinHeight={70}
              items={InfiniteScrollItems}
              maxHeight="800px"
              pauseOnHover={true}
              tiltDirection="left"
              width="500px"
            />
          </div>
          <div className="order-1 w-full overflow-hidden md:order-2 md:w-1/2">
            <div>
              <CountUp
                className="w-full font-bold text-5xl text-logo-main"
                delay={0}
                direction="up"
                duration={2}
                from={100_000}
                to={200_000}
              />
              <span className="font-bold text-5xl text-logo-main">+</span>
            </div>
            <h1 className="w-full font-bold text-4xl text-[var(--home-page-text)]">
              Convenient topical past paper questions
            </h1>
            <p className="mt-2 w-full text-[var(--home-page-text-muted)] text-lg">
              from 2009 of the most popular IGCSE, AS & A-level subjects
            </p>
          </div>
        </section>
        <GridMotion items={items} />
        <MacbookScroll
          title={<span>Self-study made easy.</span>}
          badge={
            <Link href={TOPICAL_QUESTION_APP_ROUTE} title="Get started">
              <Image
                src="/assets/logo-bg-colorised-modified-small.webp"
                alt="NoteOverflow"
                height={20}
                width={20}
              />
            </Link>
          }
          src={`/assets/screen.png`}
          showGradient={false}
        />
        <section
          className="relative flex h-screen w-full cursor-none flex-col items-center justify-center gap-6 px-5"
          ref={containerRef}
        >
          <Crosshair
            color="#ffffff"
            containerRef={containerRef as RefObject<HTMLElement>}
          />

          <div className="absolute top-0 left-0 h-full w-full">
            <Beams
              beamHeight={30}
              beamNumber={25}
              beamWidth={3}
              lightColor="#7bb2f9"
              noiseIntensity={1.75}
              rotation={30}
              scale={0.2}
              speed={2}
            />
          </div>
          <div
            className="flex w-full items-center justify-center"
            ref={scrambleRef}
          >
            <TextScramble
              as="span"
              className="-mt-24 relative z-10 text-center font-semibold text-6xl text-[var(--home-page-text)] sm:text-7xl"
              delay={270}
              duration={1.4}
              trigger={isTrigger}
            >
              FREE. FOREVER.
            </TextScramble>
          </div>
          <PixelCard
            className="!absolute -translate-x-1/2 top-[54%] left-1/2 h-[80px] w-[300px] cursor-none"
            variant="blue"
          >
            <Button
              asChild
              className="absolute top-0 left-0 h-full w-full border-2 border-white/70 bg-transparent text-[var(--home-page-text)] text-xl hover:cursor-none hover:bg-transparent active:scale-[0.98]"
            >
              <Link href={TOPICAL_QUESTION_APP_ROUTE}>
                Learn with zero cost
                <HandCoins className="!w-6 !h-6" />
              </Link>
            </Button>
          </PixelCard>
        </section>
        <section className="relative flex flex-col items-center justify-center gap-10 overflow-hidden px-4 pt-6 pb-12 md:flex-row md:gap-18 md:px-8 md:pt-10 bg-[var(--home-page-bg)]">
          <div className="-translate-y-1/2 absolute top-1/2 z-[10] hidden h-full w-screen overflow-hidden sm:block ">
            <Sparkles
              color={LOGO_MAIN_COLOR}
              density={200}
              direction="top"
              speed={1.2}
            />
          </div>
          <div className="z-20 order-1 flex flex-col items-center justify-center gap-4 md:order-0">
            <ProfileCard
              avatarUrl="/assets/founder.webp"
              grainUrl="/assets/grain.webp"
              handle="founder@noteoverflow.com"
              iconUrl="/assets/logo-bg.webp"
              name="Mr. Cao Cự Chính"
              title="Founder & Developer"
            />
            <p className="w-[350px] text-left text-[var(--home-page-text-muted)] text-xs">
              *This project is purely 100% created with pride by a 12th grader
              Vietnamese student at Vinschool Central Park.{" "}
              <span>
                <Image
                  alt="Vinschool"
                  className="-mt-[5px] inline-block"
                  height={20}
                  src="/assets/vn.svg"
                  width={20}
                />
              </span>
            </p>
            <motion.a
              className="-mt-2 text-white"
              href="https://github.com/caocchinh"
              rel="noopener"
              target="_blank"
              title="Visit founder's GitHub"
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

          <div className="relative z-20 flex w-[90%] flex-col items-center justify-center md:w-[450px]">
            <p className="text-left text-[32px] text-[var(--home-page-text)]">
              &quot;Be kind whenever possible. It is always{" "}
              <span className="text-rose-700">possible.</span>&quot;
            </p>
            <p className="after:-translate-y-1/2 relative self-end text-left text-[var(--home-page-text-muted)] text-md after:absolute after:top-1/2 after:left-[-38px] after:z-[10] after:h-[1px] after:w-[35px] after:bg-[var(--home-page-text-muted)] after:content-['']">
              14th Dalai Lama (Tenzin Gyatso)
            </p>
          </div>
        </section>
      </ClickSpark>
    </div>
  );
}
