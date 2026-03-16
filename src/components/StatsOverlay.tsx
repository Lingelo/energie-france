import type { EnergyRecord } from '../types';
import { formatCO2 } from '../utils/format';
import { co2Color, co2Label } from '../utils/colors';

interface Props {
  latest: EnergyRecord | null;
}

export function StatsOverlay({ latest }: Props) {
  if (!latest) return null;

  const co2 = latest.taux_co2 ?? 0;
  const color = co2Color(co2);
  const label = co2Label(co2);

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-lg sm:text-xl font-bold tracking-tight" style={{ color }}>
        {formatCO2(latest.taux_co2)}
      </span>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full border"
        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}0d` }}
      >
        {label}
      </span>
    </div>
  );
}
