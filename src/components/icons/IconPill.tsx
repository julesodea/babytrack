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
        d="M8 6L16 6C17.1046 6 18 6.89543 18 8L18 16C18 17.1046 17.1046 18 16 18L8 18C6.89543 18 6 17.1046 6 16L6 8C6 6.89543 6.89543 6 8 6ZM6 12L18 12M12 6L12 9"
      />
    </svg>
  );
}
