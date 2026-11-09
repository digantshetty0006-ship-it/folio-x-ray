import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Public_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";
import { PageTransition } from "@/components/motion/PageTransition";
import { site } from "@/lib/config";

const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Know what you actually own`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: `${site.url}/about` }],
  creator: site.author.name,
  publisher: site.name,
  category: "finance",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} · Know what you actually own`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · Know what you actually own`,
    description: site.description,
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#F2EEE6",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${site.url}/#website`,
                url: site.url,
                name: site.name,
                description: site.description,
                inLanguage: "en-IN",
                publisher: { "@id": `${site.url}/#person` },
              },
              {
                "@type": "Person",
                "@id": `${site.url}/#person`,
                name: site.author.name,
                jobTitle: site.author.role,
                url: `${site.url}/about`,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: site.author.city,
                  addressCountry: "IN",
                },
              },
            ],
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
