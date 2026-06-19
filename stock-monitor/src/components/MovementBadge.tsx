import { direction, directionArrow, directionLabel, formatPercent } from '../lib/format';

interface Props {
  /** Value whose sign determines direction (e.g. daily change). */
  value: number;
  /** Text to display, e.g. "+1.23%". Defaults to a formatted percent of `value`. */
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Positive/negative indicator that never relies on color alone: it pairs the color
 * with an arrow, an explicit +/− sign, and an accessible direction label.
 */
export function MovementBadge({ value, text, size = 'md' }: Props) {
  const dir = direction(value);
  const arrow = directionArrow(dir);
  const label = directionLabel(dir);
  return (
    <span className={`movement movement--${dir} movement--${size}`} role="status">
      <span aria-hidden="true" className="movement__arrow">
        {arrow}
      </span>
      <span className="movement__text">{text ?? formatPercent(value)}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
