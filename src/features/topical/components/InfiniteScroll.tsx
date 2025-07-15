import { useCallback, useRef } from "react";
import {
  ExtendedIntersectionObserverInit,
  InfiniteScrollProps,
} from "../constants/types";

export default function InfiniteScroll({
  next,
  hasMore,
  root = null,
  isLoading = false,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver>(null);

  const setObserverRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || typeof window === "undefined") {
        return;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (!node) {
        return;
      }
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && hasMore) {
              next();
            }
          });
        },
        {
          root,
          rootMargin: `${window.outerHeight * 2}px`,
          scrollMargin: `${window.outerHeight * 2}px`,
          threshold: 1,
        } as ExtendedIntersectionObserverInit
      );
      observerRef.current.observe(node);
    },
    [next, root, hasMore, isLoading]
  );

  return <div ref={setObserverRef} className="h-10 w-full bg-transparent" />;
}
