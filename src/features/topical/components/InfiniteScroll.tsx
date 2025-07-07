import { useCallback, useRef } from "react";

// Extend the IntersectionObserverInit interface to include scrollMargin
interface ExtendedIntersectionObserverInit extends IntersectionObserverInit {
  scrollMargin?: string;
}

interface InfiniteScrollProps {
  next: () => unknown;
  hasMore: boolean;
  root?: Element | Document | null;
  isLoading?: boolean;
}

export default function InfiniteScroll({
  next,
  hasMore,
  root = null,
  isLoading = false,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver>(null);

  const setObserverRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) {
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
          rootMargin: "800px",
          scrollMargin: "800px",
          threshold: 1,
        } as ExtendedIntersectionObserverInit
      );
      observerRef.current.observe(node);
    },
    [next, root, hasMore, isLoading]
  );

  return <div ref={setObserverRef} className="h-10 w-full bg-transparent" />;
}
