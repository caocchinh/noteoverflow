'use client';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { TOPICAL_QUESTION_APP_ROUTE } from '@/constants/constants';
import DockWrapper from '@/features/topical/components/DockWrapper';
import { useIsMobile } from '@/hooks/use-mobile';

const SidebarContext = createContext<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
} | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export default function TopicalLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobileDevice = useIsMobile();
  const pathname = usePathname();
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      <div>
        <div className="absolute left-0 w-full">
          <SidebarProvider
            onOpenChange={setIsSidebarOpen}
            open={isSidebarOpen && pathname === TOPICAL_QUESTION_APP_ROUTE}
          >
            {!isMobileDevice && (
              <Sidebar className="!bg-transparent !border-none !z-[-1] " />
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
    </SidebarContext.Provider>
  );
}
