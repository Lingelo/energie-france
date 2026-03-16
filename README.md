# Energie France

Tableau de bord de la production electrique, consommation et emissions CO2 en France metropolitaine.

Visualise les donnees eCO2mix de RTE : mix energetique en temps reel, evolution sur 7 jours, heatmap CO2 horaire, tendances annuelles et repartition regionale.

## Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4 (dark theme)
- Recharts (graphiques)
- Donnees : ODRE (Open Data Reseaux Energies), API Opendatasoft v2.1, sans authentification

## Commandes

```bash
npm run dev          # Serveur de dev (http://localhost:5173/energie-france/)
npm run build        # tsc -b && vite build -> dist/
npm run lint         # ESLint
npm run preview      # Preview du build

node scripts/fetch-data.mjs   # Pipeline de donnees (realtime + yearly + regional)
```

## Pipeline de donnees

Le script `scripts/fetch-data.mjs` recupere trois jeux de donnees depuis l'API ODRE :

| Fichier | Source | Contenu |
|---------|--------|---------|
| `public/data/realtime.json` | eco2mix-national-tr | 7 derniers jours, tous les points (~700-900 records) |
| `public/data/yearly.json` | eco2mix-national-cons-def | 365 derniers jours, 1 point/jour a midi (~350 records) |
| `public/data/regional.json` | eco2mix-regional-tr | 24 dernieres heures par region (~2000 records) |

Les donnees sont mises a jour automatiquement toutes les 6 heures via GitHub Actions.

## Deploiement

GitHub Pages via deux workflows :
- `deploy.yml` : build + deploy sur push main
- `update-data.yml` : cron toutes les 6h, fetch data, commit si changes, build + deploy

## Licence des donnees

Les donnees eCO2mix sont publiees par RTE sous [Licence Ouverte v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).
