import { useState, useMemo, useCallback } from 'react';
import { useData } from './hooks/useData';
import { MapView } from './components/MapView';
import { MapFilters } from './components/MapFilters';
import { StatsOverlay } from './components/StatsOverlay';
import { MixEvolution } from './components/MixEvolution';
import { Co2Heatmap } from './components/Co2Heatmap';
import { RegionalChart } from './components/RegionalChart';
import { YearlyTrends } from './components/YearlyTrends';
import { MixDonut } from './components/MixDonut';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { PLANT_FILIERES } from './utils/colors';
import type { PlantFiliere } from './types';

function App() {
  const { realtime, yearly, regional, plants, loading, error } = useData();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All filieres active by default
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<PlantFiliere>>(
    () => new Set(PLANT_FILIERES)
  );

  const handleToggleHeatmap = useCallback(() => {
    setShowHeatmap((prev) => !prev);
  }, []);

  const handleToggle = useCallback((filiere: PlantFiliere) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filiere)) next.delete(filiere);
      else next.add(filiere);
      return next;
    });
  }, []);

  const latest = useMemo(() => {
    if (realtime.length === 0) return null;
    const sorted = [...realtime].sort(
      (a, b) => new Date(b.date_heure).getTime() - new Date(a.date_heure).getTime()
    );
    return sorted.find((r) => r.consommation != null) ?? sorted[0];
  }, [realtime]);

  const heatmapData = useMemo(() => {
    const all = [...yearly, ...realtime];
    const map = new Map<string, (typeof all)[0]>();
    for (const r of all) {
      map.set(r.date_heure, r);
    }
    return [...map.values()].sort(
      (a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()
    );
  }, [realtime, yearly]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#334155] border-t-[#8b5cf6] rounded-full animate-spin mx-auto" />
          <p className="text-[#94a3b8]">Chargement des donnees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="bg-[#1e293b] border border-[#ef4444]/30 rounded-xl p-6 max-w-md text-center">
          <p className="text-[#ef4444] font-semibold mb-2">Erreur</p>
          <p className="text-[#94a3b8] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative">
      {/* ── Top stats bar (glass overlay) ── */}
      <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="pointer-events-auto mx-2 mt-2 sm:mx-4 sm:mt-3 px-4 py-2.5 rounded-xl glass-dark flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#f1f5f9]">
              Energie France
            </h1>
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
            </span>
          </div>
          <StatsOverlay latest={latest} />
          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e293b]/80 border border-[#334155] text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#475569] transition-colors shrink-0"
          >
            {sidebarOpen ? 'Masquer' : 'Statistiques'}
          </button>
        </div>
      </header>

      {/* ── Map filters (top-left, below header) ── */}
      <div className="absolute top-14 sm:top-16 left-2 sm:left-4 z-[1000] pointer-events-auto">
        <div className="glass-dark rounded-xl px-3 py-2">
          <MapFilters active={activeFilters} onToggle={handleToggle} showHeatmap={showHeatmap} onToggleHeatmap={handleToggleHeatmap} />
        </div>
      </div>

      {/* ── Mobile bottom sheet toggle ── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-[1001] px-4 py-2.5 rounded-xl glass-dark border border-[#334155] text-sm font-medium text-[#f1f5f9] shadow-lg"
      >
        {sidebarOpen ? 'Carte' : 'Statistiques'}
      </button>

      {/* ── Main layout: Map + Sidebar ── */}
      <div className="flex-1 flex relative">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView plants={plants} activeFilters={activeFilters} showHeatmap={showHeatmap} />
        </div>

        {/* ── Right sidebar (desktop) / Bottom sheet (mobile) ── */}
        <div
          className={`
            fixed lg:relative z-[1000]
            transition-transform duration-300 ease-in-out
            ${sidebarOpen
              ? 'translate-x-0 lg:translate-x-0 translate-y-0'
              : 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden translate-y-full lg:translate-y-0'
            }
            inset-0 lg:inset-auto
            lg:w-96 lg:shrink-0
            bg-[#0f172a]/95 lg:bg-[#0f172a]
            backdrop-blur-md lg:backdrop-blur-none
            lg:border-l lg:border-[#334155]
          `}
        >
          <div className="h-full overflow-y-auto overscroll-contain p-4 pt-16 lg:pt-20 space-y-6">
            {/* Close button (mobile) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-[#f1f5f9]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>

            <MixDonut latest={latest} />
            <MixEvolution data={realtime} />
            <Co2Heatmap data={heatmapData} />
            <YearlyTrends data={yearly} />
            <RegionalChart data={regional} />

            <Footer
              latestDate={latest?.date_heure ?? null}
              onAboutClick={() => setAboutOpen(true)}
            />
          </div>
        </div>
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default App;
