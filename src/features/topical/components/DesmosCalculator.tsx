"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
// @ts-expect-error: desmos package has complex type definitions that conflict with TypeScript module resolution
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Desmos from "desmos";
import { Maximize, Shrink, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

interface DesmosCalculatorProps {
  isOpen: boolean;
}

const aspectRatio = 850 / 500;
const scaleFactor = 0.75;

// Create calculator element outside React's management to avoid cleanup issues
let calculatorElement: HTMLDivElement | null = null;

const initCalculatorElement = () => {
  if (!calculatorElement) {
    calculatorElement = document.createElement("div");
    calculatorElement.className = "w-full h-full flex-1 border-0";
    Desmos.GraphingCalculator(calculatorElement);
  }
};

const DesmosCalculator = memo(({ isOpen }: DesmosCalculatorProps) => {
  const { setIsCalculatorOpen } = useTopicalApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenContainer, setFullscreenContainer] = useState<HTMLDivElement | null>(null);
  const [draggableContainer, setDraggableContainer] = useState<HTMLDivElement | null>(null);

  // Function to calculate Rnd dimensions based on window size
  const getCalculatedDimensions = () => {
    const defaultDimensions = {
      x: 0,
      y: 0,
      width: Math.min(
        window.innerWidth * scaleFactor,
        window.innerHeight * scaleFactor * aspectRatio,
      ),
      height: Math.min(
        window.innerHeight * scaleFactor,
        (window.innerWidth * scaleFactor) / aspectRatio,
      ),
    };
    const minWidth = Math.min(
      window.innerWidth * (scaleFactor - 0.2),
      window.innerHeight * (scaleFactor - 0.2) * aspectRatio,
      300,
    );
    const minHeight = Math.min(
      window.innerHeight * (scaleFactor - 0.2),
      (window.innerWidth * (scaleFactor - 0.2)) / aspectRatio,
      200,
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
  const [rndMinWidth, setRndMinWidth] = useState(() => getCalculatedDimensions().minWidth);
  const [rndMinHeight, setRndMinHeight] = useState(() => getCalculatedDimensions().minHeight);

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
      e.stopPropagation();
      setIsFullscreen(!isFullscreen);
    },
    [isFullscreen, setIsFullscreen],
  );

  const onClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsCalculatorOpen(false);
    },
    [setIsCalculatorOpen],
  );

  useEffect(() => {
    if (!calculatorElement) {
      initCalculatorElement();
    }
  }, []);

  return (
    <>
      <div className={cn(isOpen ? "block" : "hidden")}>
        {/* Fullscreen container */}
        <div
          className={cn(
            "fixed inset-0 z-999999 border border-gray-300 bg-gray-800",
            isFullscreen ? "block" : "hidden",
          )}
          style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
        >
          <div className="flex h-full flex-col">
            {/* Header with close button */}
            <div className="flex h-[40px] items-center justify-between border-b border-gray-700 bg-gray-700 px-2 py-1">
              <span className="text-sm font-medium text-gray-300">Desmos Calculator</span>
              <div className="flex items-center gap-1">
                <Button
                  className="!hover:text-black relative z-999999 cursor-pointer text-white dark:text-white"
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  title="Exit Fullscreen"
                >
                  <Shrink />
                </Button>
                <Button
                  className="!hover:text-black relative z-999999 cursor-pointer text-white dark:text-white"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  title="Close Calculator"
                >
                  <X />
                </Button>
              </div>
            </div>
            <div ref={setFullscreenContainer} className="flex-1"></div>
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
            className="z-999999 rounded-t-lg border border-gray-300 bg-gray-800 shadow-2xl"
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
            <div className="flex h-full flex-col">
              {/* Header with close button */}
              <div className="flex items-center justify-between rounded-t-lg border-b border-gray-700 bg-gray-700 px-2">
                <span className="calculator-drag-handle flex min-h-[50px] flex-1 cursor-move items-center py-1 text-sm font-medium text-gray-300">
                  Desmos Calculator
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    className="!hover:text-black relative z-999999 cursor-pointer text-white dark:text-white"
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    title="Enter Fullscreen"
                  >
                    <Maximize />
                  </Button>
                  <Button
                    className="!hover:text-black relative z-999999 cursor-pointer text-white dark:text-white"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    title="Close Calculator"
                  >
                    <X />
                  </Button>
                </div>
              </div>
              <div ref={setDraggableContainer} className="flex-1"></div>
            </div>
          </Rnd>
        </div>
      </div>
      {fullscreenContainer &&
        draggableContainer &&
        createPortal(
          <div
            ref={(node) => {
              if (node && calculatorElement) {
                node.appendChild(calculatorElement);
              }
            }}
            className="h-full w-full"
          />,
          isFullscreen ? fullscreenContainer : draggableContainer,
        )}
    </>
  );
});

DesmosCalculator.displayName = "DesmosCalculator";
export default DesmosCalculator;
