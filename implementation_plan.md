# Roadmap d'Amélioration Filmieo vs Qeseh.net

Ce plan détaille les améliorations fonctionnelles et architecturales nécessaires pour aligner progressivement l'application Filmieo sur les fonctionnalités riches de la plateforme web `qeseh.net`, tout en respectant les contraintes strictes (Firebase + Expo Router existant).

## User Review Required

> [!IMPORTANT]
> Les fondations backend pour scraper les épisodes et les séries sont maintenant stabilisées.
> Pour franchir la prochaine étape, veuillez valider cette feuille de route. Nous procéderons étape par étape (fonctionnalité par fonctionnalité) pour garantir la stabilité sans jamais casser l'existant.

## Fonctionnalités Manquantes Prioritaires (Écart avec qeseh.net)

Voici ce qui manque actuellement dans Filmieo par rapport à l'expérience web complète de `qeseh.net` :

1. **Films (Movies) et Catégories**
   - *Actuel* : L'application est uniquement orientée "Séries" et "Épisodes Récents".
   - *Qeseh.net* : Dispose de sections dédiées aux films, aux genres (Action, Drame, etc.) et aux années de sortie.
2. **Historique et Reprise de Lecture**
   - *Actuel* : Si l'utilisateur quitte l'application, il perd le suivi de son visionnage.
   - *Qeseh.net* : Utilise des cookies/comptes pour retenir où l'utilisateur s'est arrêté. Nous pourrions utiliser le stockage local (`AsyncStorage`) pour un "Continuer à regarder".
3. **Favoris (Ma Liste)**
   - *Actuel* : Impossible de sauvegarder une série.
   - *Qeseh.net* : Permet d'épingler ses séries préférées.
4. **Suggestions et Séries Similaires**
   - *Actuel* : La page `[slug].tsx` affiche les épisodes mais aucune suggestion (cross-sell).
   - *Qeseh.net* : Affiche un carrousel de séries similaires en bas de page pour augmenter la rétention.
5. **Onglets de Navigation (Bottom Tabs) Améliorés**
   - *Actuel* : Seulement "Accueil", "Recherche", et "Admin".
   - *Idéal* : Accueil, Recherche, **Catégories**, **Ma Liste**.

## Améliorations Proposées (Plan d'Implémentation)

Nous mettrons en place ces améliorations sans ajouter aucune dépendance externe, en exploitant uniquement Firebase et Expo Router.

### Phase 1 : Consolidation de l'Accueil et des Données (Backend + UI)
- [ ] **Section "Films"** : Ajouter un scraper pour `https://qeseh.net/category/aflam/` et un endpoint Firebase `latestMovies`.
- [ ] **Carrousels Multiples (Accueil)** : Transformer `app/(tabs)/index.tsx` pour afficher un layout riche :
  - "Épisodes récents" (Horizontal)
  - "Dernières séries ajoutées" (Horizontal)
  - "Films populaires" (Horizontal)
- [ ] **Refonte UI de l'Accueil** : Ajouter des dégradés, un meilleur contraste (Dark Mode Premium), et des animations fluides lors du scroll.

### Phase 2 : Catégories et Navigation
- [ ] **Nouvel onglet Catégories** (`app/(tabs)/categories.tsx`) : Permettre la navigation par genre (Turc, Arabe, Drame, Comédie).
- [ ] **Scraping par Catégorie** : Créer un endpoint Firebase `/getCategory?genre=xyz` pour paginer les résultats.

### Phase 3 : Rétention Utilisateur (Favoris & Historique)
- [ ] **Création du Hook `useHistory`** : Utiliser `AsyncStorage` (déjà présent via React Native) pour sauvegarder les derniers épisodes visionnés.
- [ ] **Création du Hook `useFavorites`** : Permettre à l'utilisateur de cliquer sur un "Cœur" dans la page Série pour l'ajouter à une liste locale.
- [ ] **Onglet "Ma Liste"** : Un nouvel écran listant l'historique et les favoris.

### Phase 4 : Expérience Vidéo Premium
- [ ] **Gestion des Erreurs Lecteur** : Si un serveur vidéo est mort (404), proposer un bouton "Serveur suivant" qui change dynamiquement l'URL de l'iframe sans recharger l'écran.
- [ ] **Mode Plein Écran Natif** : S'assurer que le bouton plein écran des iframes verrouille bien l'orientation du téléphone en mode paysage.

## Prochaine Étape
Si cette roadmap vous convient, nous commencerons immédiatement par la **Phase 1** : la refonte de la page d'accueil avec l'intégration des "Dernières Séries" et "Films" sous forme de carrousels modernes.
