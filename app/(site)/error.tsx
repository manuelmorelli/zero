"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function SiteError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong"
      message="We hit a snag loading this page. Try again, or head back home."
      onRetry={unstable_retry}
    />
  );
}
