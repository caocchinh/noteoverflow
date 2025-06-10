import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { LOGO_MAIN_COLOR } from "@/constants/constants";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeProvider";
import NavBar from "@/components/NavBar/NavBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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

      <body
        className={`${inter.variable} ${roboto.variable} font-inter antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextTopLoader
            zIndex={99999999}
            color={LOGO_MAIN_COLOR}
            showSpinner={false}
          />
          <NavBar />
          {children}
        </ThemeProvider>

        <Toaster />
      </body>
    </html>
  );
}
