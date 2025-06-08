"use client";
import AnimatedText from "@/components/ui/animation/AnimatedText";
import NavBar from "@/components/NavBar/NavBar";
import { Button } from "@/components/ui/button";
import {
  Atom,
  ChartLine,
  Code,
  Dna,
  FlaskConical,
  Pi,
  RectangleEllipsis,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import RotatingText from "@/components/ui/animation/RotatingText";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";
import InfiniteScroll from "@/components/ui/animation/InfiniteScroll";
import CountUp from "@/components/ui/animation/CountUp";
import GridMotion from "@/components/ui/animation/GridMotion";

const items = [
  <Image
    key="logo1"
    src="/assets/demo/1.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo2"
    src="/assets/demo/2.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo3"
    src="/assets/demo/3.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo4"
    src="/assets/demo/4.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo5"
    src="/assets/demo/5.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo6"
    src="/assets/demo/6.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo7"
    src="/assets/demo/7.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo8"
    src="/assets/demo/8.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo9"
    src="/assets/demo/9.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo10"
    src="/assets/demo/10.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo11"
    src="/assets/demo/11.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo12"
    src="/assets/demo/12.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo13"
    src="/assets/demo/13.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo14"
    src="/assets/demo/14.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo15"
    src="/assets/demo/15.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo16"
    src="/assets/demo/16.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo17"
    src="/assets/demo/17.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo18"
    src="/assets/demo/18.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo19"
    src="/assets/demo/19.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo20"
    src="/assets/demo/20.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo21"
    src="/assets/demo/21.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
  <Image
    key="logo22"
    src="/assets/demo/22.png"
    alt="NoteOverflow"
    className="w-full !h-full object-contain object-left rounded-lg"
    width={65}
    height={65}
  />,
];
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
  return (
    <div className="bg-foreground min-h-screen">
      <NavBar />
      <section className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 py-12 text-center relative">
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
      <section className="relative min-h-screen gap-12 py-12 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center">
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
              className="text-logo-main text-4xl font-bold w-full"
            />
            <span className="text-logo-main text-4xl font-bold">+</span>
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
    </div>
  );
}
