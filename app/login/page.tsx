import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { LoginGreeting } from "@/components/auth/LoginGreeting";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AuthHeader />
        <LoginGreeting />

        <LoginForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-ink hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
