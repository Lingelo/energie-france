import type { FilièreKey, PlantFiliere } from '../types';

export const FILIERE_COLORS: Record<FilièreKey, string> = {
  nucleaire: '#1d4ed8',
  eolien: '#0891b2',
  solaire: '#ca8a04',
  hydraulique: '#0284c7',
  gaz: '#ea580c',
  charbon: '#6b7280',
  fioul: '#9ca3af',
  bioenergies: '#16a34a',
  pompage: '#7c3aed',
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
  Nucleaire: '#1d4ed8',
  Eolien: '#0891b2',
  Solaire: '#ca8a04',
  Hydraulique: '#0284c7',
  Gaz: '#ea580c',
  Charbon: '#6b7280',
  Bioenergies: '#16a34a',
  Stockage: '#7c3aed',
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
  if (taux < 50) return '#16a34a';
  if (taux < 100) return '#ca8a04';
  return '#dc2626';
}

export function co2Label(taux: number): string {
  if (taux < 50) return 'Bas';
  if (taux < 100) return 'Moyen';
  return 'Eleve';
}
