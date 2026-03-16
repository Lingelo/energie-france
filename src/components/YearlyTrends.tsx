import { useMemo } from 'react';
import {
  Bar,
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

interface Props {
  data: EnergyRecord[];
}

interface MonthlyData {
  month: string;
  [key: string]: number | string | null;
}

export function YearlyTrends({ data }: Props) {
  const monthly = useMemo(() => {
    if (data.length === 0) return [];

    // Group by month
    const map = new Map<string, EnergyRecord[]>();
    for (const r of data) {
      const d = new Date(r.date_heure);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }

    const months = [...map.keys()].sort();

    return months.map((m) => {
      const records = map.get(m)!;
      const count = records.length;
      const point: MonthlyData = {
        month: new Date(m + '-15').toLocaleDateString('fr-FR', {
          month: 'short',
          year: '2-digit',
        }),
      };

      for (const key of FILIERE_KEYS) {
        const sum = records.reduce((acc, r) => acc + (r[key] != null && (r[key] as number) > 0 ? (r[key] as number) : 0), 0);
        point[key] = Math.round(sum / count);
      }

      const co2Sum = records.reduce((acc, r) => acc + (r.taux_co2 ?? 0), 0);
      const co2Count = records.filter((r) => r.taux_co2 != null).length;
      point.taux_co2 = co2Count > 0 ? Math.round(co2Sum / co2Count) : null;

      return point;
    });
  }, [data]);

  if (monthly.length === 0) return null;

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-1">Tendances annuelles</h3>
      <p className="text-sm text-[#94a3b8] mb-4">
        Production moyenne par mois et intensite CO2
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
        {FILIERE_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: FILIERE_COLORS[key] }}
            />
            <span className="text-[#94a3b8]">{FILIERE_LABELS[key]}</span>
          </div>
        ))}
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}GW` : `${v}`
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v: number) => `${v}`}
              label={{
                value: 'gCO2/kWh',
                angle: 90,
                position: 'insideRight',
                fill: '#94a3b8',
                fontSize: 10,
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name);
                if (n === 'taux_co2')
                  return [`${Math.round(v)} gCO2/kWh`, 'CO2'];
                const label =
                  FILIERE_LABELS[n as keyof typeof FILIERE_LABELS] ?? n;
                return [`${Math.round(v).toLocaleString('fr-FR')} MW`, label];
              }}
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f1f5f9',
              }}
            />
            {[...FILIERE_KEYS].reverse().map((key) => (
              <Bar
                key={key}
                yAxisId="left"
                dataKey={key}
                stackId="1"
                fill={FILIERE_COLORS[key]}
              />
            ))}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="taux_co2"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, fill: '#ef4444' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
