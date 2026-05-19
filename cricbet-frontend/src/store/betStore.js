import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useBetStore = create((set, get) => ({
  slip: null,       // { matchId, matchName, selection, selectionLabel, odds }
  stake: 500,
  placing: false,

  addToSlip: (bet) => set({ slip: bet }),
  clearSlip: () => set({ slip: null, stake: 500 }),
  setStake: (stake) => set({ stake }),

  getPayout: () => {
    const { slip, stake } = get()
    if (!slip) return 0
    return parseFloat((stake * slip.odds).toFixed(2))
  },

  placeBet: async () => {
    const { slip, stake } = get()
    if (!slip) return

    set({ placing: true })
    try {
      const { data } = await api.post('/bets', {
        match_id: slip.matchId,
        selection: slip.selection,
        odds: slip.odds,
        stake,
        idempotency_key: `${slip.matchId}-${slip.selection}-${Date.now()}`,
      })
      toast.success('Bet placed! Good luck 🏏')
      set({ slip: null, stake: 500 })
      return data
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bet place nahi hua')
      throw err
    } finally {
      set({ placing: false })
    }
  },
}))
