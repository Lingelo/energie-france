import type { PlantFiliere } from '../types';
import { PLANT_COLORS, PLANT_FILIERES } from '../utils/colors';

interface Props {
  active: Set<PlantFiliere>;
  onToggle: (filiere: PlantFiliere) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

export function MapFilters({ active, onToggle, showHeatmap, onToggleHeatmap }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#64748b]">Filtres carte</h4>
        <button
          onClick={onToggleHeatmap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
          style={{
            background: showHeatmap ? '#dc26260a' : 'transparent',
            borderColor: showHeatmap ? '#dc2626' : '#e2e8f0',
            color: showHeatmap ? '#dc2626' : '#64748b',
          }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.3" />
            <circle cx="12" cy="12" r="6" opacity="0.6" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Heatmap
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PLANT_FILIERES.map((f) => {
          const isActive = active.has(f);
          const color = PLANT_COLORS[f];
          return (
            <button
              key={f}
              onClick={() => onToggle(f)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all border"
              style={{
                background: isActive ? `${color}0a` : 'transparent',
                borderColor: isActive ? `${color}40` : '#e2e8f0',
                color: isActive ? '#1e293b' : '#94a3b8',
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 transition-all"
                style={{
                  background: isActive ? color : '#cbd5e1',
                }}
              />
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}
