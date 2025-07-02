import { useEffect, useState } from 'react';

export function useIsMobile({
  breakpoint = 768,
}: {
  breakpoint?: number;
} = {}) {
  const MOBILE_BREAKPOINT = breakpoint;

  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, [MOBILE_BREAKPOINT]);

  return !!isMobile;
}
