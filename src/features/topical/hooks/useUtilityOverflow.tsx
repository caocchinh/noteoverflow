import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  RefObject,
} from "react";
import { isOverScrolling } from "../lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface UtilityOverflowContextType {
  isUltilityOverflowingLeft: boolean;
  isUltilityOverflowingRight: boolean;
  overflowScrollHandler: () => void;
}

const UtilityOverflowContext = createContext<UtilityOverflowContextType | null>(
  null
);

export const UtilityOverflowProvider = ({
  children,
  sideBarInsetRef,
  ultilityRef,
}: {
  children: ReactNode;
  sideBarInsetRef: RefObject<HTMLDivElement | null>;
  ultilityRef: RefObject<HTMLDivElement | null>;
}) => {
  const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] =
    useState(false);
  const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] =
    useState(false);
  const isMobileDevice = useIsMobile();

  const overflowScrollHandler = useCallback(() => {
    const isOverScrollingResult = isOverScrolling({
      child: ultilityRef.current,
      parent: sideBarInsetRef.current,
      specialLeftCase: !isMobileDevice,
    });
    setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
    setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
  }, [isMobileDevice, sideBarInsetRef, ultilityRef]);

  return (
    <UtilityOverflowContext.Provider
      value={{
        isUltilityOverflowingLeft,
        isUltilityOverflowingRight,
        overflowScrollHandler,
      }}
    >
      {children}
    </UtilityOverflowContext.Provider>
  );
};

export const useUtilityOverflow = () => {
  const context = useContext(UtilityOverflowContext);
  if (!context) {
    throw new Error(
      "useUtilityOverflow must be used within UtilityOverflowProvider"
    );
  }
  return context;
};
