export function Chip({ variant = 'default', children }) {
  return <span className={`chip chip-${variant}`}>{children}</span>;
}
