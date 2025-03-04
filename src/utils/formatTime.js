/*
 * Formatte une durée en minutes et secondes
 * @param {number} milliseconds - durée en millisecondes
 * @returns {string} - durée formatée en minutes:secondes
 */
export const formatTime = (milliseconds) => {
  // S'assurer que le temps est positif ou 0
  const validMilliseconds = Math.max(0, milliseconds || 0)

  const totalSeconds = Math.floor(validMilliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
