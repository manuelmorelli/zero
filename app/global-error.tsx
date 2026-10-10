"use client";

import { ErrorState } from "@/components/ui/error-state";
import "./globals.css";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink antialiased">
        <ErrorState
          title="Something went wrong"
          message="We hit a snag loading this page. Try again, or head back home."
          onRetry={unstable_retry}
        />
      </body>
    </html>
  );
}
