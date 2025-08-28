import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import NavBar from "@/components/NavBar/NavBar";
import { Toaster } from "@/components/ui/sonner";
import { LOGO_MAIN_COLOR } from "@/constants/constants";
import { QueryProvider } from "@/context/QueryProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import Script from "next/script";

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
    "World's most comprehensive AS & A-level study materials platform",
  openGraph: {
    title: "NoteOverflow",
    description:
      "World's most comprehensive AS & A-level study materials platform",
    url: "https://noteoverflow.com/",
    siteName: "NoteOverflow",
    images: [
      {
        url: "/assets/thumbnail.webp",
        width: 1200,
        height: 627,
        alt: "NoteOverflow - AS & A-level study materials platform",
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
        alt: "NoteOverflow - AS & A-level study materials platform",
      },
    ],
  },
  metadataBase: new URL("https://noteoverflow.com"),
  alternates: {
    canonical: "https://noteoverflow.com/",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17511343513"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17511343513');
          `}
        </Script>

        <meta
          content="World's most comprehensive AS & A-level study materials platform"
          name="description"
        />
        <meta name="image" content="/assets/thumbnail.webp" />
        <meta name="author" content="Mr. Cao Cu Chinh" />
        <meta name="theme-color" content={LOGO_MAIN_COLOR} />
        <meta name="og:image" content="/assets/thumbnail.webp" />
        <meta name="og:title" content="NoteOverflow" />
        <meta
          name="og:description"
          content="World's most comprehensive AS & A-level study materials platform"
        />
        <meta name="og:url" content="https://noteoverflow.com/" />
        <meta name="og:type" content="website" />
        <meta name="og:locale" content="en_US" />
        <meta name="og:site_name" content="NoteOverflow" />
        <meta name="og:image:width" content="1200" />
        <meta name="og:image:height" content="627" />
        <meta property="article:author" content="Mr. Cao Cu Chinh" />
        <meta property="article:publisher" content="Mr. Cao Cu Chinh" />
        <meta
          name="twitter:image:alt"
          content="NoteOverflow - AS & A-level study materials platform"
        />
        <meta
          property="og:image:alt"
          content="NoteOverflow - AS & A-level study materials platform"
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
