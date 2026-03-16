import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnergyRecord } from '../types';
import { FILIERE_KEYS, FILIERE_COLORS, FILIERE_LABELS } from '../utils/colors';
import { formatPercent } from '../utils/format';

interface Props {
  latest: EnergyRecord | null;
}

interface SliceData {
  name: string;
  value: number;
  color: string;
  key: string;
}

export function MixDonut({ latest }: Props) {
  if (!latest) return null;

  const data: SliceData[] = [];
  let total = 0;

  for (const key of FILIERE_KEYS) {
    const val = latest[key];
    if (val != null && val > 0) {
      data.push({
        name: FILIERE_LABELS[key],
        value: val,
        color: FILIERE_COLORS[key],
        key,
      });
      total += val;
    }
  }

  if (total === 0) return null;

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">Mix electrique actuel</h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full max-w-[280px] h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                dataKey="value"
                stroke="#1e293b"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const v = Number(value ?? 0);
                  return [`${Math.round(v).toLocaleString('fr-FR')} MW (${formatPercent((v / total) * 100)})`];
                }}
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#f1f5f9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          {data.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[#94a3b8]">{entry.name}</span>
              <span className="font-medium text-[#f1f5f9]">
                {formatPercent((entry.value / total) * 100)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
