"use client";
import { AnimatePresence, type MotionProps, motion } from "motion/react";
import { type JSX, useEffect, useRef, useState } from "react";
import FuzzyText from "../../../../components/animation/FuzzyText";

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
  duration = 1.3,
  speed = 0.07,
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (isAnimating) {
      return;
    }
    setIsAnimating(true);
    setCompleted(false);

    const steps = duration / speed;
    let step = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

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
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsAnimating(false);
        setCompleted(true);
        onScrambleComplete?.();
      }
    }, speed * 1000);

    intervalRef.current = interval;
  };

  useEffect(() => {
    if (!trigger) {
      return;
    }

    scramble();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <MotionComponent className={className} {...props}>
      <div className="block lg:hidden">
        {displayText === text && displayText}
      </div>
      {displayText !== text && displayText}
      <AnimatePresence mode="wait">
        {completed && displayText === text && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="mb-2 hidden lg:block"
            initial={{ opacity: 0, scale: 0.95 }}
            key="completed-text"
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
              baseIntensity={0.03}
              enableHover={true}
              fontSize="100px"
              fontWeight={600}
              hoverIntensity={0.17}
            >
              {displayText}
            </FuzzyText>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionComponent>
  );
}
