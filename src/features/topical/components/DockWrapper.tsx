"use client";

import {
  BookOpenCheck,
  Bookmark,
  // FileClock,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  TOPICAL_QUESTION_APP_ROUTE,
  TOPICAL_QUESTION_BOOKMARK_ROUTE,
  // TOPICAL_QUESTION_HISTORY_ROUTE,
  TOPICAL_QUESTION_FINISHED_QUESTIONS_ROUTE,
} from "@/constants/constants";
import { cn } from "@/lib/utils";
import Dock from "./Dock";

const DockWrapper = () => {
  const pathname = usePathname();
  const dummyLinkRef1 = useRef<HTMLAnchorElement>(null);
  // const dummyLinkRef2 = useRef<HTMLAnchorElement>(null);
  const dummyLinkRef3 = useRef<HTMLAnchorElement>(null);
  const dummyLinkRef4 = useRef<HTMLAnchorElement>(null);
  return (
    <Dock
      baseItemSize={30}
      items={[
        {
          icon: (
            <Link
              href={TOPICAL_QUESTION_APP_ROUTE}
              ref={dummyLinkRef1}
              prefetch={false}
            >
              <LayoutDashboard
                className={cn(
                  "text-white dark:text-black",
                  pathname === TOPICAL_QUESTION_APP_ROUTE && "!text-white"
                )}
                size={18}
              />
            </Link>
          ),
          label: "App",
          onClick: () => {
            dummyLinkRef1.current?.click();
          },
          backgroundColor:
            pathname === TOPICAL_QUESTION_APP_ROUTE ? "!bg-logo-main" : "",
        },

        {
          icon: (
            <Link
              href={TOPICAL_QUESTION_BOOKMARK_ROUTE}
              ref={dummyLinkRef3}
              prefetch={false}
            >
              <Bookmark
                className={cn(
                  "text-white dark:text-black",
                  pathname === TOPICAL_QUESTION_BOOKMARK_ROUTE && "!text-white"
                )}
                size={18}
              />
            </Link>
          ),
          label: "Bookmark",
          onClick: () => {
            dummyLinkRef3.current?.click();
          },
          backgroundColor:
            pathname === TOPICAL_QUESTION_BOOKMARK_ROUTE ? "!bg-logo-main" : "",
        },
        {
          icon: (
            <Link
              href={TOPICAL_QUESTION_FINISHED_QUESTIONS_ROUTE}
              ref={dummyLinkRef4}
              prefetch={false}
            >
              <BookOpenCheck
                className={cn(
                  "text-white dark:text-black",
                  pathname === TOPICAL_QUESTION_FINISHED_QUESTIONS_ROUTE &&
                    "!text-white"
                )}
                size={18}
              />
            </Link>
          ),
          label: "Finished questions",
          onClick: () => {
            dummyLinkRef4.current?.click();
          },
          backgroundColor:
            pathname === TOPICAL_QUESTION_FINISHED_QUESTIONS_ROUTE
              ? "!bg-logo-main"
              : "",
        },
        // {
        //   icon: (
        //     <Link href={TOPICAL_QUESTION_HISTORY_ROUTE} ref={dummyLinkRef2}>
        //       <FileClock
        //         className={cn(
        //           "text-white dark:text-black",
        //           pathname === TOPICAL_QUESTION_HISTORY_ROUTE && "!text-white"
        //         )}
        //         size={18}
        //       />
        //     </Link>
        //   ),
        //   label: "Recently viewed",
        //   onClick: () => {
        //     dummyLinkRef2.current?.click();
        //     return;
        //   },
        //   backgroundColor:
        //     pathname === TOPICAL_QUESTION_HISTORY_ROUTE ? "!bg-logo-main" : "",
        // },
      ]}
      magnification={50}
      panelHeight={30}
    />
  );
};

export default DockWrapper;
