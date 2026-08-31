import { Header } from "@/components/layout/Header";

export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-screen flex-col justify-center">
      <Header />
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
      </div>
    </main>
  );
}
