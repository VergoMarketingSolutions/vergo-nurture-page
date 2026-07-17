// Vergo "V" mark — blue rounded tile with the white chevron.
export default function Logo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="VM Solutions"
    >
      <rect width="100" height="100" rx="23" fill="var(--blue)" />
      <path d="M15 27 L37 27 L50 44 L63 27 L85 27 L50 78 Z" fill="#fff" />
    </svg>
  );
}
