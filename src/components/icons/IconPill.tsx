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
        d="M7 7H17V17H7V7ZM12 9V15M9 12H15"
      />
    </svg>
  );
}
