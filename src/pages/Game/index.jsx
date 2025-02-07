import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/userStore'
import useMoviesStore from '../../store/moviesStore'
import fetchUrl from '../../utils/fetchUrl'
import MovieCard from '../../components/MovieCard'

const Game = () => {
  const { pseudo } = useUserStore()
  const { movies, setMovies } = useMoviesStore()
  const navigate = useNavigate()
  const [selectedMovies, setSelectedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      if (!movies || Object.keys(movies).length === 0) {
        const fetchedMovies = await getMovies()
        setMovies(fetchedMovies)
        selectRandomMovies(fetchedMovies)
      } else {
        selectRandomMovies(movies)
      }
      setLoading(false)
    }

    fetchMovies()
  }, [])

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

  const getMoviesBackdrops = async (idMovie) => {
    const url = `https://api.themoviedb.org/3/movie/${idMovie}/images`
    return await fetchUrl(url)
  }

  const selectRandomMovies = (moviesDict) => {
    if (!moviesDict || Object.keys(moviesDict).length === 0) return
    const movieEntries = Object.entries(moviesDict)
    const shuffled = movieEntries.sort(() => 0.5 - Math.random())
    setSelectedMovies(shuffled.slice(0, 25))
  }

  if (!pseudo) {
    navigate('/')
    return null
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
              <MovieCard title={movie.title} backdrops={movie.backdrops} />
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
