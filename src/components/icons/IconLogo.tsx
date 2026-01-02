interface IconProps {
  className?: string;
}

export function IconLogo({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle cx="12" cy="13" r="7" stroke-width="1.5" />

      <circle cx="9.5" cy="12.5" r="0.75" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="0.75" fill="currentColor" />

      <path
        d="M9 15.5C10 17 14 17 15 15.5"
        stroke-width="1.5"
        stroke-linecap="round"
      />

      <path
        d="M12 6C12 3 15 3 15 5"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
