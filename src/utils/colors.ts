import type { FilièreKey, PlantFiliere } from '../types';

export const FILIERE_COLORS: Record<FilièreKey, string> = {
  nucleaire: '#3b82f6',
  eolien: '#06b6d4',
  solaire: '#eab308',
  hydraulique: '#0ea5e9',
  gaz: '#f97316',
  charbon: '#ef4444',
  fioul: '#dc2626',
  bioenergies: '#22c55e',
  pompage: '#a855f7',
};

export const FILIERE_LABELS: Record<FilièreKey, string> = {
  nucleaire: 'Nucleaire',
  eolien: 'Eolien',
  solaire: 'Solaire',
  hydraulique: 'Hydraulique',
  gaz: 'Gaz',
  charbon: 'Charbon',
  fioul: 'Fioul',
  bioenergies: 'Bioenergies',
  pompage: 'Pompage',
};

export const FILIERE_KEYS: FilièreKey[] = [
  'nucleaire',
  'hydraulique',
  'eolien',
  'solaire',
  'bioenergies',
  'gaz',
  'fioul',
  'charbon',
  'pompage',
];

export const PLANT_COLORS: Record<PlantFiliere, string> = {
  Nucleaire: '#3b82f6',
  Eolien: '#06b6d4',
  Solaire: '#eab308',
  Hydraulique: '#0ea5e9',
  Gaz: '#f97316',
  Charbon: '#ef4444',
  Bioenergies: '#22c55e',
  Stockage: '#a855f7',
};

export const PLANT_FILIERES: PlantFiliere[] = [
  'Nucleaire',
  'Eolien',
  'Solaire',
  'Hydraulique',
  'Gaz',
  'Charbon',
  'Bioenergies',
  'Stockage',
];

export function co2Color(taux: number): string {
  if (taux < 50) return '#22c55e';
  if (taux < 100) return '#eab308';
  return '#ef4444';
}

export function co2Label(taux: number): string {
  if (taux < 50) return 'Bas';
  if (taux < 100) return 'Moyen';
  return 'Eleve';
}
