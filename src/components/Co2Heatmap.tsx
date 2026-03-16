import { useMemo } from 'react';
import type { EnergyRecord } from '../types';

interface Props {
  data: EnergyRecord[];
}

interface CellData {
  day: string;
  hour: number;
  co2: number;
}

export function Co2Heatmap({ data }: Props) {
  const { grid, days } = useMemo(() => {
    // Build a map: day -> hour -> co2 values
    const map = new Map<string, Map<number, number[]>>();

    for (const r of data) {
      if (r.taux_co2 == null) continue;
      const d = new Date(r.date_heure);
      const dayKey = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      });
      const hour = d.getHours();

      if (!map.has(dayKey)) map.set(dayKey, new Map());
      const hourMap = map.get(dayKey)!;
      if (!hourMap.has(hour)) hourMap.set(hour, []);
      hourMap.get(hour)!.push(r.taux_co2);
    }

    // Sort days chronologically (use raw dates for sorting)
    const dayDatePairs: [string, Date][] = [];
    const seen = new Set<string>();
    for (const r of data) {
      const d = new Date(r.date_heure);
      const dayKey = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      });
      if (!seen.has(dayKey)) {
        seen.add(dayKey);
        dayDatePairs.push([dayKey, d]);
      }
    }
    dayDatePairs.sort((a, b) => a[1].getTime() - b[1].getTime());
    const sortedDays = dayDatePairs.map(([k]) => k);

    // Take last 30 days
    const recentDays = sortedDays.slice(-30);

    const grid: CellData[] = [];
    for (const day of recentDays) {
      const hourMap = map.get(day);
      for (let h = 0; h < 24; h++) {
        const values = hourMap?.get(h);
        const avg = values && values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : -1;
        grid.push({ day, hour: h, co2: avg });
      }
    }

    return { grid, days: recentDays };
  }, [data]);

  if (days.length === 0) return null;

  function cellColor(co2: number): string {
    if (co2 < 0) return '#f1f5f9';
    if (co2 < 30) return '#bbf7d0';
    if (co2 < 50) return '#86efac';
    if (co2 < 70) return '#bef264';
    if (co2 < 100) return '#fde047';
    if (co2 < 150) return '#fdba74';
    return '#fca5a5';
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <h3 className="text-base font-semibold mb-1.5 text-[#1e293b]">
        Quand l'electricite est-elle la plus propre ?
      </h3>
      <p className="text-sm text-[#64748b] mb-5">
        Intensite carbone par heure, sur les {days.length} derniers jours
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-14 mb-1">
            {hours.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[10px] text-[#94a3b8]"
              >
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day) => {
            const dayCells = grid.filter((c) => c.day === day);
            return (
              <div key={day} className="flex items-center gap-0.5 mb-[3px]">
                <span className="w-12 text-right text-[10px] text-[#94a3b8] pr-2 shrink-0">
                  {day}
                </span>
                {dayCells.map((cell) => (
                  <div
                    key={`${cell.day}-${cell.hour}`}
                    className="flex-1 h-5 rounded-[2px] transition-colors"
                    style={{ backgroundColor: cellColor(cell.co2) }}
                    title={
                      cell.co2 >= 0
                        ? `${day} ${cell.hour}h : ${Math.round(cell.co2)} gCO2/kWh`
                        : 'Pas de donnees'
                    }
                  />
                ))}
              </div>
            );
          })}

          {/* Color scale */}
          <div className="flex items-center gap-2 mt-3 ml-14 text-[10px] text-[#94a3b8]">
            <span>Propre</span>
            {[
              '#bbf7d0',
              '#86efac',
              '#bef264',
              '#fde047',
              '#fdba74',
              '#fca5a5',
            ].map((c) => (
              <div
                key={c}
                className="w-5 h-3 rounded-[2px]"
                style={{ backgroundColor: c }}
              />
            ))}
            <span>Carbone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
