"use client";

import {
  useContainerPosition,
  useMasonry,
  usePositioner,
  useResizeObserver,
  useScroller,
} from "masonic";
import { useRef } from "react";
import { motion } from "framer-motion";
import NextImage from "next/image";
import { useState } from "react";
import { COLUMN_WIDTHS } from "@/features/topical/constants/constants";
import { FilterData } from "@/features/topical/constants/types";
import { useWindowSize } from "@react-hook/window-size";

export default function MasonryGallery({
  items,
  columnCount,
  animationTrigger,
  currentQuery,
}: {
  items: any[];
  columnCount: number;
  animationTrigger: number;
  currentQuery: {
    curriculumId: string;
    subjectId: string;
  } & FilterData;
}) {
  const containerRef = useRef(null);
  const [windowWidth, height] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    height,
    animationTrigger,
  ]);
  const positioner = usePositioner(
    {
      width,
      columnGutter: 12,
      maxColumnCount: columnCount,
      columnWidth: COLUMN_WIDTHS[columnCount as keyof typeof COLUMN_WIDTHS],
    },
    [currentQuery]
  );
  const { scrollTop, isScrolling } = useScroller(offset);
  const resizeObserver = useResizeObserver(positioner);

  return useMasonry({
    resizeObserver,
    positioner,
    scrollTop,
    isScrolling,
    containerRef,
    items,
    overscanBy: 3,
    render: Item,
    height: Infinity,
  });
}

// Item component
const Item = ({ data }: { data: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      className="relative cursor-pointer"
      whileHover={{
        scale: 0.98,
        transition: {
          duration: 0.4,
          ease: [0.165, 0.84, 0.44, 1],
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NextImage
        alt="question"
        height={700}
        className="!w-max !h-max !max-w-full rounded-sm"
        key={data.questionImages[0].imageSrc}
        src={data.questionImages[0].imageSrc}
        width={280}
      />

      <motion.div
        className="absolute inset-0 rounded-sm bg-gradient-to-tr from-pink-500/30 to-sky-500/35"
        animate={{
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
