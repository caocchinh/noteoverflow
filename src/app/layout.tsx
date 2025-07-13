import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import NavBar from "@/components/NavBar/NavBar";
import { Toaster } from "@/components/ui/sonner";
import { LOGO_MAIN_COLOR } from "@/constants/constants";
import { QueryProvider } from "@/context/QueryProvider";
import { ThemeProvider } from "@/context/ThemeProvider";

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
        <meta
          content="World's most comprehensive IGCSE, AS & A-level study materials platform"
          name="description"
        />
        <link href="/assets/favicon.ico" rel="icon" />
      </head>

      <body
        className={`${inter.variable} ${roboto.variable} font-inter antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            enableSystem={false}
          >
            <NextTopLoader
              color={LOGO_MAIN_COLOR}
              showSpinner={false}
              zIndex={99_999_999}
            />
            <NavBar />
            {children}
          </ThemeProvider>
        </QueryProvider>

        <Toaster />
      </body>
    </html>
  );
}
