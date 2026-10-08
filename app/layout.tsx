import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { QuickUpload } from "@/components/creator/QuickUpload";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MessagesWidget } from "@/components/messages/MessagesWidget";
import "./globals.css";

// Satoshi (Fontshare, licenza gratuita anche per uso commerciale), scelto da Manuel il
// 2026-10-09 al posto di Inter. File variabile salvato nel progetto: pesi da 300 a 900.
const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zero | Every journey starts from Zero",
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
        className={`${satoshi.variable} font-sans bg-bg text-ink antialiased`}
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
