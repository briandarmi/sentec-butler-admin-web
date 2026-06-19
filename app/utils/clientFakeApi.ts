// Client-side fake API handler for the Sentec Butler Admin web app.
//
// Seed data and endpoint shapes are derived from the real backend:
//   - db/sentec_butler_dump.sql              (PostgreSQL schema + seed rows)
//   - db/sentec-butler-api/src/routes/v1/**  (Hono routes + requirePermission)
//   - db/sentec-butler-api/bruno-documentation/** (request/response contracts)
//
// Authorization mirrors the backend exactly:
//   - `superadmin` (user.superAdmin = true) bypasses every permission check.
//   - Every other role is resolved PER HOTEL from user_profile via the
//     `x-user-id` + `x-hotel-id` request headers (like roleRepo.resolveRole).
//   - requirePermission() with no roles  => superadmin only.
//   - requirePermission('admin')         => admin + superadmin.
//
// The app runs as a fully static SPA against this in-memory store; mutations
// persist for the browser session only and reset on reload.

type Id = string

// ── domain types (camelCase, matching API responses) ──────────────────────────

interface Organization { id: Id; name: string }
interface Country { id: Id; name: string; code: string; demonym: string | null }
interface Language { id: Id; name: string; code: string }
interface Timezone { id: Id; name: string; utcOffset: string }
interface Application { id: Id; name: string; createDate: string; updateDate: string }

interface Icon { id: Id; name: string; icon: string }

interface Hotel {
  id: Id
  organizationId: Id
  countryId: Id
  languageId: Id
  timezoneId: Id | null
  name: string
  phone: string | null
  address: string | null
  email: string | null
  website: string | null
  logo: string | null
  primaryColor: string | null
  secondaryColor: string | null
  isActive: boolean
  isRemoved: boolean
  createDate: string
  updateDate: string
}

interface MasterSetup {
  id: Id
  name: string
  setupCode: string
  inputType: 'text' | 'number' | 'option' | 'date' | 'time'
  optionValue: string | null
}

interface HotelSetup {
  id: Id
  hotelId: Id
  setupId: Id
  value: string
  createDate: string
  updateDate: string
}

interface HotelSync {
  id: Id
  hotelId: Id
  applicationId: Id
  syncId: string
  useAsymetric: boolean
  privateKey: string | null
  secretKey: string | null
  createDate: string
  updateDate: string
}

interface RoomService {
  id: Id
  hotelId: Id
  iconId: Id
  name: string
  description: string | null
  hyperlink: string | null
  isActive: boolean
  isRemoved: boolean
  createDate: string
  updateDate: string
}

interface Category { id: Id; iconId: Id; name: string; createDate: string; updateDate: string }

interface CategoryItem {
  id: Id
  hotelId: Id
  categoryId: Id
  iconId: Id
  name: string
  itemQuantity: boolean
  hyperlink: string | null
  isActive: boolean
  isRemoved: boolean
  createDate: string
  updateDate: string
}

interface Department { id: Id; name: string }

interface HotelDepartment {
  id: Id
  hotelId: Id
  departmentId: Id
  isActive: boolean
  isRemoved: boolean
  createDate: string
  updateDate: string
}

interface Sla {
  id: Id
  hotelId: Id
  name: string
  responseTime: number
  resolutionTime: number
  isDefault: boolean
  createDate: string
  updateDate: string
}

interface RequestMapping {
  id: Id
  hotelId: Id
  itemId: Id
  departmentId: Id
  slaId: Id
  remark: string | null
}

interface MessageCategory { id: Id; name: string }

interface TemplateMessage {
  id: Id
  hotelId: Id
  messageId: Id
  title: string
  createDate: string
  updateDate: string
}

interface User {
  id: Id
  firstName: string
  lastName: string
  email: string
  picture: string | null
  superAdmin: boolean
  isVerified: boolean
  isActive: boolean
  isRemoved: boolean
  lastLogin: string | null
  createDate: string
  updateDate: string
}

interface UserProfile {
  id: Id
  hotelId: Id
  departmentId: Id
  userId: Id
  position: string | null
  isAdmin: boolean
  isLeader: boolean
  isActive: boolean
  isRemoved: boolean
  createTicket: boolean
  createDate: string
  updateDate: string
}

// ── helpers ───────────────────────────────────────────────────────────────────

function nowIso() { return new Date().toISOString() }
function nextId(items: { id: Id }[]) {
  return String(items.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1)
}
function pid(v: unknown, fallback = '') { return (v != null && v !== '') ? String(v) : fallback }
function listRes<T>(data: T[]) { return { version: 'v1' as const, data, meta: { totalCount: data.length, nextCursor: null } } }
function singleRes<T>(data: T) { return { version: 'v1' as const, data } }

const SEED_DATE = '2026-05-14T12:46:52.649Z'

// ── seed data (from sentec_butler_dump.sql) ───────────────────────────────────

const organizations: Organization[] = [
  { id: '1', name: 'Archipelago' },
  { id: '2', name: 'Aryaduta' },
]

const countries: Country[] = [
  { id: '1', name: 'Indonesia', code: 'ID', demonym: 'Indonesian' },
  { id: '2', name: 'France test', code: 'FR', demonym: 'French' },
]

const languages: Language[] = [
  { id: '1', name: 'Indonesian', code: 'ID' },
]

const timezones: Timezone[] = [
  { id: '1', name: 'Jakarta', utcOffset: '+07:00' },
  { id: '2', name: 'Bali test edit', utcOffset: '+08:00' },
  { id: '3', name: 'Papua', utcOffset: '+09:00' },
]

const applications: Application[] = [
  { id: '1', name: 'Sentec PMS', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '2', name: 'Sentec EMS', createDate: SEED_DATE, updateDate: SEED_DATE },
]

const icons: Icon[] = [
  { id: '1', name: 'test-icon-edit', icon: '🛎️' },
  { id: '2', name: 'housekeeping', icon: '🧹' },
  { id: '3', name: 'maintenance', icon: '🔧' },
  { id: '4', name: 'concierge', icon: '🛗' },
  { id: '5', name: 'dining', icon: '🍽️' },
]

