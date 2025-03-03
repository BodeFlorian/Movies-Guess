# Movies Guess App

Bienvenue dans le projet **Movies Guess**, une application React pour deviner des films à partir de leurs images, construite avec Vite et utilisant l'API TMDB (The Movie Database).

[Découvrir le site web](https://movies-guess.netlify.app/)

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Fonctionnalités](#fonctionnalités)
- [Modes de jeu](#modes-de-jeu)
- [Maintenance automatique](#maintenance-automatique)
- [Technologies utilisées](#technologies-utilisées)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure recommandée) : [Télécharger Node.js](https://nodejs.org/)
- **Git** : [Télécharger Git](https://git-scm.com/)

---

## Installation

1. Clonez ce repository :

   ```bash
   git clone https://github.com/votre-utilisateur/movies-guess.git
   cd movies-guess
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Créez un fichier .env à la racine du projet, puis ajoutez votre clé API TMDB et les informations Firebase :

   ```env
   VITE_TMDB_API_KEY=votre_clé_api_tmdb
   VITE_FIREBASE_API_KEY=votre_clé_api_firebase
   VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=votre-projet
   VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   VITE_FIREBASE_APP_ID=votre_app_id
   ```

4. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

---

## Configuration

### API TMDB

Pour configurer l'API TMDB, vous devez placer votre clé API dans un fichier .env à la racine de votre projet. Cette clé sera utilisée pour récupérer les films depuis TMDB.

### Firebase

Le projet utilise Firebase pour la gestion des parties multijoueur. Vous devez configurer un projet Firebase et ajouter les variables d'environnement nécessaires dans votre fichier .env.

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez Firestore Database
3. Ajoutez les informations d'identification dans votre fichier .env

---

## Fonctionnalités

- **Mode Solo** : Jouez seul et essayez de deviner autant de films que possible
- **Mode Multijoueur** : Créez ou rejoignez une partie avec vos amis
- **Système de score** : Suivez vos performances en temps réel
- **Interface réactive** : Compatible avec tous les appareils (mobile, tablette, bureau)

---

## Modes de jeu

### Mode Solo

- Chargement aléatoire de films depuis TMDB
- Partie chronométrée
- Score enregistré localement

### Mode Multijoueur

- Création ou rejointe d'un salon avec un code unique
- Synchronisation en temps réel entre les joueurs
- Compétition pour deviner les films le plus rapidement

---

## Maintenance automatique

Le projet inclut un système de nettoyage automatique qui supprime les parties et lobbys inactifs ou terminés. Ce nettoyage est effectué via GitHub Actions, ce qui évite l'accumulation de données inutiles dans la base de données Firebase.

Pour plus d'informations sur la configuration de ce système, consultez le fichier README dans le dossier `github-actions`.

---

## Technologies utilisées

Ce projet est construit avec les technologies suivantes :

- **[React](https://react.dev/)** (v18.3) - Bibliothèque pour créer des interfaces utilisateur réactives
- **[Vite](https://vitejs.dev/)** (v6) - Outil de build ultra-rapide pour les applications modernes
- **[React Router](https://reactrouter.com/)** (v7) - Gestion des routes pour la navigation entre les pages
- **[Firebase](https://firebase.google.com/)** (v11) - Base de données en temps réel et authentification
- **[Sass](https://sass-lang.com/)** - Préprocesseur CSS pour un meilleur style et organisation
- **[ESLint](https://eslint.org/)** (v9) + **[Prettier](https://prettier.io/)** (v3) - Outils pour assurer un code propre et lisible
- **[string-similarity](https://www.npmjs.com/package/string-similarity)** - Pour comparer les chaînes de caractères
- **[vite-plugin-compression](https://www.npmjs.com/package/vite-plugin-compression)** - Pour optimiser les assets en production

L'API **[The Movie Database (TMDb)](https://www.themoviedb.org/)** est utilisée pour récupérer les informations sur les films.

---

## Développement

```bash
# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build de production
npm run preview

# Linter le code
npm run lint
```

---

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
