"use client";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import DockWrapper from "@/features/topical/components/DockWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";

const DesmosCalculator = dynamic(
  () => import("@/features/topical/components/DesmosCalculator"),
  {
    ssr: false,
  }
);

const TopicalContext = createContext<{
  isAppSidebarOpen: boolean;
  setIsAppSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export const useTopicalApp = () => {
  const context = useContext(TopicalContext);
  if (!context) {
    throw new Error("useTopicalApp must be used within TopicalLayoutProvider");
  }
  return context;
};

export default function TopicalLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(true);
  const isMobileDevice = useIsMobile();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const pathname = usePathname();
  return (
    <TopicalContext.Provider
      value={{
        isAppSidebarOpen,
        setIsAppSidebarOpen,
        isCalculatorOpen,
        setIsCalculatorOpen,
      }}
    >
      <DesmosCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
      <div>
        <div className="absolute left-0 w-full">
          <SidebarProvider
            onOpenChange={setIsAppSidebarOpen}
            open={isAppSidebarOpen && pathname === TOPICAL_QUESTION_APP_ROUTE}
          >
            {!isMobileDevice && (
              <Sidebar className="!bg-background !border-none !z-[-1]" />
            )}
            <SidebarInset className="relative w-full">
              <div className="absolute left-0 z-[1000] flex w-full items-start justify-center">
                <div className="fixed bottom-1">
                  <DockWrapper />
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>

        {children}
      </div>
    </TopicalContext.Provider>
  );
}
