import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin", "cyrillic", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

// Search engine ownership verification meta tags. All three are env-gated so
// previews / local builds don't leak verification tokens into the HTML.
//   - GOOGLE_SITE_VERIFICATION: HTML tag method from Search Console (only used
//     for URL-prefix properties; Domain properties auto-verify via DNS, so this
//     is optional). Keeping it here as a backup verification method.
//   - YANDEX_VERIFICATION: yandex-verification meta from Yandex Webmaster.
//   - BING_SITE_VERIFICATION: msvalidate.01 meta from Bing Webmaster Tools.
const verificationOther: Record<string, string> = {};
if (process.env.BING_SITE_VERIFICATION) {
  verificationOther["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;
}

export const metadata: Metadata = {
  title: {
    default: "Glatko — Montenegro's Premier Service Marketplace",
    template: "%s | Glatko",
  },
  description:
    "Find trusted professionals for home services, boat maintenance, and more in Montenegro. Get free quotes from verified experts.",
  metadataBase: new URL("https://glatko.app"),
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Glatko",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: Object.keys(verificationOther).length > 0 ? verificationOther : undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase: warms TLS so the first client-side
            REST/auth call (after hydration) doesn't pay the handshake cost. */}
        <link
          rel="preconnect"
          href="https://cjqappdfyxgytdyeytwv.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://cjqappdfyxgytdyeytwv.supabase.co"
        />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
