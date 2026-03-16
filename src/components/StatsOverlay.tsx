import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { EnergyRecord } from '../types';
import { FILIERE_KEYS, FILIERE_COLORS } from '../utils/colors';
import { formatPower, formatCO2 } from '../utils/format';
import { co2Color } from '../utils/colors';

interface Props {
  latest: EnergyRecord | null;
}

export function StatsOverlay({ latest }: Props) {
  const { data, total } = useMemo(() => {
    if (!latest) return { data: [], total: 0 };
    const d: { key: string; value: number; color: string }[] = [];
    let t = 0;
    for (const key of FILIERE_KEYS) {
      const val = latest[key];
      if (val != null && val > 0) {
        d.push({ key, value: val, color: FILIERE_COLORS[key] });
        t += val;
      }
    }
    return { data: d, total: t };
  }, [latest]);

  if (!latest) return null;

  const isExport = (latest.ech_physiques ?? 0) < 0;
  const exchLabel = isExport ? 'Export' : 'Import';
  const exchColor = isExport ? '#22c55e' : '#ef4444';

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Mini donut */}
      {total > 0 && (
        <div className="w-10 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={12}
                outerRadius={19}
                dataKey="value"
                stroke="none"
              >
                {data.map((e) => (
                  <Cell key={e.key} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs sm:text-sm flex-wrap">
        <div>
          <span className="text-[#94a3b8]">Conso </span>
          <span className="font-semibold text-[#f1f5f9]">{formatPower(latest.consommation)}</span>
        </div>
        <div>
          <span className="text-[#94a3b8]">Prod </span>
          <span className="font-semibold text-[#22c55e]">{formatPower(total || null)}</span>
        </div>
        <div>
          <span className="text-[#94a3b8]">CO2 </span>
          <span className="font-semibold" style={{ color: co2Color(latest.taux_co2 ?? 0) }}>
            {formatCO2(latest.taux_co2)}
          </span>
        </div>
        <div>
          <span className="text-[#94a3b8]">{exchLabel} </span>
          <span className="font-semibold" style={{ color: exchColor }}>
            {formatPower(Math.abs(latest.ech_physiques ?? 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
