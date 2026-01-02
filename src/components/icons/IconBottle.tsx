interface IconProps {
  className?: string;
}

export function IconBottle({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 6C10 3 14 3 14 6M7 6H17V8H7V6ZM8 8V17C8 19.209 9.79086 21 12 21C14.209 21 16 19.209 16 17V8M11 12H13M11 15H13"
      />
    </svg>
  );
}
