'use client';

import {
  Root as SwitchPrimitiveRoot,
  Thumb as SwitchPrimitiveThumb,
} from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitiveRoot>) {
  return (
    <SwitchPrimitiveRoot
      className={cn(
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-logo-main data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        className
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitiveThumb
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-foreground'
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitiveRoot>
  );
}

export { Switch };
