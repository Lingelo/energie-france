import { useState, useMemo, useCallback } from 'react';
import { useData } from './hooks/useData';
import { MapView } from './components/MapView';
import { StatsOverlay } from './components/StatsOverlay';
import { MixEvolution } from './components/MixEvolution';
import { Co2Heatmap } from './components/Co2Heatmap';
import { RegionalChart } from './components/RegionalChart';
import { YearlyTrends } from './components/YearlyTrends';
import { MixDonut } from './components/MixDonut';
import { HeroStats } from './components/HeroStats';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';
import { TabPanel } from './components/TabPanel';
import { formatCO2 } from './utils/format';
import { co2Color } from './utils/colors';
import type { PlantFiliere } from './types';

const REGION_CENTERS: Record<string, [number, number]> = {
  'Île-de-France': [48.85, 2.35],
  'Auvergne-Rhône-Alpes': [45.75, 4.85],
  'Nouvelle-Aquitaine': [45.5, 0.5],
  'Occitanie': [43.6, 2.0],
  'Hauts-de-France': [49.9, 2.8],
  'Grand Est': [48.6, 6.2],
  "Provence-Alpes-Côte d'Azur": [43.9, 6.0],
  'Pays de la Loire': [47.5, -1.0],
  'Bretagne': [48.2, -3.0],
  'Normandie': [49.1, -0.3],
  'Bourgogne-Franche-Comté': [47.0, 5.5],
  'Centre-Val de Loire': [47.5, 1.7],
};

function App() {
  const { realtime, yearly, regional, plants, loading, error } = useData();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<PlantFiliere>>(
    () => new Set(['Nucleaire', 'Hydraulique'] as PlantFiliere[])
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

  const handleRegionChange = useCallback((region: string | null) => {
    setSelectedRegion(region);
  }, []);

  const latest = useMemo(() => {
    if (realtime.length === 0) return null;
    const sorted = [...realtime].sort(
      (a, b) => new Date(b.date_heure).getTime() - new Date(a.date_heure).getTime()
    );
    return sorted.find((r) => r.consommation != null) ?? sorted[0];
  }, [realtime]);

  const visiblePlants = useMemo(() => {
    return plants.filter((p) => activeFilters.has(p.filiere)).length;
  }, [plants, activeFilters]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#e2e8f0] border-t-[#0072CE] rounded-full animate-spin mx-auto" />
          <p className="text-[#64748b]">Chargement des donnees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-white border border-[#fecaca] rounded-xl p-6 max-w-md text-center shadow-sm">
          <p className="text-[#dc2626] font-semibold mb-2">Erreur</p>
          <p className="text-[#64748b] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'mix',
      label: 'Mix',
      content: (
        <>
          <HeroStats latest={latest} />
          <MixDonut latest={latest} />
        </>
      ),
    },
    {
      id: 'evolution',
      label: 'Evolution',
      content: <MixEvolution data={realtime} />,
    },
    {
      id: 'co2',
      label: 'CO2',
      content: <Co2Heatmap data={realtime} />,
    },
    {
      id: 'regions',
      label: 'Regions',
      content: (
        <>
          <RegionalChart data={regional} selectedRegion={selectedRegion} />
          <YearlyTrends data={yearly} />
        </>
      ),
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative">
      {/* -- Slim header (glass overlay) -- */}
      <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="pointer-events-auto mx-2 mt-2 sm:mx-3 sm:mt-2.5 px-4 py-2 rounded-xl glass flex items-center justify-between gap-3">
          {/* Left: title + live dot */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-sm font-bold tracking-tight text-[#0072CE]">
              Energie France
            </h1>
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]" />
            </span>
          </div>

          {/* Center: CO2 rate + region selector */}
          <div className="flex items-center gap-3">
            <StatsOverlay latest={latest} />
            <select
              value={selectedRegion ?? ''}
              onChange={(e) => handleRegionChange(e.target.value || null)}
              className="hidden sm:block text-xs bg-white/80 border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-[#475569] focus:outline-none focus:border-[#0072CE] cursor-pointer"
            >
              <option value="">Toutes les regions</option>
              {Object.keys(REGION_CENTERS).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Right: sidebar toggle (desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 border border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b] hover:border-[#cbd5e1] transition-colors shrink-0"
          >
            {sidebarOpen ? 'Masquer' : 'Statistiques'}
          </button>
        </div>
      </header>

      {/* -- Main layout: Map + Sidebar -- */}
      <div className="flex-1 flex relative">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            plants={plants}
            activeFilters={activeFilters}
            showHeatmap={showHeatmap}
            selectedRegion={selectedRegion}
            onToggleFiliere={handleToggle}
            onToggleHeatmap={handleToggleHeatmap}
          />
        </div>

        {/* -- Desktop sidebar -- */}
        <div
          className={`
            hidden lg:flex flex-col
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-[420px]' : 'w-0 overflow-hidden'}
            bg-white border-l border-[#e2e8f0]
            shrink-0
          `}
        >
          <div className="h-full flex flex-col pt-14">
            <TabPanel tabs={tabs} defaultTab="mix" />
            <div className="shrink-0 px-5 pb-3">
              <Footer
                latestDate={latest?.date_heure ?? null}
                onAboutClick={() => setAboutOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* -- Mobile bottom sheet -- */}
      <div className="lg:hidden">
        {/* Collapsed bar */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-0 left-0 right-0 z-[1001] glass border-t border-[#e2e8f0]"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: co2Color(latest?.taux_co2 ?? 0),
                  }}
                />
                <span className="text-sm font-semibold" style={{ color: co2Color(latest?.taux_co2 ?? 0) }}>
                  {formatCO2(latest?.taux_co2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#64748b] text-xs">
                <span>{visiblePlants} centrales</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </div>
          </button>
        )}

        {/* Expanded sheet */}
        {sidebarOpen && (
          <div className="fixed inset-x-0 bottom-0 z-[1001] transition-transform duration-300 ease-in-out"
               style={{ height: '65vh' }}>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="h-full bg-white border-t border-[#e2e8f0] rounded-t-2xl flex flex-col shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
              {/* Handle + close */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-[#cbd5e1] rounded-full mx-auto" />
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-[#94a3b8] hover:text-[#1e293b] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l8 8M14 6l-8 8" />
                </svg>
              </button>

              {/* Tabbed content */}
              <div className="flex-1 min-h-0">
                <TabPanel tabs={tabs} defaultTab="mix" />
              </div>

              <div className="shrink-0 px-5 pb-3">
                <Footer
                  latestDate={latest?.date_heure ?? null}
                  onAboutClick={() => setAboutOpen(true)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default App;
