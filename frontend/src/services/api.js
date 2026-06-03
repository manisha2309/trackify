import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  // Use the API URL from Vite env (Docker) or fallback to localhost:4000
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`,
  withCredentials: true,
})

// Attach token to every request — read directly from Zustand store
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken  // ✅ direct store read, no localStorage parsing
  if (token) config.headers.Authorization = `Bearer ${token}`
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
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/refresh`,
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