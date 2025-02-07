import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore'
import fetchUrl from '../../utils/fetchUrl'

const Game = () => {
  const { pseudo } = useUserStore()
  const navigate = useNavigate()
  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getMovies = async () => {
      const moviesDict = {}

      for (let page = 1; page <= 20; page++) {
        const url = `https://api.themoviedb.org/3/movie/top_rated?language=fr-FR&page=${page}`
        const data = await fetchUrl(url)

        if (data && data.results) {
          for (const movie of data.results) {
            if (!moviesDict[movie.id]) {
              const backdropData = await getMoviesBackdrops(movie.id)
              moviesDict[movie.id] = {
                title: movie.title,
                backdrops:
                  backdropData && backdropData.backdrops.length > 0
                    ? backdropData.backdrops
                        .slice(0, 4)
                        .map((backdrop) => backdrop.file_path)
                    : [],
              }
            }
          }
        }
      }

      selectRandomMovies(moviesDict)
      setLoading(false)
    }

    getMovies()
  }, [])

  const selectRandomMovies = (moviesDict) => {
    const movieEntries = Object.entries(moviesDict)
    const shuffled = movieEntries.sort(() => 0.5 - Math.random())
    setSelectedMovies(shuffled.slice(0, 25))
  }

  if (!pseudo) {
    navigate('/')
    return null
  }

  const getMoviesBackdrops = async (idMovie) => {
    const url = `https://api.themoviedb.org/3/movie/${idMovie}/images`
    const data = await fetchUrl(url)
    return data
  }

  if (loading) {
    return <p>Chargement...</p>
  }

  return (
    <div>
      {selectedMovies.length > 0 ? (
        <ul>
          {selectedMovies.map(([id, movie]) => (
            <li key={id}>
              <h2>{movie.title}</h2>
              {movie.backdrops.length > 0 &&
                movie.backdrops.map((backdrop, index) => (
                  <img
                    key={index}
                    src={`https://image.tmdb.org/t/p/w500${backdrop}`}
                    alt={movie.title}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      marginBottom: '10px',
                    }}
                  />
                ))}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun film trouvé.</p>
      )}
    </div>
  )
}

export default Game
