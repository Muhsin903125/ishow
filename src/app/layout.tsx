import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ishow.fit";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "iShowTransformation | Elite Personal Training in the UAE",
    template: "%s | iShowTransformation",
  },
  description: "Transform your body with expert personal training, structured programs, and 1-on-1 coaching. Book your free assessment today.",
  keywords: ["personal training", "fitness coaching", "UAE fitness", "Dubai gym", "transformation", "weight loss", "strength training"],
  authors: [{ name: "iShowTransformation" }],
  creator: "iShowTransformation",
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: siteUrl,
    siteName: "iShowTransformation",
    title: "iShowTransformation | Elite Personal Training in the UAE",
    description: "Transform your body with expert personal training, structured programs, and 1-on-1 coaching.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "iShowTransformation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iShowTransformation | Elite Personal Training",
    description: "Transform your body with expert personal training and 1-on-1 coaching.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
