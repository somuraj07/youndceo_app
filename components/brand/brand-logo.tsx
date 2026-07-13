import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/young-ceo-logo.png"
      alt="The Young CEO"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
