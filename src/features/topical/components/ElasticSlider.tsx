import React, { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import {
  DEFAULT_NUMBER_OF_COLUMNS,
  FILTERS_CACHE_KEY,
} from "../constants/constants";
import { FiltersCache } from "../constants/types";
import { Button } from "@/components/ui/button";
import { SquareMinus, SquarePlus } from "lucide-react";

const MAX_OVERFLOW = 30;

interface ElasticSliderProps {
  startingValue?: number;
  maxValue?: number;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  setColumnsProp: (value: number) => void;
}

const ElasticSlider: React.FC<ElasticSliderProps> = ({
  startingValue = 0,
  maxValue = 100,
  className = "",
  isStepped = false,
  stepSize = 1,
  setColumnsProp,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 w-48 ${className}`}
    >
      <Slider
        startingValue={startingValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        setColumnsProp={setColumnsProp}
      />
    </div>
  );
};

interface SliderProps {
  startingValue: number;
  maxValue: number;
  isStepped: boolean;
  stepSize: number;
  setColumnsProp: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  startingValue,
  maxValue,
  isStepped,
  stepSize,
  setColumnsProp,
}) => {
  const [numberOfColumnsSliderValue, setNumberOfColumnsSliderValue] = useState<
    number | null
  >(null);

  const [numberOfColumns, setNumberOfColumns] = useState<number | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<"left" | "middle" | "right">("middle");
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);
  const isMounted = useRef(false);

  useEffect(() => {
    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    if (savedState) {
      const parsedState: FiltersCache = JSON.parse(savedState);
      setNumberOfColumns(
        parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
      );
      setNumberOfColumnsSliderValue(
        parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
      );
      setColumnsProp(parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS);
    }
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, [setColumnsProp]);

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }
    setColumnsProp(numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS);
    const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
    let stateToSave: FiltersCache = existingStateJSON
      ? JSON.parse(existingStateJSON)
      : { filters: {} };

    stateToSave = {
      ...stateToSave,
      numberOfColumns: numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS,
    };
    localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
  }, [numberOfColumns, setColumnsProp]);

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
        startingValue +
        ((e.clientX - left) / width) * (maxValue - startingValue);
      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }
      newValue = Math.min(Math.max(newValue, startingValue), maxValue);
      setNumberOfColumnsSliderValue(newValue);
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
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;
    return (
      ((numberOfColumnsSliderValue ??
        DEFAULT_NUMBER_OF_COLUMNS - startingValue) /
        totalRange) *
      100
    );
  };

  return (
    <>
      <motion.div
        onHoverStart={() => animate(scale, 1.2)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.2)}
        onTouchEnd={() => animate(scale, 1)}
        style={{
          scale,
          opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
        }}
        className="flex w-full touch-none select-none items-center justify-center gap-4"
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
            if (
              numberOfColumnsSliderValue &&
              numberOfColumnsSliderValue > startingValue
            ) {
              setNumberOfColumnsSliderValue(numberOfColumnsSliderValue - 1);
            }
          }}
          className="cursor-pointer"
        >
          <SquareMinus />
        </motion.div>

        <div
          ref={sliderRef}
          className="relative flex w-full max-w-xs flex-grow cursor-grab touch-none select-none items-center py-4"
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
            if (
              numberOfColumnsSliderValue &&
              numberOfColumnsSliderValue < maxValue
            ) {
              setNumberOfColumnsSliderValue(numberOfColumnsSliderValue + 1);
            }
          }}
        >
          <SquarePlus />
        </motion.div>
      </motion.div>
      <p className="absolute text-foreground transform -translate-y-11 text-md font-medium tracking-wide">
        {Math.round(numberOfColumnsSliderValue ?? DEFAULT_NUMBER_OF_COLUMNS)}
      </p>
      <Button
        className="w-full cursor-pointer"
        variant="outline"
        onClick={() => {
          setNumberOfColumns(numberOfColumnsSliderValue);
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
