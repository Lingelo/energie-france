export type FilièreKey =
  | 'nucleaire'
  | 'eolien'
  | 'solaire'
  | 'hydraulique'
  | 'gaz'
  | 'charbon'
  | 'fioul'
  | 'bioenergies'
  | 'pompage';

export interface EnergyRecord {
  date_heure: string;
  consommation: number | null;
  nucleaire: number | null;
  eolien: number | null;
  solaire: number | null;
  hydraulique: number | null;
  gaz: number | null;
  fioul: number | null;
  charbon: number | null;
  bioenergies: number | null;
  pompage: number | null;
  taux_co2: number | null;
  ech_physiques: number | null;
}

export interface RegionalRecord {
  code_insee_region: string;
  libelle_region: string;
  date_heure: string;
  consommation: number | null;
  thermique: number | null;
  nucleaire: number | null;
  eolien: number | null;
  solaire: number | null;
  hydraulique: number | null;
  bioenergies: number | null;
  pompage: number | null;
}

export interface DataState {
  realtime: EnergyRecord[];
  yearly: EnergyRecord[];
  regional: RegionalRecord[];
  loading: boolean;
  error: string | null;
}
