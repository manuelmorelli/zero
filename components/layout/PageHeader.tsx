import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

type PageHeaderProps = {
  containerClassName?: string;
};

/** Barra fissa e sfumata in stile Home, riusata dalle pagine più semplici (Dashboard, Profilo, Journey). */
export function PageHeader({ containerClassName = "max-w-2xl" }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className={`mx-auto flex items-center px-6 py-5 ${containerClassName}`}>
        <Link href="/">
          <Logo className="h-6" />
        </Link>
      </div>
    </header>
  );
}
