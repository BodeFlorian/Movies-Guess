import fetchUrl from '../utils/fetchUrl'

/**
 * Récupère une liste de films populaires depuis l'API TMDB et retourne un tableau d'objets.
 * Chaque objet contient l'ID du film, son titre et ses images de fond (backdrops).
 *
 * @async
 * @function getMovies
 * @returns {Promise<Array>} Un tableau d'objets contenant les informations des films.
 */
export const getMovies = async () => {
  const moviesArray = []

  for (let page = 1; page <= 13; page++) {
    const url = `https://api.themoviedb.org/3/movie/top_rated?language=fr-FR&page=${page}`
    const data = await fetchUrl(url)

    if (data && data.results) {
      for (const movie of data.results) {
        const backdropData = await getMoviesBackdrops(movie.id)

        moviesArray.push({
          id: movie.id,
          title: movie.title,
          backdrops:
            backdropData?.backdrops?.length > 0
              ? backdropData.backdrops
                  .slice(0, 4)
                  .map((backdrop) => backdrop.file_path)
              : [],
        })
      }
    }
  }

  console.log(moviesArray.length + ' films récupérés')
  return moviesArray
}

/**
 * Récupère les images de fond (backdrops) pour un film spécifique.
 *
 * @async
 * @function getMoviesBackdrops
 * @param {number} idMovie - L'ID du film pour lequel récupérer les backdrops.
 * @returns {Promise<Object>} Un objet contenant les données des backdrops du film.
 */
export const getMoviesBackdrops = async (idMovie) => {
  const url = `https://api.themoviedb.org/3/movie/${idMovie}/images`
  return await fetchUrl(url)
}

/**
 * Sélectionne un nombre aléatoire de films à partir d'un tableau de films.
 *
 * @function selectRandomMovies
 * @param {Array} moviesArray - Un tableau contenant tous les films disponibles.
 * @param {number} randomLength - Le nombre de films à sélectionner aléatoirement.
 * @returns {Array} Un sous-tableau contenant les films sélectionnés aléatoirement.
 */
export const selectRandomMovies = (moviesArray, randomLength) => {
  if (!moviesArray || moviesArray.length === 0) return []
  console.log('Sélection des films aléatoires')
  return [...moviesArray].sort(() => 0.5 - Math.random()).slice(0, randomLength)
}
