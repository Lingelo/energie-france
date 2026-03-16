import { useState } from 'react';
import type { PlantFiliere } from '../types';
import { PLANT_COLORS, PLANT_FILIERES } from '../utils/colors';

interface Props {
  active: Set<PlantFiliere>;
  onToggle: (filiere: PlantFiliere) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

export function MapFilters({ active, onToggle, showHeatmap, onToggleHeatmap }: Props) {
  const [hoveredFiliere, setHoveredFiliere] = useState<string | null>(null);

  return (
    <div className="absolute bottom-14 right-4 z-[1000] glass rounded-xl px-2 py-1.5 flex items-center gap-1.5">
      {PLANT_FILIERES.map((f) => {
        const isActive = active.has(f);
        const color = PLANT_COLORS[f];
        return (
          <div key={f} className="relative">
            <button
              onClick={() => onToggle(f)}
              onMouseEnter={() => setHoveredFiliere(f)}
              onMouseLeave={() => setHoveredFiliere(null)}
              className="w-5 h-5 rounded-full transition-all flex items-center justify-center"
              style={{
                background: isActive ? color : '#cbd5e1',
                opacity: isActive ? 1 : 0.4,
                boxShadow: isActive ? `0 0 0 2px white, 0 0 0 3.5px ${color}` : 'none',
              }}
              aria-label={f}
            />
            {hoveredFiliere === f && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-white bg-[#1e293b] whitespace-nowrap pointer-events-none">
                {f}
              </span>
            )}
          </div>
        );
      })}

      {/* Separator */}
      <div className="w-px h-4 bg-[#e2e8f0] mx-0.5" />

      {/* Heatmap toggle */}
      <div className="relative">
        <button
          onClick={onToggleHeatmap}
          onMouseEnter={() => setHoveredFiliere('heatmap')}
          onMouseLeave={() => setHoveredFiliere(null)}
          className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
          style={{
            background: showHeatmap ? '#dc2626' : '#cbd5e1',
            opacity: showHeatmap ? 1 : 0.4,
            boxShadow: showHeatmap ? '0 0 0 2px white, 0 0 0 3.5px #dc2626' : 'none',
          }}
          aria-label="Heatmap CO2"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="10" opacity="0.3" />
            <circle cx="12" cy="12" r="6" opacity="0.6" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        {hoveredFiliere === 'heatmap' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-white bg-[#1e293b] whitespace-nowrap pointer-events-none">
            Heatmap CO2
          </span>
        )}
      </div>
    </div>
  );
}
