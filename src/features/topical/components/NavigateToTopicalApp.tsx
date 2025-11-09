import { Button } from "@/components/ui/button";
import { ScanText } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface NavigateToTopicalAppProps {
  children: ReactNode;
}

const NavigateToTopicalApp = ({ children }: NavigateToTopicalAppProps) => {
  return (
    <Button className="!bg-logo-main !text-white" asChild>
      <Link href="/topical" className="w-[250px]" prefetch={false}>
        {children}
        <ScanText />
      </Link>
    </Button>
  );
};

export default NavigateToTopicalApp;
