import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1a1a1f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://akademia.expertflow.hu"),
  title: {
    default: "Expert Flow Akadémia — kurzusok szolgáltató vállalkozóknak",
    template: "%s · Expert Flow Akadémia",
  },
  description:
    "Zárt kurzusplatform szolgáltató vállalkozóknak. Szakmai-leíró, AI rendszerek, ügyfélszerzés — pilot 49 000 Ft-tól.",
  applicationName: "Expert Flow Akadémia",
  authors: [{ name: "Nagy Attila", url: "https://expertflow.hu" }],
  creator: "Expert Flow",
  publisher: "Expert Flow",
  alternates: {
    canonical: "/",
    languages: { "hu-HU": "/", "x-default": "/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Expert Flow Akadémia",
    description:
      "Zárt kurzusplatform szolgáltató vállalkozóknak. Szakmai-leíró, AI rendszerek, pilot 49 000 Ft-tól.",
    url: "/",
    siteName: "Expert Flow Akadémia",
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert Flow Akadémia",
    description:
      "Zárt kurzusplatform szolgáltató vállalkozóknak. AI rendszerek, ügyfélszerzés, szakmai-leíró.",
  },
  category: "technology",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Expert Flow Akadémia",
  alternateName: "Expert Flow Academy",
  url: "https://akademia.expertflow.hu",
  logo: "https://akademia.expertflow.hu/icon.png",
  description:
    "Zárt kurzusplatform szolgáltató vállalkozóknak — AI rendszerek, ügyfélszerzés, szakmai-leíró.",
  founder: { "@type": "Person", name: "Nagy Attila" },
  sameAs: [
    "https://github.com/expertflow-attila",
    "https://github.com/Expert-Flow",
    "https://www.youtube.com/@nagyattilaferenc",
    "https://expertflow.hu",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@expertflow.hu",
    areaServed: "HU",
    availableLanguage: ["Hungarian"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Expert Flow Akadémia",
  url: "https://akademia.expertflow.hu",
  inLanguage: "hu-HU",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
        >
          Ugrás a tartalomhoz
        </a>
        {children}
      </body>
    </html>
  );
}
