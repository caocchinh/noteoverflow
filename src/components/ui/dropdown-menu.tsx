'use client';

import {
  CheckboxItem as DropDownMenuPrimitiveCheckboxItem,
  Content as DropDownMenuPrimitiveContent,
  Group as DropDownMenuPrimitiveGroup,
  Item as DropDownMenuPrimitiveItem,
  ItemIndicator as DropDownMenuPrimitiveItemIndicator,
  Label as DropDownMenuPrimitiveLabel,
  Portal as DropDownMenuPrimitivePortal,
  RadioGroup as DropDownMenuPrimitiveRadioGroup,
  RadioItem as DropDownMenuPrimitiveRadioItem,
  Root as DropDownMenuPrimitiveRoot,
  Separator as DropDownMenuPrimitiveSeparator,
  Sub as DropDownMenuPrimitiveSub,
  SubContent as DropDownMenuPrimitiveSubContent,
  SubTrigger as DropDownMenuPrimitiveSubTrigger,
  Trigger as DropDownMenuPrimitiveTrigger,
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, CircleIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveRoot>) {
  return <DropDownMenuPrimitiveRoot data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitivePortal>) {
  return (
    <DropDownMenuPrimitivePortal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveTrigger>) {
  return (
    <DropDownMenuPrimitiveTrigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveContent>) {
  return (
    <DropDownMenuPrimitivePortal>
      <DropDownMenuPrimitiveContent
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
          className
        )}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        {...props}
      />
    </DropDownMenuPrimitivePortal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveGroup>) {
  return (
    <DropDownMenuPrimitiveGroup data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveItem> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropDownMenuPrimitiveItem
      className={cn(
        "data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveCheckboxItem>) {
  return (
    <DropDownMenuPrimitiveCheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropDownMenuPrimitiveItemIndicator>
          <CheckIcon className="size-4" />
        </DropDownMenuPrimitiveItemIndicator>
      </span>
      {children}
    </DropDownMenuPrimitiveCheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveRadioGroup>) {
  return (
    <DropDownMenuPrimitiveRadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveRadioItem>) {
  return (
    <DropDownMenuPrimitiveRadioItem
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropDownMenuPrimitiveItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropDownMenuPrimitiveItemIndicator>
      </span>
      {children}
    </DropDownMenuPrimitiveRadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveLabel> & {
  inset?: boolean;
}) {
  return (
    <DropDownMenuPrimitiveLabel
      className={cn(
        'px-2 py-1.5 font-medium text-sm data-[inset]:pl-8',
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-label"
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveSeparator>) {
  return (
    <DropDownMenuPrimitiveSeparator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'ml-auto text-muted-foreground text-xs tracking-widest',
        className
      )}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveSub>) {
  return <DropDownMenuPrimitiveSub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveSubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropDownMenuPrimitiveSubTrigger
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[inset]:pl-8 data-[state=open]:text-accent-foreground',
        className
      )}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {children}
    </DropDownMenuPrimitiveSubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitiveSubContent>) {
  return (
    <DropDownMenuPrimitiveSubContent
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in',
        className
      )}
      data-slot="dropdown-menu-sub-content"
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
