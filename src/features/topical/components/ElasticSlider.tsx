import React, { useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { SquareMinus, SquarePlus } from "lucide-react";

const MAX_OVERFLOW = 30;

interface ElasticSliderProps {
  startingValue?: number;
  minValue?: number;
  maxValue?: number;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  setValue: (value: number) => void;
}

const ElasticSlider: React.FC<ElasticSliderProps> = ({
  startingValue = 1,
  minValue = 1,
  maxValue = 5,
  className = "",
  isStepped = false,
  stepSize = 1,
  setValue,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-0 w-48 ${className}`}
    >
      <Slider
        startingValue={startingValue}
        minValue={minValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        setValue={setValue}
      />
    </div>
  );
};

interface SliderProps {
  startingValue: number;
  minValue: number;
  maxValue: number;
  isStepped: boolean;
  stepSize: number;
  setValue: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  startingValue,
  minValue,
  maxValue,
  isStepped,
  stepSize,
  setValue,
}) => {
  const [sliderValue, setSliderValue] = useState<number>(startingValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<"left" | "middle" | "right">("middle");
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useMotionValueEvent(clientX, "change", (latest: number) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue: number;
      if (latest < left) {
        setRegion("left");
        newValue = left - latest;
      } else if (latest > right) {
        setRegion("right");
        newValue = latest - right;
      } else {
        setRegion("middle");
        newValue = 0;
      }
      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      let newValue =
        minValue + ((e.clientX - left) / width) * (maxValue - minValue);
      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }
      newValue = Math.min(Math.max(newValue, minValue), maxValue);
      setSliderValue(newValue);
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  const getRangePercentage = (): number => {
    return (sliderValue / maxValue) * 100;
  };

  return (
    <>
      <p className=" text-foreground transform text-md font-medium tracking-wide -mb-3">
        {Math.round(sliderValue)}
      </p>
      <motion.div
        onHoverStart={() => animate(scale, 1.2)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.2)}
        onTouchEnd={() => animate(scale, 1)}
        style={{
          scale,
          opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
        }}
        className="flex w-full touch-none select-none flex-row items-center justify-center gap-2"
      >
        <motion.div
          animate={{
            scale: region === "left" ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{
            x: useTransform(() =>
              region === "left" ? -overflow.get() / scale.get() : 0
            ),
          }}
          onClick={() => {
            if (sliderValue && sliderValue > minValue) {
              setSliderValue(sliderValue - 1);
            }
          }}
          className="cursor-pointer flex items-center justify-center"
        >
          <SquareMinus />
        </motion.div>

        <div
          ref={sliderRef}
          className="relative flex w-full flex-row max-w-xs flex-grow cursor-grab touch-none select-none items-center py-4"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <motion.div
            style={{
              scaleX: useTransform(() => {
                if (sliderRef.current) {
                  const { width } = sliderRef.current.getBoundingClientRect();
                  return 1 + overflow.get() / width;
                }
                return 1;
              }),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              transformOrigin: useTransform(() => {
                if (sliderRef.current) {
                  const { left, width } =
                    sliderRef.current.getBoundingClientRect();
                  return clientX.get() < left + width / 2 ? "right" : "left";
                }
                return "center";
              }),
              height: useTransform(scale, [1, 1.2], [6, 12]),
              marginTop: useTransform(scale, [1, 1.2], [0, -3]),
              marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
            }}
            className="flex flex-grow"
          >
            <div className="relative h-full flex-grow overflow-hidden rounded-full bg-gray-400">
              <div
                className="absolute h-full bg-logo-main rounded-full"
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{
            scale: region === "right" ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{
            x: useTransform(() =>
              region === "right" ? overflow.get() / scale.get() : 0
            ),
          }}
          className="cursor-pointer"
          onClick={() => {
            if (sliderValue && sliderValue < maxValue) {
              setSliderValue(sliderValue + 1);
            }
          }}
        >
          <SquarePlus />
        </motion.div>
      </motion.div>

      <Button
        className="w-full cursor-pointer mt-1"
        variant="outline"
        onClick={() => {
          if (sliderValue) {
            setValue(sliderValue);
          }
        }}
      >
        Save
      </Button>
    </>
  );
};

function decay(value: number, max: number): number {
  if (max === 0) {
    return 0;
  }
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export default ElasticSlider;
