import type { Metadata } from "next";
import AuthPageClient from "./index";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to NoteOverflow",
};

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: SearchParams) {
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        strategy="afterInteractive"
      />
      <AuthPageClient
        searchParams={await searchParams}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
    </>
  );
}
