import { useState, useEffect, useRef } from 'react'
import timerService from '../services/timerService'

/**
 * Hook qui fournit un état mis à jour chaque seconde
 * @param {Function} callback - Fonction de callback appelée à chaque seconde
 * @returns {number} - Timestamp actuel
 */
const useTimer = (callback) => {
  const [timestamp, setTimestamp] = useState(Date.now())
  const idRef = useRef(`timer-${Math.random().toString(36).substring(2, 9)}`)
  const callbackRef = useRef(callback)

  // Mettre à jour la référence du callback quand il change
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Fonction appelée chaque seconde
    const onTick = (now) => {
      setTimestamp(now)
      if (callbackRef.current) {
        callbackRef.current(now)
      }
    }

    // S'abonner au service de timer
    const unsubscribe = timerService.subscribe(idRef.current, onTick)

    // Se désabonner lors du nettoyage
    return unsubscribe
  }, [])

  return timestamp
}

export default useTimer
