/*
 * Formatte une durée en minutes et secondes
 * @param {number} milliseconds - durée en millisecondes
 * @returns {string} - durée formatée en minutes:secondes
 */
export const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
