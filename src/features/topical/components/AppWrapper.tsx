'use client';
import { usePathname } from 'next/navigation';
import { TOPICAL_QUESTION_APP_ROUTE } from '@/constants/constants';

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <>{pathname === TOPICAL_QUESTION_APP_ROUTE && children}</>;
}
