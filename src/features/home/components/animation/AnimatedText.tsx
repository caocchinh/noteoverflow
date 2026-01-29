import type { FC } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

const AnimatedText: FC<AnimatedTextProps> = ({ text, className = "" }) => {
  return (
    <p className={`overflow-hidden ${className}`}>
      {text.split(" ").map((word, index) => (
        <span
          key={`${word}-${index}`}
          style={{
            display: "inline-block",
            marginRight: "0.25em",
            fontSize: "1.1rem",
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
};

export default AnimatedText;
