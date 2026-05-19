import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('cb_token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('cb_token', data.token)
    set({ user: data.user, token: data.token, loading: false })
    return data
  },

  register: async (username, email, password) => {
    set({ loading: true })
    const { data } = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('cb_token', data.token)
    set({ user: data.user, token: data.token, loading: false })
    return data
  },

  logout: () => {
    localStorage.removeItem('cb_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data })
    } catch {
      get().logout()
    }
  },
}))
