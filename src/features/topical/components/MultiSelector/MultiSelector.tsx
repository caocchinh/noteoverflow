"use client";

import { memo, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  MultiSelectorListRef,
  MultiSelectorProps,
  MultiSelectorSharedProps,
} from "../../constants/types";
import MultiSelectorContent from "./MultiSelectorContent";
import MultiSelectorTrigger from "./MultiSelectorTrigger";
import {
  MultiSelectorDesktoptUltilityButtons,
  MultiSelectorMobiletUltilityButtons,
} from "./MultiSelectUltilityButtons";
import MultiSelectorList from "./MultiSelectorList";

const MultiSelector = memo(
  ({
    label,
    selectedValues,
    maxLength = undefined,
    onValuesChange: onValueChange,
    allAvailableOptions,
  }: MultiSelectorProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isMobileDevice = useIsMobile();
    if (
      maxLength !== undefined &&
      typeof maxLength == "number" &&
      maxLength <= 0
    ) {
      throw new Error("maxLength must be greater than 0");
    }

    const onValueChangeHandler = useCallback(
      (val: string | string[]) => {
        if (typeof val === "string") {
          if (selectedValues.includes(val)) {
            onValueChange(selectedValues.filter((item) => item !== val));
          } else {
            onValueChange([...selectedValues, val]);
          }
        } else {
          onValueChange(val);
        }
      },
      [selectedValues, onValueChange]
    );

    const sharedProps: MultiSelectorSharedProps = {
      selectedValues,
      onValueChange: onValueChangeHandler,
      allAvailableOptions,
      label,
      maxLength,
      inputRef,
    };

    return (
      <>
        {isMobileDevice ? (
          <MobileMultiSelector {...sharedProps} />
        ) : (
          <DesktopMultiSelector {...sharedProps} />
        )}
      </>
    );
  }
);

MultiSelector.displayName = "MultiSelector";

export default MultiSelector;

// Shared error message component
const MaxLengthErrorMessage = memo(
  ({ maxLength, label }: { maxLength: number; label: string }) => (
    <h3 className="w-max font-medium text-sm text-destructive mt-1">
      You can only select up to {maxLength}{" "}
      {label.toLowerCase() + (label.toLowerCase() === "topic" ? "s" : "")}
    </h3>
  )
);

MaxLengthErrorMessage.displayName = "MaxLengthErrorMessage";

const MobileMultiSelector = memo(
  ({
    selectedValues,
    onValueChange,
    allAvailableOptions,
    label,
    maxLength,
    inputRef,
  }: MultiSelectorSharedProps) => {
    const multiSelectorListRef = useRef<MultiSelectorListRef | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    return (
      <>
        <MultiSelectorTrigger
          selectedValues={selectedValues}
          onValueChange={onValueChange}
          open={open}
          setOpen={setOpen}
          allAvailableOptions={allAvailableOptions}
          label={label}
          setInputValue={multiSelectorListRef.current?.setInputValue}
          maxLength={maxLength}
        />
        {maxLength && selectedValues.length > maxLength && (
          <MaxLengthErrorMessage maxLength={maxLength} label={label} />
        )}
        <Drawer onOpenChange={setOpen} open={open} autoFocus={false}>
          <DrawerContent
            autoFocus={false}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            className="z-[100007] h-[95vh] max-h-[95vh] dark:bg-accent"
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Select</DrawerTitle>
              <DrawerDescription />
              Select {label}
            </DrawerHeader>
            <div className="w-full pt-2 pb-4">
              <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
            </div>
            {maxLength && selectedValues.length > maxLength && (
              <h3 className="w-max font-medium text-sm text-destructive mx-auto -mt-1">
                You can only select up to {maxLength}{" "}
                {label.toLowerCase() +
                  (label.toLowerCase() === "topic" ? "s" : "")}
              </h3>
            )}
            <MultiSelectorMobiletUltilityButtons
              maxLength={maxLength}
              setOpen={setOpen}
              onDeleteAll={() => {
                onValueChange([]);
              }}
              onSelectAll={() => {
                onValueChange(allAvailableOptions);
              }}
            />
            <MultiSelectorContent
              open={open}
              setOpen={setOpen}
              inputRef={inputRef}
              multiSelectorListRef={multiSelectorListRef}
            >
              <MultiSelectorList
                ref={multiSelectorListRef}
                selectedValues={selectedValues}
                onValueChange={onValueChange}
                inputRef={inputRef}
                label={label}
                allAvailableOptions={allAvailableOptions}
                setOpen={setOpen}
                maxLength={maxLength}
              />
            </MultiSelectorContent>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
);

MobileMultiSelector.displayName = "MobileMultiSelector";

const DesktopMultiSelector = memo(
  ({
    selectedValues,
    onValueChange,
    allAvailableOptions,
    label,
    maxLength,
    inputRef,
  }: MultiSelectorSharedProps) => {
    const multiSelectorListRef = useRef<MultiSelectorListRef | null>(null);
    const popoverTriggerRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState<boolean>(false);
    return (
      <Popover modal={false} open={open}>
        <PopoverTrigger asChild>
          <div ref={popoverTriggerRef}>
            <MultiSelectorTrigger
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              open={open}
              setOpen={setOpen}
              allAvailableOptions={allAvailableOptions}
              label={label}
              setInputValue={multiSelectorListRef.current?.setInputValue}
              maxLength={maxLength}
            />
            {maxLength && selectedValues.length > maxLength && (
              <MaxLengthErrorMessage maxLength={maxLength} label={label} />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          autoFocus={false}
          className="z-[100007] m-0 border-1 p-0 shadow-none dark:bg-accent"
          side="right"
          onInteractOutside={(e) => {
            if (popoverTriggerRef?.current?.contains(e.target as Node)) {
              return;
            }
            multiSelectorListRef.current?.setInputValue("");
            setOpen(false);
          }}
        >
          <MultiSelectorContent
            open={open}
            setOpen={setOpen}
            inputRef={inputRef}
            multiSelectorListRef={multiSelectorListRef}
          >
            <MultiSelectorList
              ref={multiSelectorListRef}
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              inputRef={inputRef}
              label={label}
              allAvailableOptions={allAvailableOptions}
              setOpen={setOpen}
              maxLength={maxLength}
            />
          </MultiSelectorContent>
          <MultiSelectorDesktoptUltilityButtons
            maxLength={maxLength}
            onDeleteAll={() => {
              onValueChange([]);
            }}
            onSelectAll={() => {
              onValueChange(allAvailableOptions);
            }}
          />
          <div className="m-2">
            <Button
              className="w-full cursor-pointer h-[30px]"
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

DesktopMultiSelector.displayName = "DesktopMultiSelector";
