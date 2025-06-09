"use client";
import AnimatedText from "@/features/home/components/animation/AnimatedText";
import NavBar from "@/components/NavBar/NavBar";
import { Button } from "@/components/ui/button";
import {
  Atom,
  ChartLine,
  Code,
  Dna,
  FlaskConical,
  HandCoins,
  Pi,
  RectangleEllipsis,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import RotatingText from "@/features/home/components/animation/RotatingText";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";
import InfiniteScroll from "@/features/home/components/animation/InfiniteScroll";
import CountUp from "@/features/home/components/animation/CountUp";
import GridMotion from "@/features/home/components/animation/GridMotion";
import Beams from "@/features/home/components/animation/Beams";
import { TextScramble } from "@/features/home/components/animation/text-scramble";
import { RefObject, useEffect, useRef, useState } from "react";
import Crosshair from "@/features/home/components/animation/Crosshair";
import PixelCard from "@/features/home/components/animation/PixelCard";
import ClickSpark from "@/features/home/components/animation/ClickSpark";
import ProfileCard from "@/features/home/components/ProfileCard/ProfileCard";

const items = Array.from({ length: 22 }, (_, i) => {
  const num = i + 1;
  return (
    <Image
      key={`logo${num}`}
      src={`/assets/demo/${num}.png`}
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
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
          <Dna /> Biology (9700)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
          <FlaskConical /> Chemistry (9701)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
          <Atom /> Physics (9702)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
          <Code /> Computer Science (9618)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
          <Pi /> Further Mathematics (9231)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
          <ChartLine /> Economics (9708)
        </div>
      </div>
    ),
  },
  {
    content: (
      <div className="flex flex-col items-center justify-center">
        <div className="text-background border-background/20 border-1 rounded-lg flex items-center gap-2 justify-center hover:bg-background/10 transition-all duration-300 w-max p-6 text-2xl hover:cursor-pointer">
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
    <div className="bg-foreground min-h-screen">
      <NavBar />
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
                mainClassName="px-2 mt-1 sm:px-2 md:px-3 bg-logo-main text-background overflow-hidden py-0.5 sm:py-1 md:py-2  justify-center rounded-lg text-4xl md:text-5xl font-bold text-background"
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
        <section className="relative min-h-screen gap-12 py-0 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center">
          <div className="w-full md:w-1/2 order-2 md:order-1 overflow-hidden flex items-center justify-center">
            <InfiniteScroll
              items={InfiniteScrollItems}
              isTilted={true}
              width="500px"
              itemMinHeight={70}
              maxHeight="800px"
              tiltDirection="left"
              autoplay={false}
              autoplaySpeed={0.1}
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
            <h1 className="text-background text-4xl font-bold w-full">
              Convenient topical past paper questions
            </h1>
            <p className="text-background/50 text-lg w-full mt-2">
              from 2009 of the most popular IGCSE, AS & A-level subjects
            </p>
          </div>
        </section>
        <GridMotion items={items} />
        <section
          className="w-full h-screen relative gap-6 flex flex-col items-center justify-center"
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
              className="text-7xl font-semibold text-center relative z-10 text-background"
              as="span"
              trigger={isTrigger}
              duration={1.2}
              delay={300}
            >
              FREE. FOREVER.
            </TextScramble>
          </div>
          <PixelCard variant="blue">
            <Button className="absolute top-0 border-background/20 border-1 left-0 w-full h-full bg-transparent hover:bg-transparent">
              Learn with zero cost
              <HandCoins />
            </Button>
          </PixelCard>
        </section>
        <section className="flex flex-col md:flex-row items-center justify-center py-12 px-4 md:px-8 gap-12 ">
          <ProfileCard
            avatarUrl="/assets/founder.png"
            iconUrl="/assets/logo-bg.png"
            grainUrl="/assets/grain.webp"
            name="Mr. Cao Cự Chính"
            title="Founder & Developer"
            className="order-1 md:order-0"
            handle="founder@noteoverflow.com"
          />

          <div className="flex flex-row items-center justify-center w-[90%] sm:w-[320px] relative">
            <p className="text-background/80 text-justify text-4xl ">
              &quot;In every opened mind and heart, education sows the seeds of
              boundless compassion.&quot;
            </p>
          </div>
        </section>
      </ClickSpark>
    </div>
  );
}
