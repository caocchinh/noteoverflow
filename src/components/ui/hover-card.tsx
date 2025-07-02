'use client';

import {
  Content as HoverCardPrimitiveContent,
  Portal as HoverCardPrimitivePortal,
  Root as HoverCardPrimitiveRoot,
  Trigger as HoverCardPrimitiveTrigger,
} from '@radix-ui/react-hover-card';

import { cn } from '@/lib/utils';

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitiveRoot>) {
  return <HoverCardPrimitiveRoot data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitiveTrigger>) {
  return (
    <HoverCardPrimitiveTrigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitiveContent>) {
  return (
    <HoverCardPrimitivePortal data-slot="hover-card-portal">
      <HoverCardPrimitiveContent
        align={align}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in',
          className
        )}
        data-slot="hover-card-content"
        sideOffset={sideOffset}
        {...props}
      />
    </HoverCardPrimitivePortal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
