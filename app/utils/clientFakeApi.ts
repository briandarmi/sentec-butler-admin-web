// Client-side fake API handler.
// Mirrors server/utils/fakeAdminStore.ts so the app runs as a fully
// static SPA (no Nitro server required) when useFakeApiClient is true.

type Id = string

function nowIso() { return new Date().toISOString() }
function nextId(items: { id: Id }[]) {
  return String(items.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1)
}
function pid(v: unknown, fallback = '') { return (v != null && v !== '') ? String(v) : fallback }
function listRes<T>(data: T[]) { return { version: 'v1' as const, data, meta: { totalCount: data.length, nextCursor: null } } }
function singleRes<T>(data: T) { return { version: 'v1' as const, data } }

// ── seed data ────────────────────────────────────────────────────────────────

const hotels = [
  { id: '1', organizationId: '1', countryId: '1', name: 'Aston Simatupang', phone: null, address: 'TB Simatupang', email: 'astonsimatupang@gmail.com', website: 'astonsimatupang.com', logo: null, primaryColor: '#027BFF', secondaryColor: '#FF1493', isActive: true, isRemoved: false, languageId: '1', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', organizationId: '1', countryId: '1', name: 'Aston Puncak', phone: '6278888888', address: 'Ciloto', email: 'aston@puncak.com', website: 'astonpuncak.com', logo: null, primaryColor: '#1A3C5E', secondaryColor: '#C9A84C', isActive: true, isRemoved: false, languageId: '2', createDate: '2026-05-19T10:40:54.727Z', updateDate: '2026-05-19T10:40:54.727Z' },
  { id: '3', organizationId: '2', countryId: '1', name: 'Aryaduta Jakarta', phone: '62213924001', address: 'Jl. Piapirat No.44', email: 'jakarta@aryaduta.com', website: 'aryaduta.com', logo: null, primaryColor: '#8B1A1A', secondaryColor: '#D4AF37', isActive: true, isRemoved: false, languageId: '1', createDate: '2026-05-20T09:00:00.000Z', updateDate: '2026-05-20T09:00:00.000Z' },
  { id: '4', organizationId: '2', countryId: '1', name: 'Aryaduta Bali', phone: '62361888000', address: 'Bali', email: 'bali@aryaduta.com', website: 'aryaduta.com', logo: null, primaryColor: '#8B1A1A', secondaryColor: '#D4AF37', isActive: false, isRemoved: false, languageId: '3', createDate: '2026-05-20T09:00:00.000Z', updateDate: '2026-05-20T09:00:00.000Z' },
]

const masterSetups = [
  { id: '1', name: 'Wifi Password', setupCode: 'WIFI_PASSWORD', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', name: 'Wifi SSID', setupCode: 'WIFI_SSID', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '3', name: 'Hotel Name', setupCode: 'HOTEL_NAME', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '4', name: 'Hotel Logo URL', setupCode: 'HOTEL_LOGO_URL', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '5', name: 'Primary Color', setupCode: 'PRIMARY_COLOR', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '6', name: 'Accent Color', setupCode: 'SECONDARY_COLOR', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '7', name: 'Font Family', setupCode: 'FONT_FAMILY', inputType: 'text', optionValue: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const hotelSetups = [
  { id: '1', hotelId: '1', setupId: '1', value: 'guest-password', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', hotelId: '1', setupId: '2', value: 'SENTEC_GUEST', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '3', hotelId: '1', setupId: '3', value: 'Aston Simatupang', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '4', hotelId: '1', setupId: '5', value: '#027BFF', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '5', hotelId: '1', setupId: '6', value: '#FF1493', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '6', hotelId: '1', setupId: '7', value: 'Quicksand, sans-serif', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const applications = [
  { id: '1', name: 'Sentec PMS', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', name: 'Sentec Booking Engine', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const hotelSyncs = [
  { id: '1', hotelId: '1', applicationId: '2', useAsymetric: true, privateKey: 'ABCDEF', secretKey: null, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', hotelId: '1', applicationId: '1', useAsymetric: false, privateKey: null, secretKey: '770b053d-7736-4db8-8a42-30098bc227f2', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const roomServices = [
  { id: '1', hotelId: '1', iconId: '1', name: 'In-Room Dining', description: 'Order meals and beverages directly to your room', hyperlink: 'https://menu.example.com', isActive: true, isRemoved: false, createDate: '2026-05-25T07:59:46.020Z', updateDate: '2026-05-25T07:59:46.020Z' },
  { id: '2', hotelId: '1', iconId: '1', name: 'Laundry Service', description: 'Same-day laundry and dry cleaning', hyperlink: null, isActive: true, isRemoved: false, createDate: '2026-05-25T08:00:00.000Z', updateDate: '2026-05-25T08:00:00.000Z' },
]

const categories = [
  { id: '1', name: 'Dining', iconId: '1', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', name: 'Wellness', iconId: '1', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '3', name: 'Activities', iconId: '1', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const categoryItems = [
  { id: '1', hotelId: '1', categoryId: '1', iconId: '1', name: 'The Azure Grill', itemQuantity: 0, hyperlink: null, isActive: true, isRemoved: false, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', hotelId: '1', categoryId: '2', iconId: '1', name: 'Spa & Wellness', itemQuantity: 0, hyperlink: null, isActive: true, isRemoved: false, createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const requestMappings = [
  { id: '1', hotelId: '1', itemId: '1', departmentId: '1', slaId: '1', remark: null },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function withRequestMapping(item: typeof categoryItems[number]) {
  const rm = requestMappings.find(m => m.itemId === item.id)
  return {
    ...item,
    requestMapping: rm ? { id: rm.id, departmentId: rm.departmentId, slaId: rm.slaId, remark: rm.remark } : null,
  }
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
  const hotelHeader = headers['x-hotel-id'] ?? '1'

  // ── GET /v1/superadmin/hotels ─────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/superadmin/hotels') {
    const rows = [...hotels].filter(h => !h.isRemoved).sort((a, b) => a.name.localeCompare(b.name))
    return listRes(rows)
  }

  // ── GET /v1/master/setups ─────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/master/setups') {
    return listRes(masterSetups)
  }

  // ── GET /v1/hotel-setup ───────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/hotel-setup') {
    const rows = hotelSetups
      .filter(r => r.hotelId === hotelHeader)
      .map(r => ({ ...r, setup: masterSetups.find(s => s.id === r.setupId) ?? null }))
    return listRes(rows)
  }

  // ── POST /v1/hotel-setup ──────────────────────────────────────────────────
  if (method === 'POST' && path === '/v1/hotel-setup') {
    const hotelId = pid(body.hotelId, hotelHeader)
    const setupId = pid(body.setupId)
    const value = String(body.value ?? '')
    const now = nowIso()
    const existing = hotelSetups.find(r => r.hotelId === hotelId && r.setupId === setupId)
    if (existing) {
      existing.value = value
      existing.updateDate = now
      return singleRes(existing)
    }
    const created = { id: nextId(hotelSetups), hotelId, setupId, value, createDate: now, updateDate: now }
    hotelSetups.push(created)
    return singleRes(created)
  }

  // ── GET /v1/applications ──────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/applications') {
    return listRes(applications)
  }

  // ── GET /v1/hotel-sync ────────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/hotel-sync') {
    const hotelId = pid((opts.query ?? {})['filter[hotelId][eq]'], hotelHeader)
    return listRes(hotelSyncs.filter(r => r.hotelId === hotelId))
  }

  // ── POST /v1/hotel-sync ───────────────────────────────────────────────────
  if (method === 'POST' && path === '/v1/hotel-sync') {
    const id = pid(body.id)
    const hotelId = pid(body.hotelId, '1')
    const applicationId = pid(body.applicationId)
    const useAsymetric = Boolean(body.useAsymetric)
    const now = nowIso()
    const existing = hotelSyncs.find(r => id ? r.id === id : r.hotelId === hotelId && r.applicationId === applicationId)
    if (existing) {
      existing.applicationId = applicationId
      existing.hotelId = hotelId
      existing.useAsymetric = useAsymetric
      existing.privateKey = useAsymetric ? pid(body.privateKey) || null : null
      existing.updateDate = now
      return singleRes(existing)
    }
    const created = {
      id: nextId(hotelSyncs), hotelId, applicationId, useAsymetric,
      privateKey: useAsymetric ? pid(body.privateKey) || null : null,
      secretKey: useAsymetric ? null : crypto.randomUUID(),
      createDate: now, updateDate: now,
    }
    hotelSyncs.push(created)
    return singleRes(created)
  }

  // ── GET /v1/room-services ─────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/room-services') {
    const rows = roomServices.filter(r => r.hotelId === hotelHeader && !r.isRemoved)
    return listRes(rows)
  }

  // ── POST /v1/room-services/upsert ─────────────────────────────────────────
  if (method === 'POST' && path === '/v1/room-services/upsert') {
    const id = pid(body.id)
    const hotelId = pid(body.hotelId, hotelHeader)
    const name = String(body.name ?? '').trim()
    const now = nowIso()
    const existing = roomServices.find(r => r.id === id)
    if (existing) {
      existing.name = name
      existing.iconId = pid(body.iconId, existing.iconId)
      existing.description = (body.description as string | null) ?? null
      existing.hyperlink = (body.hyperlink as string | null) ?? null
      existing.isActive = Boolean(body.isActive ?? true)
      existing.updateDate = now
      return singleRes(existing)
    }
    const created = {
      id: nextId(roomServices), hotelId, iconId: pid(body.iconId, '1'), name,
      description: (body.description as string | null) ?? null,
      hyperlink: (body.hyperlink as string | null) ?? null,
      isActive: Boolean(body.isActive ?? true), isRemoved: false,
      createDate: now, updateDate: now,
    }
    roomServices.push(created)
    return singleRes(created)
  }

  // ── DELETE /v1/room-services/:id ──────────────────────────────────────────
  if (method === 'DELETE' && path.startsWith('/v1/room-services/')) {
    const id = path.split('/').pop()!
    const item = roomServices.find(r => r.id === id)
    if (!item) throw new Error('Room service not found')
    item.isRemoved = true
    item.updateDate = nowIso()
    return singleRes(item)
  }

  // ── GET /v1/categories ────────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/categories') {
    const rows = categories.map(c => ({ ...c, icon: { id: c.iconId, name: 'icon', icon: '*' } }))
    return listRes(rows)
  }

  // ── GET /v1/category-items ────────────────────────────────────────────────
  if (method === 'GET' && path === '/v1/category-items') {
    const rows = categoryItems.filter(r => r.hotelId === hotelHeader && !r.isRemoved).map(withRequestMapping)
    return listRes(rows)
  }

  // ── POST /v1/category-items ───────────────────────────────────────────────
  if (method === 'POST' && path === '/v1/category-items') {
    const id = pid(body.id)
    const hotelId = pid(body.hotelId, hotelHeader)
    const categoryId = pid(body.categoryId, '1')
    const name = String(body.name ?? '').trim()
    const now = nowIso()
    const existing = categoryItems.find(r => r.id === id)
    if (existing) {
      existing.name = name
      existing.categoryId = categoryId
      existing.iconId = pid(body.iconId, existing.iconId)
      existing.itemQuantity = Number(body.itemQuantity ?? 0)
      existing.hyperlink = (body.hyperlink as string | null) ?? null
      existing.isActive = Boolean(body.isActive ?? true)
      existing.updateDate = now
      return singleRes(withRequestMapping(existing))
    }
    const created = {
      id: nextId(categoryItems), hotelId, categoryId, iconId: pid(body.iconId, '1'), name,
      itemQuantity: Number(body.itemQuantity ?? 0),
      hyperlink: (body.hyperlink as string | null) ?? null,
      isActive: Boolean(body.isActive ?? true), isRemoved: false,
      createDate: now, updateDate: now,
    }
    categoryItems.push(created)
    return singleRes(withRequestMapping(created))
  }

  // ── DELETE /v1/category-items/:id ─────────────────────────────────────────
  if (method === 'DELETE' && path.startsWith('/v1/category-items/')) {
    const id = path.split('/').pop()!
    const item = categoryItems.find(r => r.id === id)
    if (!item) throw new Error('Category item not found')
    item.isRemoved = true
    item.updateDate = nowIso()
    return singleRes(withRequestMapping(item))
  }

  throw new Error(`[clientFakeApi] unhandled: ${method} ${path}`)
}
