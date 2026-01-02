interface IconProps {
  className?: string;
}

export function IconDiaper({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M6 7H18C19.5 13 16 19 12 19C8 19 4.5 13 6 7Z M3 7H6 M18 7H21 M9 12C11 14 13 14 15 12"
      ></path>
    </svg>
  );
}
