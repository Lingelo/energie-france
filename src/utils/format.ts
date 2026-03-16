/** Format MW value with appropriate unit */
export function formatPower(mw: number | null | undefined): string {
  if (mw == null) return '--';
  const abs = Math.abs(mw);
  if (abs >= 1000) {
    return `${(mw / 1000).toFixed(1)} GW`;
  }
  return `${Math.round(mw)} MW`;
}

/** Format MW value, always in MW */
export function formatMW(mw: number | null | undefined): string {
  if (mw == null) return '--';
  return `${Math.round(mw).toLocaleString('fr-FR')} MW`;
}

/** Format CO2 rate */
export function formatCO2(taux: number | null | undefined): string {
  if (taux == null) return '--';
  return `${Math.round(taux)} gCO2/kWh`;
}

/** Time ago in French */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

/** Format date for axis labels */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/** Format time HH:MM */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Format date+time */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format month name */
export function formatMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

/** Percentage */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
