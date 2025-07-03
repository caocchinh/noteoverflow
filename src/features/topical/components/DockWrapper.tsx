'use client';

import { Bookmark, FileClock, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import {
  TOPICAL_QUESTION_APP_ROUTE,
  TOPICAL_QUESTION_BOOKMARK_ROUTE,
  TOPICAL_QUESTION_HISTORY_ROUTE,
} from '@/constants/constants';
import { cn } from '@/lib/utils';
import Dock from './Dock';

const DockWrapper = () => {
  const pathname = usePathname();
  const dummyLinkRef1 = useRef<HTMLAnchorElement>(null);
  const dummyLinkRef2 = useRef<HTMLAnchorElement>(null);
  const dummyLinkRef3 = useRef<HTMLAnchorElement>(null);
  return (
    <Dock
      baseItemSize={30}
      items={[
        {
          icon: (
            <Link href={TOPICAL_QUESTION_APP_ROUTE} ref={dummyLinkRef1}>
              <LayoutDashboard
                className={cn(
                  'text-white dark:text-black',
                  pathname === TOPICAL_QUESTION_APP_ROUTE && '!text-white'
                )}
                size={18}
              />
            </Link>
          ),
          label: 'App',
          onClick: () => {
            dummyLinkRef1.current?.click();
            return;
          },
          backgroundColor:
            pathname === TOPICAL_QUESTION_APP_ROUTE ? '!bg-logo-main' : '',
        },
        {
          icon: (
            <Link href={TOPICAL_QUESTION_HISTORY_ROUTE} ref={dummyLinkRef2}>
              <FileClock
                className={cn(
                  'text-white dark:text-black',
                  pathname === TOPICAL_QUESTION_HISTORY_ROUTE && '!text-white'
                )}
                size={18}
              />
            </Link>
          ),
          label: 'Recently viewed',
          onClick: () => {
            dummyLinkRef2.current?.click();
            return;
          },
          backgroundColor:
            pathname === TOPICAL_QUESTION_HISTORY_ROUTE ? '!bg-logo-main' : '',
        },
        {
          icon: (
            <Link href={TOPICAL_QUESTION_BOOKMARK_ROUTE} ref={dummyLinkRef3}>
              <Bookmark
                className={cn(
                  'text-white dark:text-black',
                  pathname === TOPICAL_QUESTION_BOOKMARK_ROUTE && '!text-white'
                )}
                size={18}
              />
            </Link>
          ),
          label: 'Bookmark',
          onClick: () => {
            dummyLinkRef3.current?.click();
            return;
          },
          backgroundColor:
            pathname === TOPICAL_QUESTION_BOOKMARK_ROUTE ? '!bg-logo-main' : '',
        },
      ]}
      magnification={50}
      panelHeight={30}
    />
  );
};

export default DockWrapper;
