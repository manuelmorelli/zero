import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Zero — Every journey starts from zero",
  description:
    "Zero è la piattaforma dove le trasformazioni reali delle persone diventano Journey da seguire, capitolo dopo capitolo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-bg text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
