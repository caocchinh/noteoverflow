"use client";
import { type JSX, useEffect, useState } from "react";
import { motion, MotionProps } from "motion/react";
import FuzzyText from "./FuzzyText";
import { AnimatePresence } from "framer-motion";

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  delay?: number;
  trigger?: boolean;
  onScrambleComplete?: () => void;
} & MotionProps;

const defaultChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = "p",
  delay = 0,
  trigger = true,
  onScrambleComplete,
  ...props
}: TextScrambleProps) {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements
  );
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const text = children;

  const scramble = async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (isAnimating) return;
    setIsAnimating(true);
    setCompleted(false);

    const steps = duration / speed;
    let step = 0;

    const interval = setInterval(() => {
      let scrambled = "";
      const progress = step / steps;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          scrambled += " ";
          continue;
        }

        if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled +=
            characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }

      setDisplayText(scrambled);
      step++;

      if (step > steps) {
        clearInterval(interval);
        setDisplayText(text);
        setIsAnimating(false);
        setCompleted(true);
        onScrambleComplete?.();
      }
    }, speed * 1000);
  };

  useEffect(() => {
    if (!trigger) return;

    scramble();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <MotionComponent className={className} {...props}>
      <div className="block lg:hidden">
        {displayText == text && displayText}
      </div>
      {displayText != text && displayText}
      <AnimatePresence mode="wait">
        {completed && displayText == text && (
          <motion.div
            key="completed-text"
            className="hidden lg:block mb-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
              opacity: { duration: 0.8 },
              scale: {
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 12,
              },
            }}
          >
            <FuzzyText
              fontSize="100px"
              fontWeight={600}
              baseIntensity={0.03}
              hoverIntensity={0.17}
              enableHover={true}
            >
              {displayText}
            </FuzzyText>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionComponent>
  );
}
