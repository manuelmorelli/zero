import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Theme } from "@/generated/prisma/client";
import { getThemeFromCookie } from "@/lib/theme";
import { QuickUpload } from "@/components/creator/QuickUpload";
import { Inbox } from "@/components/layout/Inbox";
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
    "Zero is the platform where real people document their Journey episode by episode, gathered into chapters you can follow from the start.",
};

/* viewportFit "cover" lascia disegnare la pagina fin sotto la "isola" o la tacca del telefono: da
 * qui in poi env(safe-area-inset-*) (già usato da BottomNav e dai pulsanti flottanti) smette di
 * valere sempre 0 e torna la misura vera. interactiveWidget "resizes-content" fa restringere il
 * layout quando si apre la tastiera su Android, invece di lasciarla coprire i campi sotto.
 * themeColor segue lo stesso tema scelto da chi guarda (stesso cookie di getThemeFromCookie qui
 * sotto), non le impostazioni del sistema: altrimenti la barra di stato del telefono avrebbe il
 * colore sbagliato ogni volta che tema del sito e tema del sistema non combaciano. */
export async function generateViewport(): Promise<Viewport> {
  const theme = await getThemeFromCookie();
  const isLight = theme === Theme.LIGHT;
  return {
    viewportFit: "cover",
    interactiveWidget: "resizes-content",
    colorScheme: isLight ? "light" : "dark",
    themeColor: isLight ? "#d4d4d4" : "#0a0a0a",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getThemeFromCookie();
  const isLight = theme === Theme.LIGHT;

  return (
    <html lang="en" data-theme={isLight ? "light" : "dark"}>
      <body
        className={`${satoshi.variable} font-sans bg-bg text-ink antialiased`}
      >
        <QuickUpload>
          {children}
          <Inbox />
        </QuickUpload>
        <Toaster
          theme={isLight ? "light" : "dark"}
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
