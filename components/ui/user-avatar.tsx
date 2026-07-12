type UserAvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

export function UserAvatar({
  src,
  name,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-teal/25 font-bold text-teal ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={name}
    >
      {initial}
    </span>
  );
}
