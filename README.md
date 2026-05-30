# Filmieo

Projet Expo SDK 52 avec une application mobile/web minimaliste et un backend Firebase Cloud Functions.

## Stack

- Expo SDK 52
- Expo Router
- React Native 0.76
- TypeScript
- Firebase Functions v2
- Firestore cache
- Cheerio pour parser les pages HTML cote backend

## Installation

Les dependances sont deja installees dans ce dossier. Sur Windows PowerShell, utilise `npm.cmd` si `npm` est bloque par la politique d'execution.

```powershell
npm.cmd install
npm.cmd --prefix backend/functions install
```

## Lancer l'application

```powershell
npm.cmd run start
```

Pour le web:

```powershell
npm.cmd run web
```

## Backend Firebase local

```powershell
npm.cmd run backend:build
npm.cmd run backend:serve
```

URL locale:

```text
http://localhost:5001/filmieo-mock/us-central1
```

Sur un telephone physique Expo Go, remplace `localhost` par l'adresse IP locale de ton ordinateur:

```text
http://<HOST_IP>:5001/filmieo-mock/us-central1
```

Puis cree un fichier `.env` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env
```

Et modifie:

```text
EXPO_PUBLIC_API_BASE_URL=http://<HOST_IP>:5001/filmieo-mock/us-central1
```

## Endpoints inclus

- `GET /latestSeries`
- `GET /latestEpisodes`
- `GET /searchSeries?q=<query_text>`
- `GET /getSeries?slug=<series_slug>`
- `GET /getEpisode?slug=<episode_slug>`
- `GET /proxyHtml?url=<target_url>`
- `GET /scrapeCron`

## Verification

Commandes passees:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd --prefix backend/functions run build
npx.cmd expo export --platform web
```

## Notes de production

- Garde le scraping et le proxy cote backend pour eviter d'exposer cette logique au client.
- `proxyHtml` limite volontairement les domaines autorises.
- Les lecteurs video sont filtres par domaines autorises dans `backend/functions/src/index.ts`.
- Utilise uniquement des sources et serveurs pour lesquels tu as les droits necessaires.
