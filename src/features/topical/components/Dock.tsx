"use client";

import {
  AnimatePresence,
  type MotionValue,
  motion,
  type SpringOptions,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  backgroundColor?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  backgroundColor?: string;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  backgroundColor?: string;
};

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  backgroundColor,
  magnification,
  baseItemSize,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      aria-haspopup="true"
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center rounded-md border-1 border-neutral-700 bg-[#060010] shadow-md dark:bg-white",
        className,
        backgroundColor
      )}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onFocus={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onHoverStart={() => isHovered.set(1)}
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      tabIndex={0}
    >
      {Children.map(children, (child) =>
        cloneElement(
          child as React.ReactElement<{ isHovered: MotionValue<number> }>,
          { isHovered }
        )
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
  backgroundColor?: string;
};

function DockLabel({
  children,
  className = "",
  isHovered,
  backgroundColor,
}: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      return;
    }
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1, y: -10 }}
          className={cn(
            className,
            "-top-6 absolute left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-white text-xs",
            backgroundColor
          )}
          exit={{ opacity: 0, y: 0 }}
          initial={{ opacity: 0, y: 0 }}
          role="tooltip"
          style={{ x: "-50%" }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = "" }: DockIconProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
}: DockProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      className="mx-2 flex max-w-full items-center"
      style={{ height, scrollbarWidth: "none" }}
    >
      <motion.div
        aria-label="Application dock"
        className={`${className} -translate-x-1/2 absolute bottom-2 left-1/2 flex w-fit transform items-end gap-4 rounded-md border-1 border-neutral-700 bg-background px-4 pb-2`}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Number.POSITIVE_INFINITY);
        }}
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        role="toolbar"
        style={{ height: panelHeight }}
      >
        {items.map((item, index) => (
          <DockItem
            backgroundColor={item.backgroundColor}
            baseItemSize={baseItemSize}
            className={item.className}
            distance={distance}
            key={index}
            magnification={magnification}
            mouseX={mouseX}
            onClick={item.onClick}
            spring={spring}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel backgroundColor={item.backgroundColor}>
              {item.label}
            </DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
