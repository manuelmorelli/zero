import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QuickUpload } from "@/components/creator/QuickUpload";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MessagesWidget } from "@/components/messages/MessagesWidget";
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
        <QuickUpload>
          {children}
          <NotificationBell />
          <MessagesWidget />
        </QuickUpload>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "!rounded-xl !border !border-border !bg-surface !text-ink !shadow-2xl !shadow-black/50",
              description: "!text-ink-muted",
              actionButton: "!bg-ink !text-bg",
              cancelButton: "!bg-surface-2 !text-ink-muted",
            },
          }}
        />
      </body>
    </html>
  );
}
