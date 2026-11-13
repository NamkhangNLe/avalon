import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cinzel = localFont({
  variable: "--font-cinzel",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "./fonts/alegreya-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/alegreya-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/alegreya-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Avalon — The Resistance",
  description:
    "A game of hidden loyalty and quiet betrayal. Five quests stand between Camelot and the dark — and not everyone at the table is who they claim to be.",
};

export const viewport: Viewport = {
  themeColor: "#090d18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
