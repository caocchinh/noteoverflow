import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { LOGO_MAIN_COLOR } from "@/constants/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoteOverflow",
  description:
    "World's most comprehensive IGCSE, AS & A-level study materials platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>NoteOverflow</title>
        <meta
          name="description"
          content="World's most comprehensive IGCSE, AS & A-level study materials platform"
        />
        <link rel="icon" href="/assets/favicon.ico" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <NextTopLoader color={LOGO_MAIN_COLOR} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
