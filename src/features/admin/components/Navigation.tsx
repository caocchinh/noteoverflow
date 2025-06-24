"use client";
import Link from "next/link";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { usePathname } from "next/navigation";

const Navigation = ({
  items,
  isOwner,
}: {
  items: Array<{ label: string; path: string; isOwnerNeeded: boolean }>;
  isOwner?: boolean;
}) => {
  const pathname = usePathname();
  return (
    <div className="flex items-center w-full h-max justify-start gap-4 mt-2 flex-wrap sm:flex-nowrap">
      <AnimatedBackground
        defaultValue={pathname}
        className=" border-logo-main border-b-2 w-full h-full"
        transition={{
          type: "spring",
          bounce: 0.1,
          duration: 0.3,
        }}
      >
        {items
          .filter((item) => !(item.isOwnerNeeded && !isOwner))
          .map((item) => (
            <Link
              href={item.path}
              title={item.label}
              data-id={pathname.includes(item.path) ? pathname : item.path}
              key={item.path}
              className="text-primary rounded-none p-2 bg-transparent shadow-none cursor-pointer hover:bg-transparent hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
      </AnimatedBackground>
    </div>
  );
};

export default Navigation;
