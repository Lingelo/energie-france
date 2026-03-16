import { useState, useEffect } from 'react';
import type { DataState, EnergyRecord, RegionalRecord, PowerPlant } from '../types';

const BASE = import.meta.env.BASE_URL;

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    realtime: [],
    yearly: [],
    regional: [],
    plants: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const [realtimeRes, yearlyRes, regionalRes, plantsRes] = await Promise.all([
          fetch(`${BASE}data/realtime.json`),
          fetch(`${BASE}data/yearly.json`),
          fetch(`${BASE}data/regional.json`),
          fetch(`${BASE}data/plants.json`),
        ]);

        if (!realtimeRes.ok || !yearlyRes.ok || !regionalRes.ok) {
          throw new Error('Erreur lors du chargement des donnees');
        }

        const [realtime, yearly, regional] = await Promise.all([
          realtimeRes.json() as Promise<EnergyRecord[]>,
          yearlyRes.json() as Promise<EnergyRecord[]>,
          regionalRes.json() as Promise<RegionalRecord[]>,
        ]);

        // Plants data is optional — don't fail if missing
        let plants: PowerPlant[] = [];
        if (plantsRes.ok) {
          plants = await plantsRes.json() as PowerPlant[];
        }

        setState({ realtime, yearly, regional, plants, loading: false, error: null });
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Erreur inconnue',
        }));
      }
    }

    load();
  }, []);

  return state;
}
