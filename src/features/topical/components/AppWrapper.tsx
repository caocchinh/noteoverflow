"use client";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={cn(pathname !== TOPICAL_QUESTION_APP_ROUTE && "hidden", "w-full")}>
      {children}
    </div>
  );
}
