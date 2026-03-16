import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { HeroStats } from './components/HeroStats';
import { MixDonut } from './components/MixDonut';
import { MixEvolution } from './components/MixEvolution';
import { Co2Heatmap } from './components/Co2Heatmap';
import { YearlyTrends } from './components/YearlyTrends';
import { RegionalChart } from './components/RegionalChart';
import { AboutModal } from './components/AboutModal';
import { Footer } from './components/Footer';

function App() {
  const { realtime, yearly, regional, loading, error } = useData();
  const [aboutOpen, setAboutOpen] = useState(false);

  const latest = useMemo(() => {
    if (realtime.length === 0) return null;
    // Find the most recent record with actual data
    const sorted = [...realtime].sort(
      (a, b) => new Date(b.date_heure).getTime() - new Date(a.date_heure).getTime()
    );
    return sorted.find((r) => r.consommation != null) ?? sorted[0];
  }, [realtime]);

  // Combine realtime + yearly for heatmap (more data = more days)
  const heatmapData = useMemo(() => {
    const all = [...yearly, ...realtime];
    // Deduplicate by date_heure
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#334155] border-t-[#8b5cf6] rounded-full animate-spin mx-auto" />
          <p className="text-[#94a3b8]">Chargement des donnees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#1e293b] border border-[#ef4444]/30 rounded-xl p-6 max-w-md text-center">
          <p className="text-[#ef4444] font-semibold mb-2">Erreur</p>
          <p className="text-[#94a3b8] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Energie France
            </h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e]" />
            </span>
          </div>
          <p className="text-[#94a3b8] text-lg">
            Production electrique, consommation et emissions CO2 en temps reel
          </p>
        </header>

        {/* Section 1: Stats + Donut */}
        <section className="space-y-6 mb-12">
          <HeroStats latest={latest} />
          <MixDonut latest={latest} />
        </section>

        {/* Section 2: Mix evolution */}
        <section className="mb-12">
          <MixEvolution data={realtime} />
        </section>

        {/* Section 3: CO2 Heatmap */}
        <section className="mb-12">
          <Co2Heatmap data={heatmapData} />
        </section>

        {/* Section 4: Yearly trends */}
        <section className="mb-12">
          <YearlyTrends data={yearly} />
        </section>

        {/* Section 5: Regions */}
        <section className="mb-12">
          <RegionalChart data={regional} />
        </section>

        {/* Footer */}
        <Footer
          latestDate={latest?.date_heure ?? null}
          onAboutClick={() => setAboutOpen(true)}
        />
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default App;
