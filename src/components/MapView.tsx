import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no types for leaflet.heat
import 'leaflet.heat';
import type { PowerPlant, PlantFiliere } from '../types';
import { PLANT_COLORS, PLANT_FILIERES } from '../utils/colors';

const REGION_CENTERS: Record<string, [number, number]> = {
  'Ile-de-France': [48.85, 2.35],
  'Auvergne-Rhone-Alpes': [45.75, 4.85],
  'Nouvelle-Aquitaine': [45.5, 0.5],
  'Occitanie': [43.6, 2.0],
  'Hauts-de-France': [49.9, 2.8],
  'Grand Est': [48.6, 6.2],
  "Provence-Alpes-Cote d'Azur": [43.9, 6.0],
  'Pays de la Loire': [47.5, -1.0],
  'Bretagne': [48.2, -3.0],
  'Normandie': [49.1, -0.3],
  'Bourgogne-Franche-Comte': [47.0, 5.5],
  'Centre-Val de Loire': [47.5, 1.7],
};

interface Props {
  plants: PowerPlant[];
  activeFilters: Set<PlantFiliere>;
  showHeatmap: boolean;
  selectedRegion: string | null;
}

const MIN_CAPACITY_MW = 1;

// Marker radius based on capacity (log scale), clamped
function markerRadius(capacity: number | null, filiere: PlantFiliere): number {
  if (filiere === 'Nucleaire') {
    return capacity ? Math.max(10, Math.min(20, 6 + Math.log10(capacity + 1) * 4)) : 12;
  }
  if (!capacity || capacity <= 0) return 4;
  return Math.max(3, Math.min(12, 2 + Math.log10(capacity + 1) * 3));
}

// Cluster layer for small installations (solar, wind, biomass, etc.)
function ClusterLayer({ plants, filiere }: { plants: PowerPlant[]; filiere: PlantFiliere }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const color = PLANT_COLORS[filiere];

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 35,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 12,
      iconCreateFunction(c) {
        const count = c.getChildCount();
        const size = count > 100 ? 40 : count > 10 ? 32 : 24;
        return L.divIcon({
          html: `<div style="
            background: #ffffff;
            border: 2px solid ${color};
            color: #1e293b;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size > 32 ? 12 : 10}px;
            font-weight: 600;
            box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          ">${count}</div>`,
          className: '',
          iconSize: L.point(size, size),
        });
      },
    });

    for (const p of plants) {
      const r = markerRadius(p.capacity, p.filiere);
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: r,
        fillColor: color,
        fillOpacity: 0.6,
        color: color,
        weight: 1,
        opacity: 0.8,
      });
      marker.bindPopup(buildPopupContent(p), {
        maxWidth: 260,
      });
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map, plants, filiere]);

  return null;
}

function buildPopupContent(p: PowerPlant): string {
  const color = PLANT_COLORS[p.filiere];
  return `
    <div style="font-family: Inter, system-ui, sans-serif; color: #1e293b; font-size: 13px; line-height: 1.5;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
        ${p.name ?? 'Centrale sans nom'}
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
        <span>${p.filiere}</span>
      </div>
      ${p.capacity != null ? `<div>Capacite : <strong>${p.capacity >= 1000 ? (p.capacity / 1000).toFixed(1) + ' GW' : Math.round(p.capacity) + ' MW'}</strong></div>` : ''}
      ${p.operator ? `<div style="color: #64748b; font-size: 12px; margin-top: 2px;">${p.operator}</div>` : ''}
    </div>
  `;
}

// Nuclear plants rendered directly (no clustering) since there are ~20
function NuclearMarkers({ plants }: { plants: PowerPlant[] }) {
  const color = PLANT_COLORS.Nucleaire;
  return (
    <>
      {plants.map((p, i) => (
        <CircleMarker
          key={`nuc-${i}`}
          center={[p.lat, p.lng]}
          radius={markerRadius(p.capacity, p.filiere)}
          fillColor={color}
          fillOpacity={0.75}
          color="#ffffff"
          weight={2}
          opacity={0.9}
        >
          <Popup maxWidth={260}>
            <div dangerouslySetInnerHTML={{ __html: buildPopupContent(p) }} />
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

// Heatmap layer based on production capacity
function HeatmapLayer({ plants }: { plants: PowerPlant[] }) {
  const map = useMap();
  const heatRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    const points: [number, number, number][] = plants
      .filter(p => p.capacity != null && p.capacity > 0)
      .map(p => [p.lat, p.lng, Math.log10((p.capacity ?? 1) + 1) * 0.3]);

    // @ts-expect-error leaflet.heat extends L
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 10,
      max: 1.5,
      gradient: {
        0.0: '#f8fafc',
        0.2: '#bfdbfe',
        0.4: '#0284c7',
        0.6: '#16a34a',
        0.8: '#ca8a04',
        1.0: '#dc2626',
      },
    });

    heat.addTo(map);
    heatRef.current = heat;

    return () => {
      if (heatRef.current) map.removeLayer(heatRef.current);
    };
  }, [map, plants]);

  return null;
}

// Fly to selected region
function FlyToRegion({ region }: { region: string | null }) {
  const map = useMap();
  const prevRegion = useRef<string | null>(null);

  useEffect(() => {
    if (region && region !== prevRegion.current) {
      const center = REGION_CENTERS[region];
      if (center) {
        map.flyTo(center, 8, { duration: 1.2 });
      }
    } else if (!region && prevRegion.current) {
      map.flyTo([46.8, 2.5], 6, { duration: 1.2 });
    }
    prevRegion.current = region;
  }, [map, region]);

  return null;
}

// Legend overlay for the map
function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl px-3 py-2.5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {PLANT_FILIERES.map((f) => (
          <div key={f} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: PLANT_COLORS[f] }}
            />
            <span className="text-[#475569]">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapView({ plants, activeFilters, showHeatmap, selectedRegion }: Props) {
  const filtered = useMemo(() => {
    return plants.filter((p) => {
      if (!activeFilters.has(p.filiere)) return false;
      if (p.filiere !== 'Nucleaire' && p.capacity != null && p.capacity < MIN_CAPACITY_MW) return false;
      return true;
    });
  }, [plants, activeFilters]);

  const nuclear = useMemo(() => filtered.filter((p) => p.filiere === 'Nucleaire'), [filtered]);
  const clustered = useMemo(() => {
    const byFiliere = new Map<PlantFiliere, PowerPlant[]>();
    for (const p of filtered) {
      if (p.filiere === 'Nucleaire') continue;
      const arr = byFiliere.get(p.filiere);
      if (arr) arr.push(p);
      else byFiliere.set(p.filiere, [p]);
    }
    return byFiliere;
  }, [filtered]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[46.8, 2.5]}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <FlyToRegion region={selectedRegion} />
        {showHeatmap && <HeatmapLayer plants={filtered} />}
        {!showHeatmap && (
          <>
            <NuclearMarkers plants={nuclear} />
            {[...clustered.entries()].map(([filiere, plants]) => (
              <ClusterLayer key={filiere} plants={plants} filiere={filiere} />
            ))}
          </>
        )}
      </MapContainer>
      <MapLegend />
    </div>
  );
}