const hotels: Hotel[] = [
  { id: '1', organizationId: '1', countryId: '1', languageId: '1', timezoneId: '1', name: 'Aston Simatupang', phone: null, address: 'TB Simatupang', email: 'astonsimatupang@gmail.com', website: 'astonsimatupang.com', logo: null, primaryColor: '#027BFF', secondaryColor: '#FF1493', isActive: true, isRemoved: false, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', organizationId: '1', countryId: '1', languageId: '1', timezoneId: '1', name: 'Aston Puncak', phone: '6278888888', address: 'Ciloto', email: 'aston@puncak.com', website: 'astonpuncak.com', logo: null, primaryColor: '#1A3C5E', secondaryColor: '#C9A84C', isActive: true, isRemoved: false, createDate: '2026-05-19T10:40:54.727Z', updateDate: '2026-05-19T10:40:54.727Z' },
  { id: '8', organizationId: '1', countryId: '1', languageId: '1', timezoneId: '1', name: 'Aston Demo', phone: '0878237131243', address: 'jalan aston demo', email: 'user@example.com', website: 'https://example.com/', logo: 'https://google.com', primaryColor: '#cEb09d', secondaryColor: '#Ab587f', isActive: true, isRemoved: false, createDate: '2026-06-02T15:25:10.349Z', updateDate: '2026-06-02T15:25:10.349Z' },
  { id: '9', organizationId: '2', countryId: '1', languageId: '1', timezoneId: '1', name: 'Aryaduta Jakarta', phone: '62213924001', address: 'Jl. Prajurit No.44', email: 'jakarta@aryaduta.com', website: 'https://aryaduta.com/', logo: null, primaryColor: '#2C05B8', secondaryColor: '#e5c62e', isActive: true, isRemoved: false, createDate: '2026-06-03T07:34:55.493Z', updateDate: '2026-06-03T07:34:55.493Z' },
  { id: '11', organizationId: '2', countryId: '1', languageId: '1', timezoneId: '1', name: 'Aston Malang', phone: '62341888000', address: 'Malang', email: 'malang@aston.com', website: 'https://example.com/', logo: null, primaryColor: '#8eA6c6', secondaryColor: '#1fc1F4', isActive: true, isRemoved: false, createDate: '2026-06-09T08:28:30.291Z', updateDate: '2026-06-09T08:28:30.291Z' },
]

const masterSetups: MasterSetup[] = [
  { id: '1', name: 'WiFi Password', setupCode: 'WIFI_PASSWORD', inputType: 'text', optionValue: null },
  { id: '2', name: 'WiFi SSID', setupCode: 'WIFI_SSID', inputType: 'text', optionValue: null },
  { id: '3', name: 'Checkout Time', setupCode: 'CHECKOUT_TIME', inputType: 'time', optionValue: null },
]

const hotelSetups: HotelSetup[] = [
  { id: '1', hotelId: '1', setupId: '1', value: 'guest-password', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '2', hotelId: '1', setupId: '2', value: 'SENTEC_GUEST', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '14', hotelId: '1', setupId: '3', value: '12:00', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '13', hotelId: '2', setupId: '1', value: 'PW HOTEL 2', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '15', hotelId: '8', setupId: '3', value: '12:00', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '16', hotelId: '11', setupId: '3', value: '12:00', createDate: SEED_DATE, updateDate: SEED_DATE },
]

const hotelSyncs: HotelSync[] = [
  { id: '1', hotelId: '1', applicationId: '2', syncId: '1', useAsymetric: true, privateKey: 'ABCDEF', secretKey: null, createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '2', hotelId: '1', applicationId: '1', syncId: '1', useAsymetric: false, privateKey: null, secretKey: '770b053d-7736-4db8-8a42-30098bc227f2', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '3', hotelId: '8', applicationId: '1', syncId: '2', useAsymetric: false, privateKey: null, secretKey: '75fc91a6-e518-4f5f-bfb4-289348d2d1c5', createDate: SEED_DATE, updateDate: SEED_DATE },
]

const categories: Category[] = [
  { id: '1', iconId: '2', name: 'Housekeeping', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '2', iconId: '3', name: 'Maintenance', createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '3', iconId: '4', name: 'Concierge', createDate: SEED_DATE, updateDate: SEED_DATE },
]

const categoryItems: CategoryItem[] = [
  { id: '1', hotelId: '1', categoryId: '1', iconId: '2', name: 'Make Bed', itemQuantity: true, hyperlink: null, isActive: true, isRemoved: false, createDate: '2026-05-25T01:00:50.322Z', updateDate: '2026-05-25T01:00:50.322Z' },
  { id: '2', hotelId: '1', categoryId: '2', iconId: '3', name: 'Fix Air Conditioner', itemQuantity: true, hyperlink: null, isActive: true, isRemoved: false, createDate: '2026-06-10T08:49:52.519Z', updateDate: '2026-06-10T08:50:41.408Z' },
]

const roomServices: RoomService[] = [
  { id: '1', hotelId: '1', iconId: '5', name: 'In-Room Dining', description: 'Order meals and beverages directly to your room', hyperlink: 'https://menu.example.com', isActive: true, isRemoved: false, createDate: SEED_DATE, updateDate: SEED_DATE },
]

const departments: Department[] = [
  { id: '1', name: 'IT' },
  { id: '2', name: 'Human Resources' },
]

const hotelDepartments: HotelDepartment[] = [
  { id: '1', hotelId: '1', departmentId: '1', isActive: true, isRemoved: false, createDate: '2026-05-14T12:47:11.339Z', updateDate: '2026-05-14T12:47:11.339Z' },
  { id: '2', hotelId: '1', departmentId: '2', isActive: true, isRemoved: false, createDate: '2026-05-19T09:49:56.140Z', updateDate: '2026-06-10T08:48:53.748Z' },
  { id: '5', hotelId: '8', departmentId: '1', isActive: true, isRemoved: false, createDate: '2026-06-05T14:50:30.923Z', updateDate: '2026-06-05T14:50:30.923Z' },
]

const slas: Sla[] = [
  { id: '1', hotelId: '1', name: 'SLA 1', responseTime: 60, resolutionTime: 60, isDefault: false, createDate: '2026-05-25T00:59:46.020Z', updateDate: '2026-05-25T07:59:46.020Z' },
  { id: '2', hotelId: '1', name: 'SLA 2', responseTime: 60, resolutionTime: 60, isDefault: true, createDate: '2026-05-25T02:00:14.800Z', updateDate: '2026-05-25T09:00:14.800Z' },
  { id: '3', hotelId: '8', name: 'SLA 1', responseTime: 30, resolutionTime: 30, isDefault: true, createDate: '2026-06-05T00:50:14.825Z', updateDate: '2026-06-05T14:50:14.825Z' },
  { id: '5', hotelId: '11', name: 'Default Initial SLA', responseTime: 30, resolutionTime: 30, isDefault: true, createDate: '2026-06-09T08:28:30.291Z', updateDate: '2026-06-09T08:28:30.291Z' },
]

const requestMappings: RequestMapping[] = [
  { id: '1', hotelId: '1', itemId: '1', departmentId: '1', slaId: '1', remark: null },
  { id: '2', hotelId: '1', itemId: '2', departmentId: '2', slaId: '1', remark: null },
]

const messageCategories: MessageCategory[] = [
  { id: '1', name: 'Welcome Message' },
]

const templateMessages: TemplateMessage[] = [
  { id: '1', hotelId: '1', messageId: '1', title: 'Welcome {name}, we hope you enjoy your stay until {check_out}. Your room number is {room_number}.', createDate: '2026-05-28T10:16:50.136Z', updateDate: '2026-05-28T10:17:13.593Z' },
]

const users: User[] = [
  { id: '1', firstName: 'Fikri', lastName: 'Akmal', email: 'fikriakmal453@gmail.com', picture: null, superAdmin: true, isVerified: true, isActive: true, isRemoved: false, lastLogin: '2026-06-12T09:39:49.560Z', createDate: '2026-05-14T12:40:04.056Z', updateDate: '2026-06-12T09:39:49.532Z' },
  { id: '2', firstName: 'Fikri', lastName: 'Akmal', email: 'fikri.a@sentineltech.com', picture: 'google.com', superAdmin: false, isVerified: true, isActive: true, isRemoved: false, lastLogin: '2026-06-08T16:16:17.042Z', createDate: '2026-05-19T10:31:52.996Z', updateDate: '2026-06-08T16:16:17.001Z' },
  { id: '4', firstName: 'DEV', lastName: 'Postman', email: 'devbnpbpostman@gmail.com', picture: null, superAdmin: false, isVerified: true, isActive: true, isRemoved: false, lastLogin: '2026-06-09T07:17:57.985Z', createDate: '2026-05-20T08:05:04.382Z', updateDate: '2026-06-09T07:17:57.957Z' },
  // Demo admin (added for the admin-role demo login — no non-superadmin admin
  // exists in the SQL dump). Scoped to Aston Simatupang (1) and Aston Demo (8).
  { id: '100', firstName: 'Demo', lastName: 'Admin', email: 'admin.demo@sentineltech.com', picture: null, superAdmin: false, isVerified: true, isActive: true, isRemoved: false, lastLogin: null, createDate: SEED_DATE, updateDate: SEED_DATE },
]

const userProfiles: UserProfile[] = [
  { id: '1', hotelId: '1', departmentId: '1', userId: '1', position: 'CTO', isAdmin: true, isLeader: false, isActive: true, isRemoved: false, createTicket: false, createDate: '2026-05-14T12:47:53.342Z', updateDate: '2026-05-14T12:47:53.342Z' },
  { id: '2', hotelId: '1', departmentId: '1', userId: '2', position: null, isAdmin: false, isLeader: false, isActive: true, isRemoved: false, createTicket: false, createDate: '2026-05-19T10:33:19.158Z', updateDate: '2026-05-20T15:00:18.504Z' },
  { id: '6', hotelId: '1', departmentId: '1', userId: '4', position: 'Staff', isAdmin: false, isLeader: false, isActive: true, isRemoved: false, createTicket: false, createDate: '2026-05-20T08:05:04.382Z', updateDate: '2026-05-20T08:05:04.382Z' },
  { id: '8', hotelId: '8', departmentId: '5', userId: '1', position: 'HOD', isAdmin: true, isLeader: true, isActive: true, isRemoved: false, createTicket: false, createDate: '2026-06-05T14:53:27.446Z', updateDate: '2026-06-05T14:53:27.446Z' },
  { id: '10', hotelId: '8', departmentId: '5', userId: '4', position: 'Staff', isAdmin: false, isLeader: false, isActive: true, isRemoved: false, createTicket: false, createDate: '2026-06-08T16:12:41.567Z', updateDate: '2026-06-08T16:12:41.567Z' },
  // Demo admin profiles (hotels 1 and 8).
  { id: '101', hotelId: '1', departmentId: '1', userId: '100', position: 'IT Manager', isAdmin: true, isLeader: false, isActive: true, isRemoved: false, createTicket: true, createDate: SEED_DATE, updateDate: SEED_DATE },
  { id: '102', hotelId: '8', departmentId: '5', userId: '100', position: 'IT Manager', isAdmin: true, isLeader: false, isActive: true, isRemoved: false, createTicket: true, createDate: SEED_DATE, updateDate: SEED_DATE },
]

// ── auth resolution (mirrors roleRepo.resolveRole(userId, hotelId)) ────────────

export type ResolvedRole = 'superadmin' | 'admin' | 'leader' | 'staff' | null

export interface UserContext {
  userId: Id
  isSuperAdmin: boolean
  displayName: string
  email: string
  /** Hotel ids where the user has an active is_admin profile. */
  adminHotelIds: Id[]
  /** All hotel ids the user can act in (superadmin => every hotel). */
  accessibleHotelIds: Id[]
  accessibleHotels: Array<{ id: Id; name: string }>
}

function activeHotelIds() {
  return hotels.filter(h => !h.isRemoved).map(h => h.id)
}

/** Resolve a user's portable context (used by the auth composable on login). */
export function resolveUserContext(userId: Id): UserContext | null {
  const user = users.find(u => u.id === String(userId) && !u.isRemoved)
  if (!user) return null

  const isSuperAdmin = user.superAdmin
  const adminHotelIds = userProfiles
    .filter(p => p.userId === user.id && p.isAdmin && p.isActive && !p.isRemoved)
    .map(p => p.hotelId)

  const accessibleHotelIds = isSuperAdmin ? activeHotelIds() : [...new Set(adminHotelIds)]
  const accessibleHotels = accessibleHotelIds
    .map(id => hotels.find(h => h.id === id))
    .filter((h): h is Hotel => Boolean(h))
    .map(h => ({ id: h.id, name: h.name }))

  return {
    userId: user.id,
    isSuperAdmin,
    displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
    email: user.email,
    adminHotelIds: [...new Set(adminHotelIds)],
    accessibleHotelIds,
    accessibleHotels,
  }
}

/** Map a demo login username to a seeded user id. */
export function findUserIdByLogin(username: string): Id | null {
  const map: Record<string, Id> = {
    superadmin: '1', // fikriakmal453@gmail.com (super_admin)
    admin: '100', // admin.demo@sentineltech.com (is_admin for hotels 1 & 8)
  }
  return map[username.trim().toLowerCase()] ?? null
}

// ── per-request authorization ──────────────────────────────────────────────────

interface RequestCtx {
  userId: Id | null
  hotelId: Id | null
  isSuperAdmin: boolean
  /** Role resolved for the request's x-hotel-id (admin/leader/staff/null). */
  role: ResolvedRole
  adminHotelIds: Id[]
}

class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

function resolveCtx(headers: Record<string, string>): RequestCtx {
  const userId = headers['x-user-id'] ? String(headers['x-user-id']) : null
  const hotelId = headers['x-hotel-id'] ? String(headers['x-hotel-id']) : null
  const user = userId ? users.find(u => u.id === userId) : undefined

  if (!user) return { userId, hotelId, isSuperAdmin: false, role: null, adminHotelIds: [] }

  const adminHotelIds = userProfiles
    .filter(p => p.userId === user.id && p.isAdmin && p.isActive && !p.isRemoved)
    .map(p => p.hotelId)

  if (user.superAdmin) {
    return { userId, hotelId, isSuperAdmin: true, role: 'superadmin', adminHotelIds }
  }

  // Resolve the per-hotel role from the user_profile for x-hotel-id.
  let role: ResolvedRole = null
  if (hotelId) {
    const profile = userProfiles.find(p => p.userId === user.id && p.hotelId === hotelId && p.isActive && !p.isRemoved)
    if (profile) role = profile.isAdmin ? 'admin' : profile.isLeader ? 'leader' : 'staff'
  }

  return { userId, hotelId, isSuperAdmin: user.superAdmin, role, adminHotelIds }
}

/** requirePermission(...roles): superadmin always passes. */
function requirePermission(ctx: RequestCtx, ...roles: ResolvedRole[]) {
  if (ctx.isSuperAdmin) return
  if (!ctx.role) throw new ApiError('BAD_REQUEST', 'Hotel context required')
  if (!roles.includes(ctx.role)) throw new ApiError('FORBIDDEN', 'You do not have permission to perform this action')
}

/** requirePermission() with no roles => superadmin only. */
function requireSuperadmin(ctx: RequestCtx) {
  if (!ctx.isSuperAdmin) throw new ApiError('FORBIDDEN', 'Superadmin access required')
}

/** Resolve the effective hotel id for a hotel-scoped request; admin is pinned to their hotels. */
function requireHotelId(ctx: RequestCtx): Id {
  const hotelId = ctx.hotelId
  if (!hotelId) throw new ApiError('BAD_REQUEST', 'x-hotel-id header is required')
  if (!ctx.isSuperAdmin && !ctx.adminHotelIds.includes(hotelId)) {
    throw new ApiError('FORBIDDEN', 'You are not assigned to this hotel')
  }
  return hotelId
}

// ── join helpers ────────────────────────────────────────────────────────────────

function withIcon<T extends { iconId: Id }>(row: T) {
  const icon = icons.find(i => i.id === row.iconId) ?? null
  return { ...row, icon }
}

function withRequestMapping(item: CategoryItem) {
  const rm = requestMappings.find(m => m.itemId === item.id && m.hotelId === item.hotelId)
  return {
    ...withIcon(item),
    requestMapping: rm ? { id: rm.id, departmentId: rm.departmentId, slaId: rm.slaId, remark: rm.remark } : null,
  }
}

function withSetup(row: HotelSetup) {
  return { ...row, setup: masterSetups.find(s => s.id === row.setupId) ?? null }
}

function withRelations(profile: UserProfile) {
  return {
    ...profile,
    hotel: hotels.find(h => h.id === profile.hotelId) ?? null,
    department: departments.find(d => d.id === profile.departmentId) ?? null,
  }
}

function userWithProfiles(user: User) {
  return { ...user, profiles: userProfiles.filter(p => p.userId === user.id && !p.isRemoved).map(withRelations) }
}

// ── main router ───────────────────────────────────────────────────────────────

type FakeApiOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  query?: Record<string, unknown>
}

