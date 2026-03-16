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
    <div className="flex flex-wrap gap-1.5 items-center">
      {/* Heatmap toggle */}
      <button
        onClick={onToggleHeatmap}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border"
        style={{
          background: showHeatmap ? '#ef444433' : '#0f172a',
          borderColor: showHeatmap ? '#ef4444' : '#334155',
          color: showHeatmap ? '#fca5a5' : '#64748b',
        }}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" opacity="0.3" />
          <circle cx="12" cy="12" r="6" opacity="0.6" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Heatmap
      </button>

      <span className="w-px h-5 bg-slate-700 mx-0.5 hidden sm:block" />

      {/* Filiere filters */}
      {PLANT_FILIERES.map((f) => {
        const isActive = active.has(f);
        const color = PLANT_COLORS[f];
        return (
          <button
            key={f}
            onClick={() => onToggle(f)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={{
              background: isActive ? `${color}22` : '#0f172a',
              borderColor: isActive ? color : '#334155',
              color: isActive ? '#f1f5f9' : '#64748b',
              opacity: isActive ? 1 : 0.6,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: isActive ? color : '#475569' }}
            />
            <span className="hidden sm:inline">{f}</span>
            <span className="sm:hidden">{f.slice(0, 3)}</span>
          </button>
        );
      })}
    </div>
  );
}
