<div align="center">
  
  #  Filmeio

  **Votre plateforme de streaming ultime (Web & Mobile)**

  [![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## 📖 À propos du projet

**Filmeio** est une application moderne, rapide et multiplateforme qui permet aux utilisateurs de découvrir, de rechercher et de regarder leurs séries et films préférés. 

Dotée d'une interface utilisateur élégante et fluide, Filmeio propose une expérience utilisateur premium. Le projet est alimenté par un backend robuste basé sur Firebase Cloud Functions qui s'occupe de l'agrégation de contenu en temps réel.

### ✨ Fonctionnalités principales :
- **Exploration de contenu :** Parcourez les derniers épisodes et les séries du moment.
- **Moteur de recherche intelligent :** Trouvez rapidement la série que vous désirez.
- **Favoris :** Sauvegardez vos séries et films préférés pour y accéder en un clic.
- **Historique de visionnage :** Reprenez la lecture exactement là où vous vous étiez arrêté.
- **Cross-platform :** Disponible sur Android, iOS et sur le Web.

---

## 🚀 Tester l'application

Vous pouvez tester Filmeio dès maintenant sans rien installer, ou télécharger la version mobile Android :

🌍 **Version Web :** [filmeio.expo.app](https://filmeio.expo.app)  
📱 **Version Android (APK) :** [Télécharger sur Google Drive](https://drive.google.com/444m)

---

## 🛠️ Technologies utilisées

- **Frontend :** React Native 0.76, Expo SDK 52, Expo Router
- **Backend :** Firebase Functions v2, Firestore (Cache)
- **Langage :** TypeScript
- **Web Scraping :** Cheerio
- **Styles :** Expo, Design System sur-mesure
- **Icônes :** Ionicons (@expo/vector-icons)

---

## 💻 Installation en local

Si vous souhaitez faire tourner le projet sur votre propre machine, suivez ces instructions.

### 1. Cloner et installer les dépendances

Assurez-vous d'avoir Node.js installé. Dans Windows PowerShell, lancez :

```bash
# Installation des dépendances front-end
npm install

# Installation des dépendances back-end
npm --prefix backend/functions install
```

### 2. Démarrer le Backend Firebase (Local)

Pour tester l'application avec des données, vous devez lancer les émulateurs Firebase :

```bash
npm run backend:build
npm run backend:serve
```

L'API sera disponible sur `http://localhost:5001/filmieo-mock/us-central1`.
*(Pensez à configurer votre fichier `.env` avec cette URL dans la variable `EXPO_PUBLIC_API_BASE_URL`)*.

### 3. Démarrer l'application (Frontend)

```bash
# Lancer le serveur de développement Expo
npm run start

# Ou lancer directement la version web
npm run web

# Construire/lancer sur Android (Bare workflow / Prebuild)
npx expo run:android -d
```

---

## 📡 API Endpoints (Backend)

Le backend offre plusieurs points d'entrée sécurisés :
- `GET /latestSeries` : Récupère les séries récentes.
- `GET /latestEpisodes` : Récupère les derniers épisodes.
- `GET /searchSeries?q=<query_text>` : Recherche.
- `GET /getSeries?slug=<series_slug>` : Détails d'une série.
- `GET /getEpisode?slug=<episode_slug>` : Détails d'un épisode (et lecteurs vidéo).
- `GET /proxyHtml?url=<target_url>` : Contournement CORS pour le web.

---

<div align="center">
  <i>Développé avec passion 💻🎬</i>
</div>