export function handleFakeApiRequest(path: string, opts: FakeApiOptions = {}) {
  const method = (opts.method ?? 'GET').toUpperCase()
  const body = (opts.body ?? {}) as Record<string, unknown>
  const headers = (opts.headers ?? {}) as Record<string, string>
  const query = (opts.query ?? {}) as Record<string, unknown>
  const ctx = resolveCtx(headers)
  const now = nowIso()

  // ════════════ Superadmin: Organizations ════════════
  if (path === '/v1/superadmin/organizations') {
    requireSuperadmin(ctx)
    if (method === 'GET') return listRes([...organizations].sort((a, b) => a.name.localeCompare(b.name)))
    if (method === 'POST') {
      const id = pid(body.id)
      const name = String(body.name ?? '').trim()
      const existing = organizations.find(o => o.id === id)
      if (existing) { existing.name = name; return singleRes(existing) }
      const created: Organization = { id: nextId(organizations), name }
      organizations.push(created)
      return singleRes(created)
    }
  }
  if (method === 'GET' && path.startsWith('/v1/superadmin/organizations/')) {
    requireSuperadmin(ctx)
    const id = path.split('/').pop()!
    const org = organizations.find(o => o.id === id)
    if (!org) throw new ApiError('NOT_FOUND', 'Organization not found')
    return singleRes(org)
  }

  // ════════════ Superadmin: Hotels ════════════
  if (path === '/v1/superadmin/hotels') {
    requireSuperadmin(ctx)
    if (method === 'GET') {
      const orgFilter = pid(query['filter[organizationId][eq]'])
      let rows = hotels.filter(h => !h.isRemoved)
      if (orgFilter) rows = rows.filter(h => h.organizationId === orgFilter)
      return listRes(rows.sort((a, b) => a.name.localeCompare(b.name)))
    }
    if (method === 'POST') return upsertHotel(body, ctx, now)
  }
  if (path.startsWith('/v1/superadmin/hotels/')) {
    const id = path.split('/').pop()!
    if (method === 'GET') {
      requireSuperadmin(ctx)
      const hotel = hotels.find(h => h.id === id && !h.isRemoved)
      if (!hotel) throw new ApiError('NOT_FOUND', 'Hotel not found')
      return singleRes(hotel)
    }
    if (method === 'DELETE') {
      requireSuperadmin(ctx)
      const hotel = hotels.find(h => h.id === id)
      if (!hotel) throw new ApiError('NOT_FOUND', 'Hotel not found')
      hotel.isRemoved = true
      hotel.updateDate = now
      return singleRes(hotel)
    }
  }

  // ════════════ Current hotel detail (admin of that hotel, or superadmin) ════════════
  // The backend only exposes hotels via the superadmin module; this read-only
  // endpoint lets an in-hotel admin load their own hotel for Branding/Dashboard.
  if (method === 'GET' && path === '/v1/hotel') {
    requirePermission(ctx, 'admin')
    const hotelId = requireHotelId(ctx)
    const hotel = hotels.find(h => h.id === hotelId && !h.isRemoved)
    if (!hotel) throw new ApiError('NOT_FOUND', 'Hotel not found')
    return singleRes(hotel)
  }

  // ════════════ Hotel branding (own-hotel edit allowed for admin) ════════════
  // Editing the hotel record: superadmin can create/edit any hotel; an admin
  // may edit ONLY their own assigned hotel's branding (doc §3.1 "configure
  // hotel settings"). Used by the Branding screen.
  if (method === 'POST' && path === '/v1/hotels/branding') {
    return upsertHotel(body, ctx, now)
  }

  // ════════════ Applications (read: admin + superadmin) ════════════
  if (path === '/v1/applications') {
    requirePermission(ctx, 'admin')
    if (method === 'GET') return listRes(applications)
  }

  // ════════════ Master data (superadmin only) ════════════
  if (path === '/v1/master/countries') {
    requireSuperadmin(ctx)
    if (method === 'GET') return listRes([...countries].sort((a, b) => a.name.localeCompare(b.name)))
    if (method === 'POST') {
      const id = pid(body.id)
      const existing = countries.find(c => c.id === id)
      const payload = { name: String(body.name ?? '').trim(), code: String(body.code ?? '').trim(), demonym: (body.demonym as string | null) ?? null }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: Country = { id: nextId(countries), ...payload }
      countries.push(created)
      return singleRes(created)
    }
  }
  if (path === '/v1/master/languages') {
    requireSuperadmin(ctx)
    if (method === 'GET') return listRes([...languages].sort((a, b) => a.name.localeCompare(b.name)))
    if (method === 'POST') {
      const id = pid(body.id)
      const existing = languages.find(l => l.id === id)
      const payload = { name: String(body.name ?? '').trim(), code: String(body.code ?? '').trim() }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: Language = { id: nextId(languages), ...payload }
      languages.push(created)
      return singleRes(created)
    }
  }
  if (path === '/v1/master/setups') {
    requireSuperadmin(ctx)
    if (method === 'GET') return listRes(masterSetups)
    if (method === 'POST') {
      const id = pid(body.id)
      const existing = masterSetups.find(s => s.id === id)
      const payload = {
        name: String(body.name ?? '').trim(),
        setupCode: String(body.setupCode ?? '').trim(),
        inputType: (body.inputType as MasterSetup['inputType']) ?? 'text',
        optionValue: (body.optionValue as string | null) ?? null,
      }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: MasterSetup = { id: nextId(masterSetups), ...payload }
      masterSetups.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Timezones (read: admin; write: superadmin) ════════════
  if (path === '/v1/timezones') {
    if (method === 'GET') { requirePermission(ctx, 'admin'); return listRes(timezones) }
    if (method === 'POST') {
      requireSuperadmin(ctx)
      const id = pid(body.id)
      const existing = timezones.find(t => t.id === id)
      const payload = { name: String(body.name ?? '').trim(), utcOffset: String(body.utcOffset ?? '').trim() }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: Timezone = { id: nextId(timezones), ...payload }
      timezones.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Icons (read: admin; create: superadmin) ════════════
  if (path === '/v1/icons') {
    if (method === 'GET') { requirePermission(ctx, 'admin'); return listRes(icons) }
    if (method === 'POST') {
      requireSuperadmin(ctx)
      const id = pid(body.id)
      const existing = icons.find(i => i.id === id)
      const payload = { name: String(body.name ?? '').trim(), icon: String(body.icon ?? '').trim() }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: Icon = { id: nextId(icons), ...payload }
      icons.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Categories (read: any role; upsert: superadmin) ════════════
  if (path === '/v1/categories') {
    requirePermission(ctx, 'admin', 'leader', 'staff')
    if (method === 'GET') return listRes(categories.map(withIcon))
  }
  if (method === 'POST' && path === '/v1/categories/upsert') {
    requireSuperadmin(ctx)
    const id = pid(body.id)
    const existing = categories.find(c => c.id === id)
    const payload = { name: String(body.name ?? '').trim(), iconId: pid(body.iconId, '1') }
    if (existing) { Object.assign(existing, payload, { updateDate: now }); return singleRes(withIcon(existing)) }
    const created: Category = { id: nextId(categories), ...payload, createDate: now, updateDate: now }
    categories.push(created)
    return singleRes(withIcon(created))
  }

  // ════════════ Departments (read: admin; create: superadmin) ════════════
  if (path === '/v1/departments') {
    if (method === 'GET') { requirePermission(ctx, 'admin'); return listRes([...departments].sort((a, b) => a.name.localeCompare(b.name))) }
    if (method === 'POST') {
      requireSuperadmin(ctx)
      const id = pid(body.id)
      const existing = departments.find(d => d.id === id)
      const payload = { name: String(body.name ?? '').trim() }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: Department = { id: nextId(departments), ...payload }
      departments.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Hotel Departments (admin + superadmin, hotel-scoped) ════════════
  if (path === '/v1/hotel-departments') {
    requirePermission(ctx, 'admin')
    if (method === 'GET') {
      const rows = ctx.isSuperAdmin
        ? hotelDepartments.filter(hd => !hd.isRemoved)
        : hotelDepartments.filter(hd => !hd.isRemoved && ctx.adminHotelIds.includes(hd.hotelId) && (!ctx.hotelId || hd.hotelId === ctx.hotelId))
      return listRes(rows.map(hd => ({ ...hd, department: departments.find(d => d.id === hd.departmentId) ?? null })))
    }
    if (method === 'POST') {
      const hotelId = requireHotelId(ctx)
      const departmentId = pid(body.departmentId)
      const existing = hotelDepartments.find(hd => hd.hotelId === hotelId && hd.departmentId === departmentId)
      if (existing) {
        existing.isActive = Boolean(body.isActive ?? existing.isActive)
        existing.isRemoved = Boolean(body.isRemoved ?? false)
        existing.updateDate = now
        return singleRes(existing)
      }
      const created: HotelDepartment = { id: nextId(hotelDepartments), hotelId, departmentId, isActive: Boolean(body.isActive ?? true), isRemoved: false, createDate: now, updateDate: now }
      hotelDepartments.push(created)
      return singleRes(created)
    }
  }

  // ════════════ SLAs (admin + superadmin, hotel-scoped) ════════════
  if (path === '/v1/slas') {
    requirePermission(ctx, 'admin')
    const hotelId = requireHotelId(ctx)
    if (method === 'GET') return listRes(slas.filter(s => s.hotelId === hotelId))
    if (method === 'POST') {
      const id = pid(body.id)
      const existing = slas.find(s => s.id === id && s.hotelId === hotelId)
      const isDefault = Boolean(body.isDefault ?? false)
      if (isDefault) slas.filter(s => s.hotelId === hotelId).forEach(s => { s.isDefault = false })
      const payload = {
        name: String(body.name ?? '').trim(),
        responseTime: Number(body.responseTime ?? 0),
        resolutionTime: Number(body.resolutionTime ?? 0),
        isDefault,
      }
      if (existing) { Object.assign(existing, payload, { updateDate: now }); return singleRes(existing) }
      const created: Sla = { id: nextId(slas), hotelId, ...payload, createDate: now, updateDate: now }
      slas.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Hotel Setup (admin + superadmin, hotel-scoped) ════════════
  if (path === '/v1/master/setups/list') {
    // convenience alias used by branding/wifi to fetch master setup keys
    requirePermission(ctx, 'admin')
    return listRes(masterSetups)
  }
  if (path === '/v1/hotel-setup') {
    requirePermission(ctx, 'admin')
    if (method === 'GET') {
      const hotelId = ctx.hotelId
      const rows = ctx.isSuperAdmin && !hotelId
        ? hotelSetups
        : hotelSetups.filter(r => r.hotelId === (hotelId ?? ''))
      return listRes(rows.map(withSetup))
    }
    if (method === 'POST') {
      const hotelId = requireHotelId(ctx)
      const setupId = pid(body.setupId)
      const value = String(body.value ?? '')
      const existing = hotelSetups.find(r => r.hotelId === hotelId && r.setupId === setupId)
      if (existing) { existing.value = value; existing.updateDate = now; return singleRes(withSetup(existing)) }
      const created: HotelSetup = { id: nextId(hotelSetups), hotelId, setupId, value, createDate: now, updateDate: now }
      hotelSetups.push(created)
      return singleRes(withSetup(created))
    }
  }

  // ════════════ Hotel Sync (superadmin only) ════════════
  if (path === '/v1/hotel-sync') {
    requireSuperadmin(ctx)
    if (method === 'GET') {
      const hotelFilter = pid(query['filter[hotelId][eq]']) || ctx.hotelId || ''
      const rows = hotelFilter ? hotelSyncs.filter(r => r.hotelId === hotelFilter) : hotelSyncs
      return listRes(rows)
    }
    if (method === 'POST') {
      const id = pid(body.id)
      const hotelId = pid(body.hotelId, ctx.hotelId ?? '')
      const applicationId = pid(body.applicationId)
      const useAsymetric = Boolean(body.useAsymetric)
      const existing = hotelSyncs.find(r => id ? r.id === id : r.hotelId === hotelId && r.applicationId === applicationId)
      if (existing) {
        existing.applicationId = applicationId
        existing.hotelId = hotelId
        existing.syncId = pid(body.syncId, existing.syncId)
        existing.useAsymetric = useAsymetric
        existing.privateKey = useAsymetric ? (pid(body.privateKey) || null) : null
        existing.secretKey = useAsymetric ? null : (pid(body.secretKey) || existing.secretKey)
        existing.updateDate = now
        return singleRes(existing)
      }
      const created: HotelSync = {
        id: nextId(hotelSyncs), hotelId, applicationId, syncId: pid(body.syncId, '1'), useAsymetric,
        privateKey: useAsymetric ? (pid(body.privateKey) || null) : null,
        secretKey: useAsymetric ? null : (pid(body.secretKey) || crypto.randomUUID()),
        createDate: now, updateDate: now,
      }
      hotelSyncs.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Room Services (read: any role; upsert/delete: admin) ════════════
  if (path === '/v1/room-services') {
    requirePermission(ctx, 'admin', 'leader', 'staff')
    const hotelId = requireHotelId(ctx)
    if (method === 'GET') return listRes(roomServices.filter(r => r.hotelId === hotelId && !r.isRemoved).map(withIcon))
  }
  if (method === 'POST' && path === '/v1/room-services/upsert') {
    requirePermission(ctx, 'admin')
    const hotelId = requireHotelId(ctx)
    const id = pid(body.id)
    const existing = roomServices.find(r => r.id === id)
    if (existing) {
      existing.name = String(body.name ?? '').trim()
      existing.iconId = pid(body.iconId, existing.iconId)
      existing.description = (body.description as string | null) ?? null
      existing.hyperlink = (body.hyperlink as string | null) ?? null
      existing.isActive = Boolean(body.isActive ?? true)
      existing.updateDate = now
      return singleRes(withIcon(existing))
    }
    const created: RoomService = {
      id: nextId(roomServices), hotelId, iconId: pid(body.iconId, '5'), name: String(body.name ?? '').trim(),
      description: (body.description as string | null) ?? null,
      hyperlink: (body.hyperlink as string | null) ?? null,
      isActive: Boolean(body.isActive ?? true), isRemoved: false, createDate: now, updateDate: now,
    }
    roomServices.push(created)
    return singleRes(withIcon(created))
  }
  if (method === 'DELETE' && path.startsWith('/v1/room-services/')) {
    requirePermission(ctx, 'admin')
    const id = path.split('/').pop()!
    const item = roomServices.find(r => r.id === id)
    if (!item) throw new ApiError('NOT_FOUND', 'Room service not found')
    item.isRemoved = true
    item.updateDate = now
    return singleRes(withIcon(item))
  }

  // ════════════ Category Items + Request Mapping (read: any; upsert: admin) ════════════
  if (path === '/v1/category-items') {
    requirePermission(ctx, 'admin', 'leader', 'staff')
    const hotelId = requireHotelId(ctx)
    if (method === 'GET') return listRes(categoryItems.filter(r => r.hotelId === hotelId && !r.isRemoved).map(withRequestMapping))
  }
  if (method === 'POST' && path === '/v1/category-items/upsert') {
    requirePermission(ctx, 'admin')
    const hotelId = requireHotelId(ctx)
    const id = pid(body.id)
    const rm = (body.requestMapping ?? null) as Record<string, unknown> | null
    let item = categoryItems.find(r => r.id === id)
    if (item) {
      item.name = String(body.name ?? '').trim()
      item.categoryId = pid(body.categoryId, item.categoryId)
      item.iconId = pid(body.iconId, item.iconId)
      item.itemQuantity = Boolean(body.itemQuantity ?? false)
      item.hyperlink = (body.hyperlink as string | null) ?? null
      item.isActive = Boolean(body.isActive ?? true)
      item.updateDate = now
    }
    else {
      item = {
        id: nextId(categoryItems), hotelId, categoryId: pid(body.categoryId, '1'), iconId: pid(body.iconId, '1'),
        name: String(body.name ?? '').trim(), itemQuantity: Boolean(body.itemQuantity ?? false),
        hyperlink: (body.hyperlink as string | null) ?? null, isActive: Boolean(body.isActive ?? true),
        isRemoved: false, createDate: now, updateDate: now,
      }
      categoryItems.push(item)
    }
    // Upsert the request mapping (category-to-department + SLA routing).
    if (rm && pid(rm.departmentId) && pid(rm.slaId)) {
      const existingRm = requestMappings.find(m => m.itemId === item!.id && m.hotelId === hotelId)
      if (existingRm) {
        existingRm.departmentId = pid(rm.departmentId)
        existingRm.slaId = pid(rm.slaId)
        existingRm.remark = (rm.remark as string | null) ?? null
      }
      else {
        requestMappings.push({ id: nextId(requestMappings), hotelId, itemId: item.id, departmentId: pid(rm.departmentId), slaId: pid(rm.slaId), remark: (rm.remark as string | null) ?? null })
      }
    }
    else if (rm === null) {
      const idx = requestMappings.findIndex(m => m.itemId === item!.id && m.hotelId === hotelId)
      if (idx >= 0) requestMappings.splice(idx, 1)
    }
    return singleRes(withRequestMapping(item))
  }
  if (method === 'DELETE' && path.startsWith('/v1/category-items/')) {
    requirePermission(ctx, 'admin')
    const id = path.split('/').pop()!
    const item = categoryItems.find(r => r.id === id)
    if (!item) throw new ApiError('NOT_FOUND', 'Category item not found')
    item.isRemoved = true
    item.updateDate = now
    return singleRes(withRequestMapping(item))
  }

  // ════════════ Users & Roles (list/upsert: admin + superadmin, hotel-scoped) ════════════
  if (path === '/v1/users') {
    requirePermission(ctx, 'admin')
    if (method === 'GET') {
      const rows = ctx.isSuperAdmin
        ? users.filter(u => !u.isRemoved)
        : users.filter(u => !u.isRemoved && userProfiles.some(p => p.userId === u.id && !p.isRemoved && ctx.adminHotelIds.includes(p.hotelId)))
      return listRes(rows.map(userWithProfiles))
    }
  }
  if (method === 'POST' && path === '/v1/users/upsert') {
    requirePermission(ctx, 'admin')
    const id = pid(body.id)
    const email = String(body.email ?? '').trim().toLowerCase()
    let user = users.find(u => u.id === id) ?? users.find(u => u.email.toLowerCase() === email)
    if (user) {
      user.firstName = String(body.firstName ?? user.firstName)
      user.lastName = String(body.lastName ?? user.lastName)
      user.email = email || user.email
      user.isActive = Boolean(body.isActive ?? user.isActive)
      user.isRemoved = Boolean(body.isRemoved ?? user.isRemoved)
      user.updateDate = now
    }
    else {
      user = {
        id: nextId(users), firstName: String(body.firstName ?? ''), lastName: String(body.lastName ?? ''),
        email, picture: null, superAdmin: false, isVerified: false, isActive: Boolean(body.isActive ?? true),
        isRemoved: false, lastLogin: null, createDate: now, updateDate: now,
      }
      users.push(user)
    }
    // Upsert profiles (role assignments per hotel/department).
    const profiles = (body.profiles ?? []) as Array<Record<string, unknown>>
    for (const p of profiles) {
      const pHotelId = pid(p.hotelId)
      if (!ctx.isSuperAdmin && !ctx.adminHotelIds.includes(pHotelId)) continue
      const profileId = pid(p.id)
      const existing = userProfiles.find(up => up.id === profileId) ?? userProfiles.find(up => up.userId === user!.id && up.hotelId === pHotelId)
      if (existing) {
        existing.departmentId = pid(p.departmentId, existing.departmentId)
        existing.position = (p.position as string | null) ?? existing.position
        existing.isAdmin = Boolean(p.isAdmin ?? existing.isAdmin)
        existing.isLeader = Boolean(p.isLeader ?? existing.isLeader)
        existing.createTicket = Boolean(p.createTicket ?? existing.createTicket)
        existing.isActive = Boolean(p.isActive ?? existing.isActive)
        existing.isRemoved = Boolean(p.isRemoved ?? false)
        existing.updateDate = now
      }
      else {
        userProfiles.push({
          id: nextId(userProfiles), hotelId: pHotelId, departmentId: pid(p.departmentId, '1'), userId: user.id,
          position: (p.position as string | null) ?? null, isAdmin: Boolean(p.isAdmin ?? false), isLeader: Boolean(p.isLeader ?? false),
          isActive: Boolean(p.isActive ?? true), isRemoved: false, createTicket: Boolean(p.createTicket ?? false), createDate: now, updateDate: now,
        })
      }
    }
    return singleRes(userWithProfiles(user))
  }

  // ════════════ Message Categories (superadmin only) ════════════
  if (path === '/v1/superadmin/message-categories') {
    requireSuperadmin(ctx)
    if (method === 'GET') return listRes(messageCategories)
    if (method === 'POST') {
      const id = pid(body.id)
      const existing = messageCategories.find(m => m.id === id)
      const payload = { name: String(body.name ?? '').trim() }
      if (existing) { Object.assign(existing, payload); return singleRes(existing) }
      const created: MessageCategory = { id: nextId(messageCategories), ...payload }
      messageCategories.push(created)
      return singleRes(created)
    }
  }

  // ════════════ Template Messages (admin + superadmin, hotel-scoped) ════════════
  if (path === '/v1/template-messages') {
    requirePermission(ctx, 'admin')
    const hotelId = requireHotelId(ctx)
    if (method === 'GET') return listRes(templateMessages.filter(t => t.hotelId === hotelId).map(t => ({ ...t, messageCategory: messageCategories.find(m => m.id === t.messageId) ?? null })))
    if (method === 'POST') {
      const id = pid(body.id)
      const existing = templateMessages.find(t => t.id === id && t.hotelId === hotelId)
      if (existing) {
        existing.title = String(body.title ?? existing.title)
        existing.messageId = pid(body.messageId, existing.messageId)
        existing.updateDate = now
        return singleRes(existing)
      }
      const created: TemplateMessage = { id: nextId(templateMessages), hotelId, messageId: pid(body.messageId, '1'), title: String(body.title ?? '').trim(), createDate: now, updateDate: now }
      templateMessages.push(created)
      return singleRes(created)
    }
  }

  throw new ApiError('NOT_IMPLEMENTED', `[clientFakeApi] unhandled: ${method} ${path}`)
}

// ── shared hotel upsert (used by superadmin/hotels and /hotels/branding) ────────
function upsertHotel(body: Record<string, unknown>, ctx: RequestCtx, now: string) {
  const id = pid(body.id)
  const existing = hotels.find(h => h.id === id)

  if (existing) {
    // Admin may edit only their own assigned hotel; superadmin any hotel.
    if (!ctx.isSuperAdmin && !ctx.adminHotelIds.includes(existing.id)) {
      throw new ApiError('FORBIDDEN', 'You can only edit your own hotel')
    }
    const editable: (keyof Hotel)[] = ['name', 'phone', 'address', 'email', 'website', 'logo', 'primaryColor', 'secondaryColor']
    for (const key of editable) {
      if (body[key] !== undefined) (existing[key] as unknown) = (body[key] as string | null)
    }
    if (ctx.isSuperAdmin) {
      if (body.organizationId !== undefined) existing.organizationId = pid(body.organizationId, existing.organizationId)
      if (body.countryId !== undefined) existing.countryId = pid(body.countryId, existing.countryId)
      if (body.languageId !== undefined) existing.languageId = pid(body.languageId, existing.languageId)
      if (body.timezoneId !== undefined) existing.timezoneId = body.timezoneId == null ? null : pid(body.timezoneId)
      if (body.isActive !== undefined) existing.isActive = Boolean(body.isActive)
    }
    existing.updateDate = now
    return singleRes(existing)
  }

  // Creating a new hotel is superadmin only.
  requireSuperadmin(ctx)
  const created: Hotel = {
    id: nextId(hotels), organizationId: pid(body.organizationId, '1'), countryId: pid(body.countryId, '1'),
    languageId: pid(body.languageId, '1'), timezoneId: body.timezoneId == null ? null : pid(body.timezoneId, '1'),
    name: String(body.name ?? '').trim(), phone: (body.phone as string | null) ?? null, address: (body.address as string | null) ?? null,
    email: (body.email as string | null) ?? null, website: (body.website as string | null) ?? null, logo: (body.logo as string | null) ?? null,
    primaryColor: (body.primaryColor as string | null) ?? null, secondaryColor: (body.secondaryColor as string | null) ?? null,
    isActive: Boolean(body.isActive ?? true), isRemoved: false, createDate: now, updateDate: now,
  }
  hotels.push(created)
  return singleRes(created)
}
