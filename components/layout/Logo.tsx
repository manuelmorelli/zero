import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="ZERO — Every journey starts from zero"
      width={1078}
      height={426}
      unoptimized
      className={`w-auto ${className ?? ""}`}
    />
  );
}
