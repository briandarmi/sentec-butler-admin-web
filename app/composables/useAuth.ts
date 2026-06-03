import { computed } from 'vue'

export type UserRole = 'admin' | 'superadmin'

const AUTH_STORAGE_KEY = 'sentec-butler-admin-auth'

interface StoredAuthSession {
  role: UserRole
  username: string
  token: string
}

function readStoredSession(): StoredAuthSession | null {
  if (!import.meta.client) {
    return null
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredAuthSession
  }
  catch {
    return null
  }
}

function writeStoredSession(session: StoredAuthSession | null) {
  if (!import.meta.client) {
    return
  }

  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function useAuth() {
  const role = useState<UserRole | null>('currentUserRole', () => readStoredSession()?.role ?? null)
  const username = useState<string | null>('currentUsername', () => readStoredSession()?.username ?? null)
  const token = useState<string | null>('authToken', () => readStoredSession()?.token ?? null)

  const isAuthenticated = computed(() => Boolean(role.value && token.value))
  const isSuperAdmin = computed(() => role.value === 'superadmin')

  async function login(payload: { username: string; password: string }) {
    const identity = payload.username.trim().toLowerCase()

    const allowedCredentials: Array<{ username: string; password: string; role: UserRole }> = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'superadmin', password: 'superadmin123', role: 'superadmin' },
    ]

    const match = allowedCredentials.find(
      (c) => c.username === identity && c.password === payload.password,
    )

    if (!match) {
      return {
        ok: false as const,
        message: 'Invalid username or password.',
      }
    }

    const session: StoredAuthSession = {
      role: match.role,
      username: match.username,
      token: `${match.role}-${Date.now()}`,
    }

    role.value = session.role
    username.value = session.username
    token.value = session.token
    writeStoredSession(session)

    return {
      ok: true as const,
    }
  }

  function logout() {
    role.value = null
    username.value = null
    token.value = null
    writeStoredSession(null)
  }

  return {
    role,
    username,
    token,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
  }
}