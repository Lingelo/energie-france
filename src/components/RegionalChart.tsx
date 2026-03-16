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
  selectedRegion?: string | null;
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

export function RegionalChart({ data, selectedRegion }: Props) {
  const regions = useMemo(() => {
    if (data.length === 0) return [];

    // Get latest record per region that has actual data
    const latestByRegion = new Map<string, RegionalRecord>();
    for (const r of data) {
      if (r.consommation == null && r.nucleaire == null) continue;
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

  const chartData = useMemo(() => {
    if (!selectedRegion) return regions;
    return regions.map((r) => ({
      ...r,
      opacity: r.region.startsWith(selectedRegion.slice(0, 18)) ? 1 : 0.3,
    }));
  }, [regions, selectedRegion]);

  if (regions.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-semibold mb-1.5 text-[#1e293b]">Production par region</h3>
      <p className="text-sm text-[#64748b] mb-5">
        Dernier releve disponible par region
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5 text-xs">
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
            <span className="text-[#64748b]">{label}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}GW` : `${v}MW`
              }
            />
            <YAxis
              type="category"
              dataKey="region"
              width={120}
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
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
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#1e293b',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
