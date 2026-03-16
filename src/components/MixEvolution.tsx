import { useState, useMemo } from 'react';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import type { EnergyRecord } from '../types';
import { FILIERE_KEYS, FILIERE_COLORS, FILIERE_LABELS } from '../utils/colors';
import { formatDateTime } from '../utils/format';

interface Props {
  data: EnergyRecord[];
}

type Range = '24h' | '7j';

export function MixEvolution({ data }: Props) {
  const [range, setRange] = useState<Range>('7j');
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    if (data.length === 0) return [];
    const sorted = [...data].sort(
      (a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()
    );

    if (range === '24h') {
      const cutoff = now - 24 * 3600 * 1000;
      return sorted.filter((r) => new Date(r.date_heure).getTime() >= cutoff);
    }
    return sorted;
  }, [data, range, now]);

  const chartData = useMemo(() => {
    return filtered.map((r) => {
      const point: Record<string, number | string | null> = {
        time: r.date_heure,
        consommation: r.consommation,
        taux_co2: r.taux_co2,
      };
      for (const key of FILIERE_KEYS) {
        point[key] = r[key] != null && (r[key] as number) > 0 ? r[key] : 0;
      }
      return point;
    });
  }, [filtered]);

  if (chartData.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#1e293b]">Evolution du mix</h3>
        <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-1">
          {(['24h', '7j'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-[#0072CE] text-white'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              {r === '24h' ? '24h' : '7 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5 text-xs">
        {FILIERE_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: FILIERE_COLORS[key] }}
            />
            <span className="text-[#64748b]">{FILIERE_LABELS[key]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="w-4 border-t-2 border-dashed border-[#1e293b]" />
          <span className="text-[#64748b]">Consommation</span>
        </div>
      </div>

      <div className="h-[440px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return range === '24h'
                  ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
              }}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}GW` : `${v}MW`
              }
            />
            <Tooltip
              labelFormatter={(v) => formatDateTime(String(v))}
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name);
                const label =
                  n === 'consommation'
                    ? 'Consommation'
                    : FILIERE_LABELS[n as keyof typeof FILIERE_LABELS] ?? n;
                return [`${Math.round(v).toLocaleString('fr-FR')} MW`, label];
              }}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#1e293b',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            {[...FILIERE_KEYS].reverse().map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                fill={FILIERE_COLORS[key]}
                stroke={FILIERE_COLORS[key]}
                fillOpacity={0.8}
              />
            ))}
            <Line
              type="monotone"
              dataKey="consommation"
              stroke="#1e293b"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* CO2 strip */}
      <div className="mt-5">
        <p className="text-xs text-[#64748b] mb-2">Intensite CO2 sur la periode</p>
        <div className="flex h-3 rounded-full overflow-hidden">
          {chartData.map((d, i) => {
            const co2 = (d.taux_co2 as number) ?? 0;
            let color = '#16a34a';
            if (co2 >= 100) color = '#dc2626';
            else if (co2 >= 50) color = '#ca8a04';
            return (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: color }}
                title={`${Math.round(co2)} gCO2/kWh`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-[#94a3b8] mt-1">
          <span>&lt; 50 gCO2 (bas)</span>
          <span>50-100 (moyen)</span>
          <span>&gt; 100 (eleve)</span>
        </div>
      </div>
    </div>
  );
}
