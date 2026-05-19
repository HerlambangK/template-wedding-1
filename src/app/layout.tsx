import type { Metadata, Viewport } from "next";
import { Poppins, Amiri } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  variable: "--font-amiri",
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B8860B",
};

export const metadata: Metadata = {
  title: {
    default: "Herlambang & Rela Wedding Invitation",
    template: "%s | Herlambang & Rela",
  },
  description:
    "Undangan Pernikahan Herlambang Kuswicaksonojati & Rela Hastuti — 29 Mei 2026, NAWASENA GARDEN BALLROOM Madiun",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/images/groom.jpg" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Undangan Pernikahan Herlambang & Rela",
    title: "Herlambang & Rela Wedding Invitation",
    description:
      "Undangan Pernikahan Herlambang Kuswicaksonojati & Rela Hastuti — 29 Mei 2026, NAWASENA GARDEN BALLROOM Madiun",
    images: [
      {
        url: "/images/gallery/1.jpg",
        width: 1200,
        height: 630,
        alt: "Herlambang & Rela",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Herlambang & Rela Wedding Invitation",
    description:
      "Undangan Pernikahan Herlambang Kuswicaksonojati & Rela Hastuti — 29 Mei 2026",
    images: ["/images/gallery/1.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${amiri.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
