import { motion } from "motion/react";
import type { FC } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const AnimatedText: FC<AnimatedTextProps> = ({
  text,
  className = "",
  delay = 0,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.9,
        duration: 1.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      filter: "blur(10px)",
      transition: {
        type: "spring",
        damping: 24,
        stiffness: 100,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 24,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.p
      animate="visible"
      className={`overflow-hidden ${className}`}
      initial="hidden"
      variants={containerVariants}
    >
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            marginRight: "0.25em",
            fontSize: "1.1rem",
          }}
          variants={wordVariants}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default AnimatedText;
