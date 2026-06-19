import { computed } from 'vue'
import { findUserIdByLogin, resolveUserContext } from '~/utils/clientFakeApi'

export type UserRole = 'admin' | 'superadmin'

const AUTH_STORAGE_KEY = 'sentec-butler-admin-auth'

export interface AccessibleHotel {
  id: string
  name: string
}

interface StoredAuthSession {
  role: UserRole
  userId: string
  username: string
  displayName: string
  email: string
  token: string
  accessibleHotels: AccessibleHotel[]
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

// Demo credentials map onto seeded users; role + hotel scope are then derived
// from the seed (user.superAdmin + user_profile.is_admin), mirroring the real
// backend's per-hotel role resolution.
const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  superadmin: 'superadmin123',
}

export function useAuth() {
  const stored = readStoredSession()

  const role = useState<UserRole | null>('currentUserRole', () => stored?.role ?? null)
  const userId = useState<string | null>('currentUserId', () => stored?.userId ?? null)
  const username = useState<string | null>('currentUsername', () => stored?.username ?? null)
  const displayName = useState<string | null>('currentDisplayName', () => stored?.displayName ?? null)
  const email = useState<string | null>('currentUserEmail', () => stored?.email ?? null)
  const token = useState<string | null>('authToken', () => stored?.token ?? null)
  const accessibleHotels = useState<AccessibleHotel[]>('accessibleHotels', () => stored?.accessibleHotels ?? [])
  const selectedHotelId = useState<string>('selectedHotelId', () => stored?.accessibleHotels?.[0]?.id ?? '1')

  const isAuthenticated = computed(() => Boolean(role.value && token.value))
  const isSuperAdmin = computed(() => role.value === 'superadmin')

  async function login(payload: { username: string; password: string }) {
    const identity = payload.username.trim().toLowerCase()

    if (DEMO_PASSWORDS[identity] !== payload.password) {
      return { ok: false as const, message: 'Invalid username or password.' }
    }

    const resolvedUserId = findUserIdByLogin(identity)
    const ctx = resolvedUserId ? resolveUserContext(resolvedUserId) : null
    if (!ctx) {
      return { ok: false as const, message: 'Account not found in directory.' }
    }

    const session: StoredAuthSession = {
      role: ctx.isSuperAdmin ? 'superadmin' : 'admin',
      userId: ctx.userId,
      username: identity,
      displayName: ctx.displayName,
      email: ctx.email,
      token: `${ctx.userId}-${Date.now()}`,
      accessibleHotels: ctx.accessibleHotels,
    }

    role.value = session.role
    userId.value = session.userId
    username.value = session.username
    displayName.value = session.displayName
    email.value = session.email
    token.value = session.token
    accessibleHotels.value = session.accessibleHotels
    selectedHotelId.value = session.accessibleHotels[0]?.id ?? '1'

    writeStoredSession(session)

    return { ok: true as const }
  }

  function logout() {
    role.value = null
    userId.value = null
    username.value = null
    displayName.value = null
    email.value = null
    token.value = null
    accessibleHotels.value = []
    selectedHotelId.value = '1'
    writeStoredSession(null)
  }

  return {
    role,
    userId,
    username,
    displayName,
    email,
    token,
    accessibleHotels,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
  }
}
