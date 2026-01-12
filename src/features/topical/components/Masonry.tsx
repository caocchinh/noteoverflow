import { useTopicalApp } from "../context/TopicalLayoutProvider";
import {
  ReactNode,
  Children,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

const COLUMN_WIDTH = 260;
const COLUMN_GAP = 10;

export interface MasonryItem {
  /** The React element to render */
  element: ReactNode;
  /** Width of the item (for aspect ratio calculation) */
  width?: number;
  /** Height of the item (for aspect ratio calculation) */
  height?: number;
}

interface MasonryProps {
  children?: ReactNode;
  className?: string;
  /**
   * Optional array of items with dimensions for height-aware distribution.
   * When provided, uses "shortest column first" algorithm for optimal layout.
   * When omitted, falls back to round-robin horizontal distribution.
   */
  items?: MasonryItem[];
}

/**
 * Calculates actual column count based on container width.
 * Matches CSS columns behavior: fits as many columns as possible within the width.
 */
function calculateActualColumnCount(
  containerWidth: number,
  maxColumns: number
): number {
  if (containerWidth <= 0) return maxColumns;

  // CSS columns formula: how many columns of COLUMN_WIDTH + gaps fit?
  // Each column needs COLUMN_WIDTH, plus gap between columns
  const possibleColumns = Math.floor(
    (containerWidth + COLUMN_GAP) / (COLUMN_WIDTH + COLUMN_GAP)
  );

  return Math.max(1, Math.min(possibleColumns, maxColumns));
}

/**
 * Distributes items using "shortest column first" algorithm.
 * Places each item in the column with the smallest cumulative height.
 * Uses aspect ratio (height/width) for relative height since columns share the same width.
 */
function distributeByShortestColumn(
  items: MasonryItem[],
  columnCount: number
): ReactNode[] {
  if (columnCount <= 1 || items.length === 0) {
    return items.map((item) => item.element);
  }

  // Track cumulative relative height for each column
  const columnHeights: number[] = new Array(columnCount).fill(0);
  // Store items assigned to each column
  const columns: ReactNode[][] = Array.from({ length: columnCount }, () => []);

  items.forEach((item) => {
    // Find the column with the smallest height
    let shortestColumn = 0;
    let minHeight = columnHeights[0];
    for (let i = 1; i < columnCount; i++) {
      if (columnHeights[i] < minHeight) {
        minHeight = columnHeights[i];
        shortestColumn = i;
      }
    }

    // Add item to the shortest column
    columns[shortestColumn].push(item.element);

    // Update column height using aspect ratio (height/width gives relative height)
    // Default to 1:1 ratio if dimensions not provided
    const relativeHeight =
      item.width && item.height ? item.height / item.width : 1;
    columnHeights[shortestColumn] += relativeHeight;
  });

  // Flatten columns into a single array (column-major order for CSS columns)
  return columns.flat();
}

/**
 * Reorders children using round-robin for horizontal-first display in CSS columns.
 * Used as fallback when no item dimensions are provided.
 */
function reorderForHorizontalFlow(
  items: ReactNode[],
  columnCount: number
): ReactNode[] {
  if (columnCount <= 1 || items.length === 0) return items;

  const totalItems = items.length;
  const rowCount = Math.ceil(totalItems / columnCount);
  const reordered: ReactNode[] = new Array(totalItems);

  items.forEach((item, originalIndex) => {
    const row = Math.floor(originalIndex / columnCount);
    const col = originalIndex % columnCount;

    const fullColumns = totalItems % columnCount || columnCount;
    const itemsInThisColumn = col < fullColumns ? rowCount : rowCount - 1;

    let newIndex = 0;
    for (let c = 0; c < col; c++) {
      newIndex += c < fullColumns ? rowCount : rowCount - 1;
    }
    newIndex += Math.min(row, itemsInThisColumn - 1);

    if (newIndex < totalItems && row < itemsInThisColumn) {
      reordered[newIndex] = item;
    }
  });

  return reordered;
}

const Masonry = ({ children, items, className }: MasonryProps) => {
  const { uiPreferences } = useTopicalApp();
  const maxColumns = uiPreferences.numberOfColumns;
  const containerRef = useRef<HTMLDivElement>(null);
  const [actualColumnCount, setActualColumnCount] = useState(maxColumns);

  // Observe container width changes and recalculate column count
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateColumnCount = () => {
      const width = container.offsetWidth;
      const newColumnCount = calculateActualColumnCount(width, maxColumns);
      setActualColumnCount(newColumnCount);
    };

    // Initial calculation
    updateColumnCount();

    // Watch for resize
    const resizeObserver = new ResizeObserver(updateColumnCount);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [maxColumns]);

  const reorderedChildren = useMemo(() => {
    // If items with dimensions are provided, use shortest-column-first algorithm
    if (items && items.length > 0) {
      return distributeByShortestColumn(items, actualColumnCount);
    }
    // Otherwise, fall back to round-robin horizontal distribution
    const childArray = Children.toArray(children);
    return reorderForHorizontalFlow(childArray, actualColumnCount);
  }, [children, items, actualColumnCount]);

  return (
    <div
      className={className}
      ref={containerRef}
      style={{
        columnGap: `${COLUMN_GAP}px`,
        columnWidth: `${COLUMN_WIDTH}px`,
        columnCount: maxColumns,
        width: "100%",
      }}
    >
      {reorderedChildren}
    </div>
  );
};

export default Masonry;
