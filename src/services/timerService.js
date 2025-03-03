/**
 * Service singleton de gestion du temps pour toute l'application
 * Évite les problèmes de boucles liés aux mises à jour d'état dans les hooks
 */
class TimerService {
  constructor() {
    this.listeners = new Map()
    this.timerId = null
    this.isRunning = false
  }

  /**
   * Démarre le service de timer s'il n'est pas déjà en cours
   */
  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.tick()
  }

  /**
   * Met à jour tous les abonnés
   */
  tick() {
    const now = Date.now()

    // Notifier tous les abonnés
    this.listeners.forEach((callback, id) => {
      try {
        callback(now)
      } catch (error) {
        console.error('Erreur dans un callback de timer:', error)
      }
    })

    // Planifier le prochain tick seulement s'il y a des abonnés
    if (this.listeners.size > 0) {
      this.timerId = setTimeout(() => this.tick(), 1000)
    } else {
      this.stop()
    }
  }

  /**
   * Arrête le service de timer
   */
  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    this.isRunning = false
  }

  /**
   * Ajoute un abonné au service de timer
   * @param {string} id - Identifiant unique de l'abonné
   * @param {Function} callback - Fonction appelée à chaque tick
   */
  subscribe(id, callback) {
    this.listeners.set(id, callback)

    if (!this.isRunning && this.listeners.size > 0) {
      this.start()
    }

    return () => {
      this.unsubscribe(id)
    }
  }

  /**
   * Supprime un abonné du service de timer
   * @param {string} id - Identifiant de l'abonné à supprimer
   */
  unsubscribe(id) {
    this.listeners.delete(id)

    if (this.listeners.size === 0) {
      this.stop()
    }
  }
}

// Exporter une instance unique pour toute l'application
export default new TimerService()
