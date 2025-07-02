import type { Metadata } from 'next';
import AuthPageClient from './index';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to NoteOverflow',
};

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: SearchParams) {
  return (
    <AuthPageClient
      searchParams={await searchParams}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    />
  );
}
