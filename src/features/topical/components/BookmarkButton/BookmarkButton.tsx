import React, { useCallback, useRef, memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BookmarkButtonProps,
  BookmarkButtonSharedProps,
  BookmarkListRef,
} from "../../constants/types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useAuth } from "@/context/AuthContext";
import { BookmarkTrigger } from "./BookmarkTrigger";
import { BookmarkList } from "./BookmarkList";
import BookmarkContent from "./BookmarkContent";

export const BookmarkButton = memo(
  ({
    question,
    isBookmarkDisabled,
    isPopoverOpen: openProp,
    setIsPopoverOpen: setOpenProp,
    setIsHovering,
    setShouldOpen,
    popOverAlign = "end",
    listId,
    badgeClassName,
    popOverTriggerClassName,
    triggerButtonClassName,
    isInView,
    isAnnotationGuardDialogOpen,
    setIsAnnotationGuardDialogOpen,
    isHavingUnsafeChangesRef,
  }: BookmarkButtonProps) => {
    const [_open, _setOpen] = useState(false);
    const open = openProp ?? _open;
    const { savedActivitiesIsLoading, savedActivitiesIsError } =
      useTopicalApp();
    const { isAuthenticated } = useAuth();
    const isMobileDevice = useIsMobile();

    const handleOpenChange = useCallback(
      (value: boolean | ((prev: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value;

        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpen(newOpenState);
        }
        if (setIsHovering && !newOpenState) {
          setIsHovering(false);
        }
        if (setShouldOpen && !newOpenState) {
          setShouldOpen(false);
        }
      },
      [open, setOpenProp, setIsHovering, setShouldOpen]
    );

    const openUI = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBookmarkDisabled || savedActivitiesIsLoading) {
          return;
        }
        if (savedActivitiesIsError) {
          toast.error("Bookmark error. Please refresh the page.", {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          });
          return;
        }
        if (!isAuthenticated) {
          toast.error("Please sign in to bookmark questions.", {
            duration: 2000,
            position: isMobileDevice && open ? "top-center" : "bottom-right",
          });
          return;
        }
        handleOpenChange(true);
      },
      [
        isBookmarkDisabled,
        savedActivitiesIsLoading,
        savedActivitiesIsError,
        isAuthenticated,
        handleOpenChange,
        isMobileDevice,
        open,
      ]
    );

    if (!isInView) {
      return null;
    }

    const sharedProps: BookmarkButtonSharedProps = {
      question,
      isBookmarkDisabled,
      badgeClassName,
      triggerButtonClassName,
      popOverTriggerClassName,
      popOverAlign,
      listId,
      open,
      handleOpenChange,
      setIsHovering,
      setShouldOpen,
      openUI,
      isAnnotationGuardDialogOpen,
      setIsAnnotationGuardDialogOpen,
      isHavingUnsafeChangesRef,
    };

    return (
      <>
        {isMobileDevice ? (
          <MobileBookmarkButton {...sharedProps} />
        ) : (
          <DesktopBookmarkButton {...sharedProps} />
        )}
      </>
    );
  }
);

BookmarkButton.displayName = "BookmarkButton";

const MobileBookmarkButton = memo(
  ({
    question,
    isBookmarkDisabled,
    badgeClassName,
    triggerButtonClassName,
    open,
    handleOpenChange,
    setIsHovering,
    setShouldOpen,
    openUI,
    listId,
    isAnnotationGuardDialogOpen,
    setIsAnnotationGuardDialogOpen,
    isHavingUnsafeChangesRef,
  }: BookmarkButtonSharedProps) => {
    const bookmarkListRef = useRef<BookmarkListRef | null>(null);
    return (
      <BookmarkContent
        bookmarkListRef={bookmarkListRef}
        open={open}
        handleOpenChange={handleOpenChange}
        setIsHovering={setIsHovering}
        setShouldOpen={setShouldOpen}
      >
        <Drawer
          autoFocus={false}
          onOpenChange={(open) => {
            handleOpenChange(open);
          }}
          open={open}
        >
          <DrawerTrigger
            asChild
            onClick={(e) => {
              openUI(e);
            }}
          >
            <BookmarkTrigger
              question={question}
              isBookmarkDisabled={isBookmarkDisabled}
              badgeClassName={badgeClassName}
              triggerButtonClassName={triggerButtonClassName}
            />
          </DrawerTrigger>
          <DrawerContent
            className="z-100009 h-[95vh] max-h-[95vh] dark:bg-accent"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            onInteractOutside={() => {
              bookmarkListRef.current?.setSearchInput("");
              handleOpenChange(false);
            }}
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Select</DrawerTitle>
              <DrawerDescription />
              Save to book mark list
            </DrawerHeader>
            <div className="w-full pt-2 pb-4">
              <div className="mx-auto hidden h-2 w-[100px] shrink-0 rounded-full bg-black pt-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
            </div>

            <div className="flex flex-row gap-3 p-2 ">
              <Button
                className="flex-1/3 cursor-pointer mb-4"
                onClick={() => {
                  handleOpenChange(false);
                }}
                variant="outline"
              >
                Close
                <X className="h-4 w-4" />
              </Button>
            </div>
            <BookmarkList
              setOpen={handleOpenChange}
              question={question}
              listId={listId}
              ref={bookmarkListRef}
              isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
              isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
              setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
            />
          </DrawerContent>
        </Drawer>
      </BookmarkContent>
    );
  }
);

MobileBookmarkButton.displayName = "MobileBookmarkButton";

const DesktopBookmarkButton = memo(
  ({
    question,
    isBookmarkDisabled,
    badgeClassName,
    triggerButtonClassName,
    popOverTriggerClassName,
    popOverAlign,
    open,
    handleOpenChange,
    setIsHovering,
    setShouldOpen,
    openUI,
    listId,
    isAnnotationGuardDialogOpen,
    setIsAnnotationGuardDialogOpen,
    isHavingUnsafeChangesRef,
  }: BookmarkButtonSharedProps) => {
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const bookmarkListRef = useRef<BookmarkListRef | null>(null);

    return (
      <BookmarkContent
        bookmarkListRef={bookmarkListRef}
        open={open}
        handleOpenChange={handleOpenChange}
        setIsHovering={setIsHovering}
        setShouldOpen={setShouldOpen}
      >
        <Popover modal={true} open={open}>
          <PopoverTrigger
            onClick={(e) => {
              openUI(e);
            }}
            ref={triggerRef}
            asChild
          >
            <div className={popOverTriggerClassName}>
              <BookmarkTrigger
                question={question}
                isBookmarkDisabled={isBookmarkDisabled}
                badgeClassName={badgeClassName}
                triggerButtonClassName={triggerButtonClassName}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="flex flex-col z-100010 w-[270px] px-0! dark:bg-accent"
            onClick={(e) => e.stopPropagation()}
            align={popOverAlign}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            autoFocus={false}
            side="left"
            onInteractOutside={(e) => {
              if (triggerRef.current?.contains(e.target as Node)) {
                return;
              }
              handleOpenChange(false);
              bookmarkListRef.current?.setSearchInput("");
            }}
          >
            <BookmarkList
              setOpen={handleOpenChange}
              question={question}
              listId={listId}
              isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
              setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
              isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
              ref={bookmarkListRef}
            />
            <div className="w-full px-2 mt-2 flex items-center justify-center">
              <Button
                className="w-full cursor-pointer"
                variant="destructive"
                onClick={() => {
                  handleOpenChange(false);
                }}
              >
                Close
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </BookmarkContent>
    );
  }
);

DesktopBookmarkButton.displayName = "DesktopBookmarkButton";
