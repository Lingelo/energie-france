import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no types for leaflet.heat
import 'leaflet.heat';
import type { PowerPlant, PlantFiliere } from '../types';
import { PLANT_COLORS } from '../utils/colors';

interface Props {
  plants: PowerPlant[];
  activeFilters: Set<PlantFiliere>;
  showHeatmap: boolean;
}

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
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction(c) {
        const count = c.getChildCount();
        const size = count > 100 ? 40 : count > 10 ? 32 : 24;
        return L.divIcon({
          html: `<div style="
            background: ${color}33;
            border: 2px solid ${color};
            color: #fff;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size > 32 ? 12 : 10}px;
            font-weight: 600;
            box-shadow: 0 0 8px ${color}66;
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
        fillOpacity: 0.7,
        color: color,
        weight: 1,
        opacity: 0.9,
      });
      marker.bindPopup(buildPopupContent(p), {
        className: 'dark-popup',
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
    <div style="font-family: Inter, system-ui, sans-serif; color: #f1f5f9; font-size: 13px; line-height: 1.5;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
        ${p.name ?? 'Centrale sans nom'}
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
        <span>${p.filiere}</span>
      </div>
      ${p.capacity != null ? `<div>Capacite : <strong>${p.capacity >= 1000 ? (p.capacity / 1000).toFixed(1) + ' GW' : Math.round(p.capacity) + ' MW'}</strong></div>` : ''}
      ${p.operator ? `<div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">${p.operator}</div>` : ''}
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
          fillOpacity={0.8}
          color="#fff"
          weight={2}
          opacity={0.9}
        >
          <Popup className="dark-popup" maxWidth={260}>
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
        0.0: '#0f172a',
        0.2: '#1e3a5f',
        0.4: '#0ea5e9',
        0.6: '#22c55e',
        0.8: '#eab308',
        1.0: '#ef4444',
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

export function MapView({ plants, activeFilters, showHeatmap }: Props) {
  const filtered = useMemo(() => {
    return plants.filter((p) => activeFilters.has(p.filiere));
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
    <MapContainer
      center={[46.8, 2.5]}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
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
  );
}
