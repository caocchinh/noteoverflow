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
  openGraph: {
    title: "NoteOverflow",
    description:
      "World's most comprehensive IGCSE, AS & A-level study materials platform",
    url: "https://noteoverflow.com/",
    siteName: "NoteOverflow",
    images: [
      {
        url: "/assets/thumbnail.webp",
        width: 1200,
        height: 627,
        alt: "NoteOverflow - IGCSE, AS & A-level study materials platform",
        type: "image/webp",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "Mr. Cao Cu Chinh",
    site: "@noteoverflow",
    images: [
      {
        url: "/assets/thumbnail.webp",
        alt: "NoteOverflow - IGCSE, AS & A-level study materials platform",
      },
    ],
  },
  metadataBase: new URL("https://noteoverflow.com"),
  alternates: {
    canonical: "https://noteoverflow.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <meta name="image" content="/assets/thumbnail.webp" />
        <meta name="author" content="Mr. Cao Cu Chinh" />
        <meta name="theme-color" content={LOGO_MAIN_COLOR} />
        <meta name="robots" content="index, follow" />
        <meta property="article:author" content="Mr. Cao Cu Chinh" />
        <meta property="article:publisher" content="Mr. Cao Cu Chinh" />
        <meta
          name="twitter:image:alt"
          content="NoteOverflow - IGCSE, AS & A-level study materials platform"
        />
        <meta
          property="og:image:alt"
          content="NoteOverflow - IGCSE, AS & A-level study materials platform"
        />
        <link href="/assets/favicon.ico" rel="icon" />
        <link rel="apple-touch-icon" href="/assets/favicon.ico" />
        <link rel="canonical" href="https://noteoverflow.com/" />
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
