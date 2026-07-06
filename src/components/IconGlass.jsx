export default function IconGlass({ icon: Icon, size = 'lg', round = false, tone, className = '' }) {
  const cls = [
    'icon-glass',
    `icon-glass--${size}`,
    round ? 'icon-glass--round' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls} style={tone ? { color: tone } : undefined} aria-hidden="true">
      <Icon className="icon-glass-svg" strokeWidth={1.9} />
    </span>
  );
}
