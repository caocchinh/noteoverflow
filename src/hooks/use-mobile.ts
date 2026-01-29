import { useSyncExternalStore } from "react";

export function useIsMobile({
  breakpoint = 768,
}: {
  breakpoint?: number;
} = {}) {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };

  const getSnapshot = () => window.innerWidth < breakpoint;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
