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
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import Beams from "@/features/home/components/animation/Beams";
import ClickSpark from "@/features/home/components/animation/ClickSpark";
import CountUp from "@/features/home/components/animation/CountUp";
import Crosshair from "@/features/home/components/animation/Crosshair";
import GridMotion from "@/features/home/components/animation/GridMotion";
import InfiniteScroll from "@/features/home/components/animation/InfiniteScroll";
import PixelCard from "@/features/home/components/animation/PixelCard";
import { TextScramble } from "@/features/home/components/animation/text-scramble";
import ProfileCard from "@/features/home/components/ProfileCard/ProfileCard";
import { MacbookScroll } from "@/features/home/components/animation/macbook-scroll";
import Home from "@/features/home/components/home";

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
      loading="lazy"
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

const glowAnimation = {
  opacity: [0.5, 0.8, 0.5],
  scale: [1, 1.05, 1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export default function HomePage() {
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
    <div className="min-h-screen bg-[var(--home-page-bg)] overflow-hidden">
      <ClickSpark
        duration={400}
        sparkColor="#fff"
        sparkCount={8}
        sparkRadius={15}
        sparkSize={10}
      >
        <Home />

        <section className="relative flex flex-col items-center justify-center gap-12 px-4 py-10 md:flex-row md:px-8">
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
                from={50_000}
                to={100_000}
              />
              <span className="font-bold text-5xl text-logo-main">+</span>
            </div>
            <h1 className="w-full fo1t-bold text-4xl text-[var(--home-page-text)]">
              Convenient topical past paper questions
            </h1>
            <p className="mt-2 w-full text-[var(--home-page-text-muted)] text-lg">
              from 2009 of the most popular AS & A-level subjects
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
          src={`/assets/screen.webp`}
          showGradient={false}
        />
        <section
          className="relative z-[1000] flex h-screen w-full cursor-none flex-col items-center justify-center gap-6 px-5"
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
        <section className="relative flex flex-col items-center justify-center gap-10 overflow-hidden px-4 pt-6 pb-12 md:flex-row md:gap-18 md:px-8 md:pt-10 bg-[var(--home-page-bg)] z-[1000]">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/35 via-black/70 to-gray-950 blur-3xl"></div>

            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.40)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.40)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            </div>

            <div className="absolute -left-20 top-20 h-60 w-60 rounded-full bg-purple-600/27 blur-[100px]"></div>
            <div className="absolute -right-20 bottom-20 h-60 w-60 rounded-full bg-blue-600/42 blur-[100px]"></div>
            <motion.div
              animate={glowAnimation}
              className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-indigo-500/30 blur-[80px]"
            ></motion.div>
            <motion.div
              animate={glowAnimation}
              className="absolute bottom-1/3 right-1/4 h-40 w-40 rounded-full bg-purple-500/30 blur-[80px]"
            ></motion.div>

            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-white"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
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
              &quot;Be kind whenever possible. It is{" "}
              <span className="text-rose-700">always</span> possible.&quot;
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
