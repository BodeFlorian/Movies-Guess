const defaultOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
}

/**
 * Fonction pour effectuer des requêtes fetch.
 *
 * @async
 * @function fetchUrl
 * @param {string} url - L'URL à laquelle faire la requête.
 * @returns {Promise<Object>} Les données récupérées.
 */
export const fetchUrl = async (url, options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  }

  try {
    const response = await fetch(url, mergedOptions)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)
    return null
  }
}
