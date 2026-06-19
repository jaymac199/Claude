import { TIME_RANGES, type TimeRange } from '../types/market';

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

/** Segmented control for selecting a chart time range. */
export function TimeRangeSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="segmented" role="group" aria-label="Time range">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className={`segmented__item ${value === range ? 'is-active' : ''}`}
          aria-pressed={value === range}
          disabled={disabled}
          onClick={() => onChange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
