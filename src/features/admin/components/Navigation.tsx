'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/animated-background';

const Navigation = ({
  items,
  isOwner,
}: {
  items: Array<{ label: string; path: string; isOwnerNeeded: boolean }>;
  isOwner?: boolean;
}) => {
  const pathname = usePathname();
  return (
    <div className="mt-2 flex h-max w-full flex-wrap items-center justify-start gap-4 sm:flex-nowrap">
      <AnimatedBackground
        className=" h-full w-full border-logo-main border-b-2"
        defaultValue={pathname}
        transition={{
          type: 'spring',
          bounce: 0.1,
          duration: 0.3,
        }}
      >
        {items
          .filter((item) => !(item.isOwnerNeeded && !isOwner))
          .map((item) => (
            <Link
              className="cursor-pointer rounded-none bg-transparent p-2 text-primary shadow-none hover:bg-transparent hover:text-primary"
              data-id={pathname.includes(item.path) ? pathname : item.path}
              href={item.path}
              key={item.path}
              title={item.label}
            >
              {item.label}
            </Link>
          ))}
      </AnimatedBackground>
    </div>
  );
};

export default Navigation;
