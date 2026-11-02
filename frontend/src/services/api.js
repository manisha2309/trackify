import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:4000',
  withCredentials: true,
})

// Attach token to every request — read directly from Zustand store
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken  // ✅ direct store read, no localStorage parsing
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!import.meta.env.PROD && config.url && !config.url.startsWith('http') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshUrl = import.meta.env.PROD
          ? '/api/auth/refresh'
          : 'http://localhost:4000/api/auth/refresh'
        const { data } = await axios.post(
          refreshUrl,
          {}, { withCredentials: true }
        )
        // Update token in Zustand store directly
        useAuthStore.setState({ accessToken: data.accessToken })
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        useAuthStore.setState({ user: null, accessToken: null })
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api