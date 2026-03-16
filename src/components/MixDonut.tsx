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
    <div>
      <h3 className="text-base font-semibold mb-5 text-[#1e293b]">Mix electrique actuel</h3>
      <div className="flex flex-col items-center gap-5">
        <div className="w-full max-w-[240px] h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={105}
                dataKey="value"
                stroke="#ffffff"
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
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  color: '#1e293b',
                  fontSize: 13,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-sm w-full">
          {data.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[#64748b]">{entry.name}</span>
              <span className="font-semibold text-[#1e293b] ml-auto">
                {formatPercent((entry.value / total) * 100)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
