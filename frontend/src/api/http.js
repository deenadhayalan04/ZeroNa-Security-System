import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api'
const TOKEN_KEY = 'zerona_token_v1'

export const http = axios.create({
  baseURL: API_BASE,
})

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

