import { ErrorState } from "@/components/ui/error-state";

export default function SiteNotFound() {
  return (
    <ErrorState
      title="Page not found"
      message="This page doesn't exist, or it's been moved."
    />
  );
}
