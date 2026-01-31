import { Button } from "@/components/ui/button";
import { ScanText } from "lucide-react";
import Link from "next/link";
import { ReactNode, memo } from "react";

interface NavigateToTopicalAppProps {
  children: ReactNode;
}

const NavigateToTopicalApp = memo(({ children }: NavigateToTopicalAppProps) => {
  return (
    <Button className="bg-logo-main! text-white!" asChild>
      <Link href="/topical" className="w-[250px]" prefetch={false}>
        {children}
        <ScanText />
      </Link>
    </Button>
  );
});

NavigateToTopicalApp.displayName = "NavigateToTopicalApp";

export default NavigateToTopicalApp;
