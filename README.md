# Movie Guess App

Bienvenue dans le projet **Movie Guess**, une application React pour deviner des films à partir de leurs images, construite avec Vite et utilisant l'API TMDB (The Movie Database).

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Technologies utilisées](#technologies-utilisées)
- [Licence](#licence)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 16 ou supérieure) : [Télécharger Node.js](https://nodejs.org/)
- **Git** : [Télécharger Git](https://git-scm.com/)

---

## Installation

1. Clonez ce repository :

   ```bash
    git clone https://votre-repository-url.git
    cd votre-dossier
   ```

2. Installez les dépendances :

   ```bash
    npm install
   ```

3. Créez un fichier .env à la racine du projet, puis ajoutez votre clé API TMDB. Vous pouvez obtenir cette clé en vous inscrivant sur TMDB et en la générant dans vos paramètres.

   ```env
   VITE_TMDB_API_KEY=votre_clé_api_tmdb
   ```

---

## Configuration

Pour configurer l'API TMDB, vous devez placer votre clé API dans un fichier .env à la racine de votre projet. Exemple :

```env
VITE_TMDB_API_KEY=votre_clé_api_tmdb
```

Cette clé sera utilisée pour récupérer les films depuis TMDB.

---

## Technologies utilisées

Ce projet est construit avec les technologies suivantes :

- **[React](https://react.dev/)** (v18) - Bibliothèque pour créer des interfaces utilisateur réactives.
- **[Vite](https://vitejs.dev/)** - Outil de build ultra-rapide pour les applications modernes.
- **[React Router](https://reactrouter.com/)** (v7) - Gestion des routes pour la navigation entre les pages.
- **[Zustand](https://github.com/pmndrs/zustand)** - Gestion d'état simple et performante pour React.
- **[Sass](https://sass-lang.com/)** - Préprocesseur CSS pour un meilleur style et organisation.
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** - Outils pour assurer un code propre et lisible.
- **[string-similarity](https://www.npmjs.com/package/string-similarity)** - Pour comparer les chaînes de caractères.
- **[vite-plugin-compression](https://www.npmjs.com/package/vite-plugin-compression)** - Pour optimiser les assets en production.

L'API **[The Movie Database (TMDb)](https://www.themoviedb.org/)** est utilisée pour récupérer les informations sur les films.

---

## 📜 License

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer sous les conditions de cette licence.

Consultez le fichier [`LICENSE`](./LICENSE) pour plus de détails.

---

© 2024 - Movie Guess. Tous droits réservés.
