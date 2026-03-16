import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RegionalRecord } from '../types';
import { FILIERE_COLORS } from '../utils/colors';

interface Props {
  data: RegionalRecord[];
}

interface RegionSummary {
  region: string;
  consommation: number;
  nucleaire: number;
  hydraulique: number;
  eolien: number;
  solaire: number;
  thermique: number;
  bioenergies: number;
}

export function RegionalChart({ data }: Props) {
  const regions = useMemo(() => {
    if (data.length === 0) return [];

    // Get latest record per region
    const latestByRegion = new Map<string, RegionalRecord>();
    for (const r of data) {
      const existing = latestByRegion.get(r.libelle_region);
      if (
        !existing ||
        new Date(r.date_heure).getTime() > new Date(existing.date_heure).getTime()
      ) {
        latestByRegion.set(r.libelle_region, r);
      }
    }

    const summaries: RegionSummary[] = [];
    for (const [region, r] of latestByRegion) {
      summaries.push({
        region: region.length > 20 ? region.slice(0, 18) + '..' : region,
        consommation: r.consommation ?? 0,
        nucleaire: r.nucleaire ?? 0,
        hydraulique: r.hydraulique ?? 0,
        eolien: r.eolien ?? 0,
        solaire: r.solaire ?? 0,
        thermique: r.thermique ?? 0,
        bioenergies: r.bioenergies ?? 0,
      });
    }

    // Sort by consumption descending
    summaries.sort((a, b) => b.consommation - a.consommation);
    return summaries;
  }, [data]);

  if (regions.length === 0) return null;

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-1">Production par region</h3>
      <p className="text-sm text-[#94a3b8] mb-4">
        Dernier releve disponible par region
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
        {[
          { key: 'nucleaire', label: 'Nucleaire', color: FILIERE_COLORS.nucleaire },
          { key: 'hydraulique', label: 'Hydraulique', color: FILIERE_COLORS.hydraulique },
          { key: 'eolien', label: 'Eolien', color: FILIERE_COLORS.eolien },
          { key: 'solaire', label: 'Solaire', color: FILIERE_COLORS.solaire },
          { key: 'thermique', label: 'Thermique', color: FILIERE_COLORS.gaz },
          { key: 'bioenergies', label: 'Bioenergies', color: FILIERE_COLORS.bioenergies },
        ].map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[#94a3b8]">{label}</span>
          </div>
        ))}
      </div>

      <div style={{ height: Math.max(400, regions.length * 35) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={regions} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis
              type="number"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}GW` : `${v}MW`
              }
            />
            <YAxis
              type="category"
              dataKey="region"
              width={120}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name);
                const labels: Record<string, string> = {
                  nucleaire: 'Nucleaire',
                  hydraulique: 'Hydraulique',
                  eolien: 'Eolien',
                  solaire: 'Solaire',
                  thermique: 'Thermique',
                  bioenergies: 'Bioenergies',
                };
                return [
                  `${Math.round(v).toLocaleString('fr-FR')} MW`,
                  labels[n] ?? n,
                ];
              }}
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f1f5f9',
              }}
            />
            <Bar dataKey="nucleaire" stackId="1" fill={FILIERE_COLORS.nucleaire} />
            <Bar dataKey="hydraulique" stackId="1" fill={FILIERE_COLORS.hydraulique} />
            <Bar dataKey="eolien" stackId="1" fill={FILIERE_COLORS.eolien} />
            <Bar dataKey="solaire" stackId="1" fill={FILIERE_COLORS.solaire} />
            <Bar dataKey="thermique" stackId="1" fill={FILIERE_COLORS.gaz} />
            <Bar dataKey="bioenergies" stackId="1" fill={FILIERE_COLORS.bioenergies} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
