"use client";

import {
  memo,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Rnd } from "react-rnd";
// @ts-expect-error: desmos package has complex type definitions that conflict with TypeScript module resolution
import Desmos from "desmos";
import { cn } from "@/lib/utils";
import { Maximize, Shrink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

interface DesmosCalculatorProps {
  isOpen: boolean;
}

interface CalculatorProps {
  calculatorRef: React.RefObject<HTMLDivElement | null>;
}

const aspectRatio = 850 / 500;
const scaleFactor = 0.75;

// Create calculator element outside React's management to avoid cleanup issues
let calculatorElement: HTMLDivElement | null = null;
let isInitialized = false;

const getCalculatorElement = (
  calculatorRef: RefObject<HTMLDivElement | null>
) => {
  if (!calculatorElement) {
    calculatorElement = document.createElement("div");
    calculatorElement.className = "w-full h-full flex-1 border-0";
    calculatorRef.current = calculatorElement;
  }

  if (!isInitialized && calculatorElement) {
    Desmos.GraphingCalculator(calculatorElement);
    isInitialized = true;
  }

  return calculatorElement;
};

const Calculator = memo(({ calculatorRef }: CalculatorProps) => {
  getCalculatorElement(calculatorRef);
  return null;
});

Calculator.displayName = "Calculator";

const DesmosCalculator = ({ isOpen }: DesmosCalculatorProps) => {
  const { setIsCalculatorOpen } = useTopicalApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const draggableContainerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  // Function to calculate Rnd dimensions based on window size
  const getCalculatedDimensions = () => {
    const defaultDimensions = {
      x: 0,
      y: 0,
      width: Math.min(
        window.innerWidth * scaleFactor,
        window.innerHeight * scaleFactor * aspectRatio
      ),
      height: Math.min(
        window.innerHeight * scaleFactor,
        (window.innerWidth * scaleFactor) / aspectRatio
      ),
    };
    const minWidth = Math.min(
      window.innerWidth * (scaleFactor - 0.2),
      window.innerHeight * (scaleFactor - 0.2) * aspectRatio,
      300
    );
    const minHeight = Math.min(
      window.innerHeight * (scaleFactor - 0.2),
      (window.innerWidth * (scaleFactor - 0.2)) / aspectRatio,
      200
    );

    return {
      default: defaultDimensions,
      minWidth,
      minHeight,
    };
  };

  // State for Rnd component dimensions that need to be recalculated on window resize
  const [rndPosition, setRndPosition] = useState(() => ({
    x: getCalculatedDimensions().default.x,
    y: getCalculatedDimensions().default.y,
  }));
  const [rndSize, setRndSize] = useState(() => ({
    width: getCalculatedDimensions().default.width,
    height: getCalculatedDimensions().default.height,
  }));
  const [rndMinWidth, setRndMinWidth] = useState(
    () => getCalculatedDimensions().minWidth
  );
  const [rndMinHeight, setRndMinHeight] = useState(
    () => getCalculatedDimensions().minHeight
  );

  // Function to calculate Rnd dimensions based on window size
  const calculateRndDimensions = useCallback(() => {
    const dimensions = getCalculatedDimensions();
    setRndPosition({ x: dimensions.default.x, y: dimensions.default.y });
    setRndSize({
      width: dimensions.default.width,
      height: dimensions.default.height,
    });
    setRndMinWidth(dimensions.minWidth);
    setRndMinHeight(dimensions.minHeight);
  }, []);

  // Move calculator between containers when fullscreen state changes
  useEffect(() => {
    if (
      calculatorElement &&
      fullscreenContainerRef.current &&
      draggableContainerRef.current &&
      isOpen
    ) {
      const targetContainer = isFullscreen
        ? fullscreenContainerRef.current
        : draggableContainerRef.current;
      if (
        targetContainer &&
        calculatorElement.parentElement !== targetContainer
      ) {
        targetContainer.appendChild(calculatorElement);
      }
    }
  }, [isFullscreen, isOpen]);

  // Recalculate Rnd dimensions when window resizes
  useEffect(() => {
    const handleResize = () => {
      calculateRndDimensions();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateRndDimensions]);

  const toggleFullscreen = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsFullscreen(!isFullscreen);
    },
    [isFullscreen, setIsFullscreen]
  );

  const onClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsCalculatorOpen(false);
    },
    [setIsCalculatorOpen]
  );

  return (
    <>
      <div className={cn(isOpen ? "block" : "hidden")}>
        {/* Fullscreen container */}
        <div
          className={cn(
            "fixed inset-0 z-[999999] border border-gray-300 bg-white dark:bg-gray-800",
            isFullscreen ? "block" : "hidden"
          )}
          style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
        >
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between py-1 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Desmos Calculator
              </span>
              <div className="flex items-center gap-1">
                <Button
                  className="relative z-[999999]"
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  title="Exit Fullscreen"
                >
                  <Shrink />
                </Button>
                <Button
                  className="relative z-[999999]"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  title="Close Calculator"
                >
                  <X />
                </Button>
              </div>
            </div>
            {/* Calculator container */}
            <div ref={fullscreenContainerRef} className="flex-1">
              {isFullscreen && isOpen && (
                <Calculator calculatorRef={calculatorRef} />
              )}
            </div>
          </div>
        </div>

        {/* Draggable container */}
        <div className={cn(isFullscreen ? "hidden" : "block")}>
          <Rnd
            position={rndPosition}
            size={rndSize}
            minWidth={rndMinWidth}
            minHeight={rndMinHeight}
            bounds="window"
            className="z-[999999] border border-gray-300 rounded-t-lg shadow-2xl bg-white dark:bg-gray-800"
            dragHandleClassName="calculator-drag-handle"
            onDragStop={(e, d) => {
              setRndPosition({ x: d.x, y: d.y });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setRndPosition(position);
              setRndSize({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              });
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between py-1 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg calculator-drag-handle cursor-move">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Desmos Calculator
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    className="relative z-[999999]"
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    title="Enter Fullscreen"
                  >
                    <Maximize />
                  </Button>
                  <Button
                    className="relative z-[999999]"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    title="Close Calculator"
                  >
                    <X />
                  </Button>
                </div>
              </div>
              <div ref={draggableContainerRef} className="flex-1">
                {!isFullscreen && isOpen && (
                  <Calculator calculatorRef={calculatorRef} />
                )}
              </div>
            </div>
          </Rnd>
        </div>
      </div>
    </>
  );
};

export default DesmosCalculator;
