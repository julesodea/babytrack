interface IconProps {
  className?: string;
}

export function IconPill({ className }: IconProps) {
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
        d="M5 5H19V19H5V5ZM12 8V16M8 12H16"
      />
    </svg>
  );
}
