import { http, setAuthToken, getAuthToken } from '../api/http'

const USER_KEY = 'zerona_user_v1'

export function isAuthed() {
  return Boolean(getAuthToken())
}

export function getAuthedUser() {
  try {
    return localStorage.getItem(USER_KEY) || ''
  } catch {
    return ''
  }
}

export async function loginWithCredentials(username, password) {
  try {
    const res = await http.post('/auth/login', { username, password })
    const token = res.data?.token
    const user = res.data?.user?.username || username
    if (!token) return { ok: false, message: 'Login failed.' }
    setAuthToken(token)
    localStorage.setItem(USER_KEY, user)
    return { ok: true }
  } catch (e) {
    return { ok: false, message: 'Incorrect username or password.' }
  }
}

export async function verifySession() {
  if (!getAuthToken()) return { ok: false }
  try {
    const res = await http.get('/auth/me')
    const user = res.data?.user?.username || ''
    if (user) localStorage.setItem(USER_KEY, user)
    return { ok: true, user }
  } catch {
    setAuthToken('')
    return { ok: false }
  }
}

export function logout() {
  setAuthToken('')
  try {
    localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}

