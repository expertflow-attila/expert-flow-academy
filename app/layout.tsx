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
  metadataBase: new URL("https://expertflow-aios.vercel.app"),
  title: {
    default: "Expert Flow — AI operációs rendszer egyéni vállalkozóknak",
    template: "%s · Expert Flow",
  },
  description:
    "Három skill, három pillér, két keretrendszer. Minimális, használat által bővülő AI-rendszer szolgáltató egyéni vállalkozóknak.",
  applicationName: "Expert Flow AIOS",
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
    title: "Expert Flow — AI operációs rendszer",
    description:
      "Három skill, három pillér, két keretrendszer. Lego-elv: kis cserélhető darabok, nem 47-lépéses workflow.",
    url: "/",
    siteName: "Expert Flow AIOS",
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert Flow — AI operációs rendszer",
    description:
      "Három skill, három pillér, két keretrendszer. Minimális, használat által bővülő AI-rendszer.",
  },
  category: "technology",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Expert Flow",
  alternateName: "Expert Flow AIOS",
  url: "https://expertflow-aios.vercel.app",
  logo: "https://expertflow-aios.vercel.app/icon.png",
  description:
    "AI operációs rendszer egyéni szolgáltató vállalkozóknak — három skill, három pillér, két keretrendszer.",
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
  name: "Expert Flow AIOS",
  url: "https://expertflow-aios.vercel.app",
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
