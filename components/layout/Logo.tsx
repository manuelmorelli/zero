import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/images/logo.svg"
      alt="ZERO — Every journey starts from zero"
      width={1254}
      height={1254}
      unoptimized
      className={`w-auto ${className ?? ""}`}
    />
  );
}
