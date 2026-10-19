import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/images/zero-wordmark.svg"
      alt="Zero, every journey starts from Zero"
      width={597}
      height={173}
      unoptimized
      className={`logo-wordmark w-auto ${className ?? ""}`}
    />
  );
}
