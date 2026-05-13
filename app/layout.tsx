import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://expertflow-aios.vercel.app"),
  title: {
    default: "Expert Flow — AI operációs rendszer egyéni vállalkozóknak",
    template: "%s · Expert Flow",
  },
  description:
    "Három skill, három pillér, két keretrendszer. Minimális, használat által bővülő AI-rendszer szolgáltató egyéni vállalkozóknak.",
  openGraph: {
    title: "Expert Flow — AI operációs rendszer",
    description:
      "Három skill, három pillér, két keretrendszer. Lego-elv: kis cserélhető darabok, nem 47-lépéses workflow.",
    locale: "hu_HU",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}>
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
