import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QuickUpload } from "@/components/creator/QuickUpload";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Zero — Every journey starts from zero",
  description:
    "Zero is the platform where people's real transformations become Journeys to follow, chapter by chapter.",
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
        <QuickUpload />
      </body>
    </html>
  );
}
