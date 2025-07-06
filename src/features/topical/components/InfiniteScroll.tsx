import { useCallback, useEffect, useRef } from "react";

interface InfiniteScrollProps {
  next: () => unknown;
  hasMore: boolean;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  children?: React.ReactNode;
}

export default function InfiniteScroll({
  next,
  hasMore,
  threshold = 1,
  root = null,
  rootMargin = "200px",
  children,
}: InfiniteScrollProps) {
  const observedElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore) {
            next();
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );
    if (observedElementRef.current) {
      observer.observe(observedElementRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [next, root, rootMargin, threshold, hasMore]);

  return (
    <div
      className="flex flex-row flex-wrap items-center justify-center gap-4"
      ref={observedElementRef}
    >
      {children}
    </div>
  );
}
