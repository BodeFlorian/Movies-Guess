import { create } from 'zustand'

const useUserStore = create((set) => ({
  pseudo: localStorage.getItem('pseudo') || '',

  setPseudo: (newPseudo) => {
    set({ pseudo: newPseudo })
    localStorage.setItem('pseudo', newPseudo)
  },
}))

export default useUserStore
