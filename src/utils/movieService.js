import fetchUrl from './fetchUrl'

export const getMovies = async () => {
  const moviesDict = {}

  for (let page = 1; page <= 13; page++) {
    const url = `https://api.themoviedb.org/3/movie/top_rated?language=fr-FR&page=${page}`
    const data = await fetchUrl(url)

    if (data && data.results) {
      for (const movie of data.results) {
        if (!moviesDict[movie.id]) {
          const backdropData = await getMoviesBackdrops(movie.id)
          moviesDict[movie.id] = {
            title: movie.title,
            backdrops:
              backdropData?.backdrops?.length > 0
                ? backdropData.backdrops
                    .slice(0, 4)
                    .map((backdrop) => backdrop.file_path)
                : [],
          }
        }
      }
    }
  }

  return moviesDict
}

export const getMoviesBackdrops = async (idMovie) => {
  const url = `https://api.themoviedb.org/3/movie/${idMovie}/images`
  return await fetchUrl(url)
}

export const selectRandomMovies = (moviesDict) => {
  if (!moviesDict || Object.keys(moviesDict).length === 0) return []

  const movieEntries = Object.entries(moviesDict)
  return movieEntries.sort(() => 0.5 - Math.random()).slice(0, 24)
}
