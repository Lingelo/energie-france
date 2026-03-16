import type { EnergyRecord } from '../types';
import { formatPower, formatCO2 } from '../utils/format';
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
  const exchColor = isExport ? '#16a34a' : '#dc2626';

  const cards = [
    {
      label: 'Consommation',
      value: formatPower(latest.consommation),
      color: '#1e293b',
    },
    {
      label: 'Production',
      value: formatPower(production),
      color: '#0072CE',
    },
    {
      label: 'Taux CO2',
      value: formatCO2(latest.taux_co2),
      color: co2Color(latest.taux_co2 ?? 0),
    },
    {
      label: `Echanges (${exchLabel})`,
      value: formatPower(Math.abs(latest.ech_physiques ?? 0)),
      color: exchColor,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
        >
          <p className="text-xs text-[#64748b] mb-1.5">{card.label}</p>
          <p className="text-xl font-bold" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
