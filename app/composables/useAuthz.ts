import { computed } from 'vue'
import { useAuth, type UserRole } from '~/composables/useAuth'

// Per-resource authorization, mirroring the backend's requirePermission():
//   - `superadmin` is implicitly allowed for every resource/action (it bypasses
//     all checks server-side).
//   - The arrays below list the NON-superadmin roles permitted.
//   - `read`  gates whether the screen/list is visible.
//   - `write` gates create/update/delete controls.
//
// Source of truth: db/sentec-butler-api/src/routes/v1/** + permission.mw.ts.
export type AuthzAction = 'read' | 'write'

export type AuthzResource =
  | 'dashboard'
  | 'branding'
  | 'hotelSetup' // WiFi / checkout time
  | 'roomServices'
  | 'categoryItems'
  | 'categories' // global category create/edit
  | 'requestMapping' // staff routing
  | 'slas'
  | 'hotelDepartments'
  | 'departments' // global department create/edit
  | 'users'
  | 'templateMessages'
  | 'messageCategories'
  | 'hotelSync'
  | 'applications'
  | 'organizations'
  | 'hotels'
  | 'master' // countries / languages / setups / icons / timezones

const ACCESS: Record<AuthzResource, { read: UserRole[]; write: UserRole[] }> = {
  // admin + superadmin (hotel-scoped)
  dashboard: { read: ['admin'], write: [] },
  branding: { read: ['admin'], write: ['admin'] }, // admin edits own hotel only (enforced in fake API)
  hotelSetup: { read: ['admin'], write: ['admin'] },
  roomServices: { read: ['admin'], write: ['admin'] },
  categoryItems: { read: ['admin'], write: ['admin'] },
  requestMapping: { read: ['admin'], write: ['admin'] },
  slas: { read: ['admin'], write: ['admin'] },
  hotelDepartments: { read: ['admin'], write: ['admin'] },
  users: { read: ['admin'], write: ['admin'] },
  templateMessages: { read: ['admin'], write: ['admin'] },
  applications: { read: ['admin'], write: [] }, // read-only; no create endpoint

  // superadmin only
  categories: { read: ['admin'], write: [] }, // list readable by admin; create/edit superadmin
  departments: { read: ['admin'], write: [] }, // list readable by admin; create/edit superadmin
  messageCategories: { read: [], write: [] },
  hotelSync: { read: [], write: [] },
  organizations: { read: [], write: [] },
  hotels: { read: [], write: [] },
  master: { read: [], write: [] },
}

export function useAuthz() {
  const auth = useAuth()

  function can(action: AuthzAction, resource: AuthzResource): boolean {
    if (auth.isSuperAdmin.value) return true
    const role = auth.role.value
    if (!role) return false
    return ACCESS[resource][action].includes(role)
  }

  const isSuperAdmin = computed(() => auth.isSuperAdmin.value)

  return { can, isSuperAdmin }
}
