import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export default useAuthStore

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/login', { email, password })
        set({ user: data.user, accessToken: data.accessToken, isLoading: false })
        return data
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/register', { name, email, password })
        set({ user: data.user, accessToken: data.accessToken, isLoading: false })
        return data
      },

      logout: async () => {
        await api.post('/auth/logout').catch(() => {})
        set({ user: null, accessToken: null })
      },

      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),

      isAuthenticated: () => !!get().accessToken,
    }),
    { name: 'nexpath-auth', partialize: s => ({ user: s.user, accessToken: s.accessToken }) }
  )
)