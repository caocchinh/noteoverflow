"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
// @ts-expect-error: desmos package has complex type definitions that conflict with TypeScript module resolution
import Desmos from "desmos";
import { cn } from "@/lib/utils";

interface DesmosCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalculatorProps {
  calculatorRef: React.RefObject<HTMLDivElement | null>;
}

const Calculator = memo(({ calculatorRef }: CalculatorProps) => {
  console.log("calculatorRef", calculatorRef);
  return (
    <div
      ref={(element) => {
        if (element && !element.hasAttribute("data-initialized")) {
          calculatorRef.current = element;
          Desmos.GraphingCalculator(element);
          element.setAttribute("data-initialized", "true");
        }
      }}
      className="w-full h-full flex-1 border-0"
    />
  );
});

Calculator.displayName = "Calculator";

const DesmosCalculator = ({ isOpen, onClose }: DesmosCalculatorProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const draggableContainerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Stupid hack to get the calculator to work in the fullscreen container but it works 😭😭, everytime the DesmosCalculator rerender due to the prop isOpen, the DesmosCalculator component is removed from the DOM and then added back in, however Calculator is a memo component and it will not rerender if the prop is the same, so we need to manually add the calculator to the correct container.
  useEffect(() => {
    if (
      calculatorRef.current &&
      fullscreenContainerRef.current &&
      draggableContainerRef.current
    ) {
      const targetContainer = isFullscreen
        ? fullscreenContainerRef.current
        : draggableContainerRef.current;
      if (
        targetContainer &&
        calculatorRef.current.parentElement !== targetContainer
      ) {
        targetContainer.appendChild(calculatorRef.current);
      }
    }
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

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
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Desmos Calculator
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleFullscreen}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Exit Fullscreen"
                >
                  ▫️
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Calculator portal target */}
            <div ref={fullscreenContainerRef} className="flex-1" />
          </div>
        </div>

        {/* Draggable container */}
        <div className={cn(isFullscreen ? "hidden" : "block")}>
          <Rnd
            default={{
              x: window.innerWidth - 850,
              y: 100,
              width: 850,
              height: 500,
            }}
            minWidth={400}
            minHeight={300}
            bounds="window"
            className="z-[999999] border border-gray-300 rounded-lg shadow-2xl bg-white dark:bg-gray-800"
            dragHandleClassName="calculator-drag-handle"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg calculator-drag-handle cursor-move">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Desmos Calculator
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleFullscreen}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Enter Fullscreen"
                  >
                    ▢
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div ref={draggableContainerRef} className="flex-1" />
            </div>
          </Rnd>
        </div>
      </div>
      <Calculator calculatorRef={calculatorRef} />
    </>
  );
};

export default DesmosCalculator;
