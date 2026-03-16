import type { FilièreKey } from '../types';

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
