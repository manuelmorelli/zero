import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Zero, every journey starts from Zero"
      width={3924}
      height={1040}
      unoptimized
      className={`w-auto ${className ?? ""}`}
    />
  );
}
