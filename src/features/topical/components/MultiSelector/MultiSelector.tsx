"use client";

import { Button } from "@/components/ui/button";
import { memo, useCallback, useRef, useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

import MultiSelectorContent from "./MultiSelectorContent";
import MultiSelectorList from "./MultiSelectorList";
import MultiSelectorTrigger from "./MultiSelectorTrigger";
import {
  MultiSelectorDesktoptUltilityButtons,
  MultiSelectorMobiletUltilityButtons,
} from "./MultiSelectUltilityButtons";
import { MultiSelectorListRef, MultiSelectorProps, MultiSelectorSharedProps } from "./selectors";

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
    if (maxLength !== undefined && typeof maxLength == "number" && maxLength <= 0) {
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
      [selectedValues, onValueChange],
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
  },
);

MultiSelector.displayName = "MultiSelector";

export default MultiSelector;

// Shared error message component
const MaxLengthErrorMessage = memo(({ maxLength, label }: { maxLength: number; label: string }) => (
  <h3 className="text-destructive mt-1 w-max text-sm font-medium">
    You can only select up to {maxLength}{" "}
    {label.toLowerCase() + (label.toLowerCase() === "topic" ? "s" : "")}
  </h3>
));

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

    const handleSetInputValue = useCallback((val: string | ((prev: string) => string)) => {
      multiSelectorListRef.current?.setInputValue(val);
    }, []);

    return (
      <>
        <MultiSelectorTrigger
          selectedValues={selectedValues}
          onValueChange={onValueChange}
          open={open}
          setOpen={setOpen}
          allAvailableOptions={allAvailableOptions}
          label={label}
          setInputValue={handleSetInputValue}
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
            className="dark:bg-accent z-100011 h-[95vh] max-h-[95vh]"
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
              <h3 className="text-destructive mx-auto -mt-1 w-max text-sm font-medium">
                You can only select up to {maxLength}{" "}
                {label.toLowerCase() + (label.toLowerCase() === "topic" ? "s" : "")}
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
  },
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
    const popoverContentRef = useRef<HTMLDivElement | null>(null);
    const popoverTriggerRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    const handleSetInputValue = useCallback((val: string | ((prev: string) => string)) => {
      multiSelectorListRef.current?.setInputValue(val);
    }, []);

    return (
      <Popover modal={false} open={open}>
        <PopoverTrigger asChild className="w-full">
          <div ref={popoverTriggerRef}>
            <MultiSelectorTrigger
              selectedValues={selectedValues}
              onValueChange={onValueChange}
              open={open}
              setOpen={setOpen}
              allAvailableOptions={allAvailableOptions}
              label={label}
              setInputValue={handleSetInputValue}
              maxLength={maxLength}
            />
            {maxLength && selectedValues.length > maxLength && (
              <MaxLengthErrorMessage maxLength={maxLength} label={label} />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          ref={popoverContentRef}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          autoFocus={false}
          className="dark:bg-accent z-100007 m-0 border p-0 shadow-none"
          side="right"
          onWheel={(e) => e.stopPropagation()}
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
              className="h-[30px] w-full cursor-pointer"
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
  },
);

DesktopMultiSelector.displayName = "DesktopMultiSelector";
