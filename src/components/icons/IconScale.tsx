interface IconProps {
  className?: string;
}

export function IconScale({ className }: IconProps) {
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
        d="M3 6h18M3 6l3 12h12l3-12M3 6l2-2h14l2 2M9 10h6M12 6v4"
      />
    </svg>
  );
}
