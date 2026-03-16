import type { EnergyRecord } from '../types';
import { formatPower, formatCO2, timeAgo } from '../utils/format';
import { co2Color } from '../utils/colors';

interface Props {
  latest: EnergyRecord | null;
}

export function HeroStats({ latest }: Props) {
  if (!latest) return null;

  const production =
    (latest.nucleaire ?? 0) +
    (latest.eolien ?? 0) +
    (latest.solaire ?? 0) +
    (latest.hydraulique ?? 0) +
    (latest.gaz ?? 0) +
    (latest.fioul ?? 0) +
    (latest.charbon ?? 0) +
    (latest.bioenergies ?? 0);

  const isExport = (latest.ech_physiques ?? 0) < 0;
  const exchLabel = isExport ? 'Export' : 'Import';
  const exchColor = isExport ? '#22c55e' : '#ef4444';

  const cards = [
    {
      label: 'Consommation',
      value: formatPower(latest.consommation),
      color: '#f1f5f9',
      sub: null,
    },
    {
      label: 'Production',
      value: formatPower(production),
      color: '#22c55e',
      sub: null,
    },
    {
      label: 'Taux CO2',
      value: formatCO2(latest.taux_co2),
      color: co2Color(latest.taux_co2 ?? 0),
      sub: null,
    },
    {
      label: 'Echanges',
      value: formatPower(Math.abs(latest.ech_physiques ?? 0)),
      color: exchColor,
      sub: exchLabel,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 transition-all hover:border-[#475569]"
          >
            <p className="text-sm text-[#94a3b8] mb-1">{card.label}</p>
            <p className="text-2xl font-semibold" style={{ color: card.color }}>
              {card.value}
            </p>
            {card.sub && (
              <p className="text-xs mt-1" style={{ color: card.color }}>
                {card.sub}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#94a3b8] text-right">
        Derniere mise a jour : {timeAgo(latest.date_heure)}
      </p>
    </div>
  );
}
