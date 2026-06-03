type Id = string

type SortDir = 'asc' | 'desc'

interface Hotel {
  id: Id
  organizationId: Id
  countryId: Id
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
  languageId: Id
}

interface MasterSetup {
  id: Id
  name: string
  setupCode: string
  inputType: string
  optionValue: string | null
  createDate: string
  updateDate: string
}

interface HotelSetup {
  id: Id
  hotelId: Id
  setupId: Id
  value: string
  createDate: string
  updateDate: string
}

interface Application {
  id: Id
  name: string
  createDate: string
  updateDate: string
}

interface HotelSync {
  id: Id
  hotelId: Id
  applicationId: Id
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

interface Category {
  id: Id
  name: string
  iconId: Id
  createDate: string
  updateDate: string
}

interface CategoryItem {
  id: Id
  hotelId: Id
  categoryId: Id
  iconId: Id
  name: string
  itemQuantity: number
  hyperlink: string | null
  isActive: boolean
  isRemoved: boolean
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

interface PaginationMeta {
  totalCount: number
  nextCursor: string | null
}

interface ApiListResponse<T> {
  version: 'v1'
  data: T[]
  meta: PaginationMeta
}

interface ApiSingleResponse<T> {
  version: 'v1'
  data: T
}

function nowIso() {
  return new Date().toISOString()
}

function buildListResponse<T>(rows: T[]): ApiListResponse<T> {
  return {
    version: 'v1',
    data: rows,
    meta: {
      totalCount: rows.length,
      nextCursor: null,
    },
  }
}

function buildSingleResponse<T>(row: T): ApiSingleResponse<T> {
  return {
    version: 'v1',
    data: row,
  }
}

function nextId(items: Array<{ id: Id }>): Id {
  if (!items.length) {
    return '1'
  }

  const maxId = items.reduce((max, item) => Math.max(max, Number(item.id)), 0)
  return String(maxId + 1)
}

function parseId(value: unknown, fallback?: Id): Id {
  if (value === null || value === undefined || value === '') {
    return fallback ?? ''
  }

  return String(value)
}

function parseLimit(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  const limit = Number(value)
  if (!Number.isFinite(limit) || limit <= 0) {
    return undefined
  }

  return Math.floor(limit)
}

function parseDir(value: unknown): SortDir {
  return String(value).toLowerCase() === 'desc' ? 'desc' : 'asc'
}

function lower(value: unknown) {
  return String(value ?? '').toLowerCase()
}

function applyNameLike<T extends { name: string }>(rows: T[], nameLike?: string) {
  if (!nameLike) {
    return rows
  }

  const needle = nameLike.toLowerCase()
  return rows.filter((row) => row.name.toLowerCase().includes(needle))
}

function applySort<T extends object>(rows: T[], sort: string, dir: SortDir) {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    const av = lower((a as Record<string, unknown>)[sort])
    const bv = lower((b as Record<string, unknown>)[sort])
    if (av === bv) {
      return 0
    }

    const result = av > bv ? 1 : -1
    return dir === 'asc' ? result : -result
  })
  return sorted
}

function applyLimit<T>(rows: T[], limit?: number) {
  if (!limit) {
    return rows
  }

  return rows.slice(0, limit)
}

const defaultHotelId = '1'

const hotels: Hotel[] = [
  {
    id: '1',
    organizationId: '1',
    countryId: '1',
    name: 'Aston Simatupang',
    phone: null,
    address: 'TB Simatupang',
    email: 'astonsimatupang@gmail.com',
    website: 'astonsimatupang.com',
    logo: null,
    primaryColor: '#027BFF',
    secondaryColor: '#FF1493',
    isActive: true,
    isRemoved: false,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
    languageId: '1',
  },
  {
    id: '2',
    organizationId: '1',
    countryId: '1',
    name: 'Aston Puncak',
    phone: '6278888888',
    address: 'Ciloto',
    email: 'aston@puncak.com',
    website: 'astonpuncak.com',
    logo: null,
    primaryColor: '#1A3C5E',
    secondaryColor: '#C9A84C',
    isActive: true,
    isRemoved: false,
    createDate: '2026-05-19T10:40:54.727Z',
    updateDate: '2026-05-19T10:40:54.727Z',
    languageId: '1',
  },
]

const masterSetups: MasterSetup[] = [
  {
    id: '1',
    name: 'Wifi',
    setupCode: 'WIFI_PASSWORD',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '2',
    name: 'Wifi SSID',
    setupCode: 'WIFI_SSID',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '3',
    name: 'Hotel Name',
    setupCode: 'HOTEL_NAME',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '4',
    name: 'Hotel Logo',
    setupCode: 'HOTEL_LOGO_URL',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '5',
    name: 'Primary Color',
    setupCode: 'PRIMARY_COLOR',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '6',
    name: 'Accent Color',
    setupCode: 'SECONDARY_COLOR',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '7',
    name: 'Font Family',
    setupCode: 'FONT_FAMILY',
    inputType: 'text',
    optionValue: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
]

const hotelSetups: HotelSetup[] = [
  { id: '1', hotelId: '1', setupId: '1', value: 'TEST PASSWORD EDIT', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', hotelId: '1', setupId: '2', value: 'SENTEC_GUEST', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '3', hotelId: '1', setupId: '3', value: 'Aston Simatupang', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '4', hotelId: '1', setupId: '5', value: '#027BFF', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '5', hotelId: '1', setupId: '6', value: '#FF1493', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '6', hotelId: '1', setupId: '7', value: 'Quicksand, sans-serif', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const applications: Application[] = [
  { id: '1', name: 'Sentec PMS', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', name: 'Sentec Booking Engine', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const hotelSyncs: HotelSync[] = [
  {
    id: '1',
    hotelId: '1',
    applicationId: '2',
    useAsymetric: true,
    privateKey: 'ABCDEF',
    secretKey: null,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
  {
    id: '2',
    hotelId: '1',
    applicationId: '1',
    useAsymetric: false,
    privateKey: null,
    secretKey: '770b053d-7736-4db8-8a42-30098bc227f2',
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
]

const roomServices: RoomService[] = [
  {
    id: '1',
    hotelId: '1',
    iconId: '1',
    name: 'In-Room Dining',
    description: 'Order meals and beverages directly to your room',
    hyperlink: 'https://menu.example.com',
    isActive: true,
    isRemoved: false,
    createDate: '2026-05-25T07:59:46.020Z',
    updateDate: '2026-05-25T07:59:46.020Z',
  },
]

const categories: Category[] = [
  { id: '1', name: 'Dining', iconId: '1', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
  { id: '2', name: 'Wellness', iconId: '1', createDate: '2026-05-14T12:46:52.649Z', updateDate: '2026-05-14T12:46:52.649Z' },
]

const categoryItems: CategoryItem[] = [
  {
    id: '1',
    hotelId: '1',
    categoryId: '1',
    iconId: '1',
    name: 'The Azure Grill',
    itemQuantity: 0,
    hyperlink: null,
    isActive: true,
    isRemoved: false,
    createDate: '2026-05-14T12:46:52.649Z',
    updateDate: '2026-05-14T12:46:52.649Z',
  },
]

const requestMappings: RequestMapping[] = [
  {
    id: '1',
    hotelId: '1',
    itemId: '1',
    departmentId: '1',
    slaId: '1',
    remark: 'string',
  },
]

function getCategoryItemResponse(row: CategoryItem) {
  const requestMapping = requestMappings.find((mapping) => mapping.itemId === row.id)

  return {
    id: row.id,
    categoryId: row.categoryId,
    iconId: row.iconId,
    name: row.name,
    itemQuantity: row.itemQuantity,
    hyperlink: row.hyperlink,
    isActive: row.isActive,
    isRemoved: row.isRemoved,
    requestMapping: requestMapping
      ? {
          id: requestMapping.id,
          departmentId: requestMapping.departmentId,
          slaId: requestMapping.slaId,
          remark: requestMapping.remark,
        }
      : null,
    createDate: row.createDate,
    updateDate: row.updateDate,
  }
}

export const fakeAdminStore = {
  defaultHotelId,

  listHotels(options: { nameLike?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = hotels.filter((item) => !item.isRemoved)
    rows = applyNameLike(rows, options.nameLike)
    rows = applySort(rows, options.sort ?? 'name', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)
    return buildListResponse(rows)
  },

  listMasterSetups(options: { nameLike?: string; setupCodeEq?: string; inputTypeEq?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = [...masterSetups]

    if (options.setupCodeEq) {
      rows = rows.filter((item) => item.setupCode === options.setupCodeEq)
    }

    if (options.inputTypeEq) {
      rows = rows.filter((item) => item.inputType === options.inputTypeEq)
    }

    rows = applyNameLike(rows, options.nameLike)
    rows = applySort(rows, options.sort ?? 'name', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)

    return buildListResponse(rows)
  },

  listHotelSetups(hotelId = defaultHotelId, options: { setupIdEq?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = hotelSetups
      .filter((row) => row.hotelId === hotelId)
      .map((row) => ({ ...row, setup: masterSetups.find((setup) => setup.id === row.setupId) ?? null }))

    if (options.setupIdEq) {
      rows = rows.filter((row) => row.setupId === options.setupIdEq)
    }

    rows = applySort(rows, options.sort ?? 'id', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)

    return buildListResponse(rows)
  },

  upsertHotelSetup(payload: { hotelId?: string | number; setupId?: string | number; value?: string }) {
    const hotelId = parseId(payload.hotelId, defaultHotelId)
    const setupId = parseId(payload.setupId)
    const value = String(payload.value ?? '')

    if (!setupId) {
      throw createError({ statusCode: 400, statusMessage: 'setupId is required' })
    }

    const now = nowIso()
    const existing = hotelSetups.find((row) => row.hotelId === hotelId && row.setupId === setupId)

    if (existing) {
      existing.value = value
      existing.updateDate = now
      return buildSingleResponse(existing)
    }

    const created: HotelSetup = {
      id: nextId(hotelSetups),
      hotelId,
      setupId,
      value,
      createDate: now,
      updateDate: now,
    }

    hotelSetups.push(created)
    return buildSingleResponse(created)
  },

  listApplications(options: { nameLike?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = applyNameLike(applications, options.nameLike)
    rows = applySort(rows, options.sort ?? 'name', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)
    return buildListResponse(rows)
  },

  listHotelSyncs(hotelId = defaultHotelId, options: { applicationIdEq?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = hotelSyncs.filter((row) => row.hotelId === hotelId)

    if (options.applicationIdEq) {
      rows = rows.filter((row) => row.applicationId === options.applicationIdEq)
    }

    rows = applySort(rows, options.sort ?? 'id', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)

    return buildListResponse(rows)
  },

  upsertHotelSync(payload: {
    id?: string | number
    hotelId?: string | number
    applicationId?: string | number
    useAsymetric?: boolean
    privateKey?: string | null
  }) {
    const id = parseId(payload.id)
    const hotelId = parseId(payload.hotelId, defaultHotelId)
    const applicationId = parseId(payload.applicationId)

    if (!applicationId) {
      throw createError({ statusCode: 400, statusMessage: 'applicationId is required' })
    }

    const now = nowIso()
    const useAsymetric = Boolean(payload.useAsymetric)
    const existing = hotelSyncs.find((row) => (id ? row.id === id : row.hotelId === hotelId && row.applicationId === applicationId))

    if (existing) {
      existing.applicationId = applicationId
      existing.hotelId = hotelId
      existing.useAsymetric = useAsymetric
      existing.privateKey = useAsymetric ? payload.privateKey ?? null : null
      existing.secretKey = useAsymetric ? null : existing.secretKey ?? crypto.randomUUID()
      existing.updateDate = now
      return buildSingleResponse(existing)
    }

    const created: HotelSync = {
      id: nextId(hotelSyncs),
      hotelId,
      applicationId,
      useAsymetric,
      privateKey: useAsymetric ? payload.privateKey ?? null : null,
      secretKey: useAsymetric ? null : crypto.randomUUID(),
      createDate: now,
      updateDate: now,
    }

    hotelSyncs.push(created)
    return buildSingleResponse(created)
  },

  listRoomServices(hotelId = defaultHotelId, options: { nameLike?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = roomServices.filter((row) => row.hotelId === hotelId && !row.isRemoved)
    rows = applyNameLike(rows, options.nameLike)
    rows = applySort(rows, options.sort ?? 'name', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)
    return buildListResponse(rows)
  },

  upsertRoomService(payload: {
    id?: string | number
    hotelId?: string | number
    iconId?: string | number
    name?: string
    description?: string | null
    hyperlink?: string | null
    isActive?: boolean
  }) {
    const id = parseId(payload.id)
    const hotelId = parseId(payload.hotelId, defaultHotelId)
    const iconId = parseId(payload.iconId, '1')
    const name = String(payload.name ?? '').trim()

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    const now = nowIso()
    const existing = roomServices.find((row) => row.id === id)

    if (existing) {
      existing.name = name
      existing.iconId = iconId
      existing.description = payload.description ?? null
      existing.hyperlink = payload.hyperlink ?? null
      existing.isActive = payload.isActive ?? true
      existing.updateDate = now
      return buildSingleResponse(existing)
    }

    const created: RoomService = {
      id: nextId(roomServices),
      hotelId,
      iconId,
      name,
      description: payload.description ?? null,
      hyperlink: payload.hyperlink ?? null,
      isActive: payload.isActive ?? true,
      isRemoved: false,
      createDate: now,
      updateDate: now,
    }

    roomServices.push(created)
    return buildSingleResponse(created)
  },

  archiveRoomService(id: string) {
    const existing = roomServices.find((row) => row.id === id)

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Room service not found' })
    }

    existing.isRemoved = true
    existing.updateDate = nowIso()
    return buildSingleResponse(existing)
  },

  listCategories(options: { nameLike?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = categories.map((item) => ({
      ...item,
      icon: {
        id: item.iconId,
        name: 'room-service',
        icon: '*',
      },
    }))

    if (options.nameLike) {
      rows = rows.filter((row) => row.name.toLowerCase().includes(options.nameLike!.toLowerCase()))
    }

    rows = applySort(rows, options.sort ?? 'name', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)

    return buildListResponse(rows)
  },

  listCategoryItems(hotelId = defaultHotelId, options: { nameLike?: string; sort?: string; dir?: SortDir; limit?: number } = {}) {
    let rows = categoryItems.filter((row) => row.hotelId === hotelId && !row.isRemoved)
    rows = applyNameLike(rows, options.nameLike)
    rows = applySort(rows, options.sort ?? 'name', options.dir ?? 'asc')
    rows = applyLimit(rows, options.limit)

    return buildListResponse(rows.map(getCategoryItemResponse))
  },

  upsertCategoryItem(payload: {
    id?: string | number
    hotelId?: string | number
    categoryId?: string | number
    iconId?: string | number
    name?: string
    itemQuantity?: number
    hyperlink?: string | null
    isActive?: boolean
    requestMapping?: {
      id?: string | number
      departmentId?: string | number
      slaId?: string | number
      remark?: string | null
    } | null
  }) {
    const id = parseId(payload.id)
    const hotelId = parseId(payload.hotelId, defaultHotelId)
    const categoryId = parseId(payload.categoryId, '1')
    const iconId = parseId(payload.iconId, '1')
    const name = String(payload.name ?? '').trim()

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    const now = nowIso()
    const existing = categoryItems.find((row) => row.id === id)

    if (existing) {
      existing.name = name
      existing.categoryId = categoryId
      existing.iconId = iconId
      existing.itemQuantity = Number(payload.itemQuantity ?? 0)
      existing.hyperlink = payload.hyperlink ?? null
      existing.isActive = payload.isActive ?? true
      existing.updateDate = now

      if (payload.requestMapping) {
        const mappingId = parseId(payload.requestMapping.id)
        const mapping = requestMappings.find((item) => (mappingId ? item.id === mappingId : item.itemId === existing.id))
        if (mapping) {
          mapping.departmentId = parseId(payload.requestMapping.departmentId, mapping.departmentId)
          mapping.slaId = parseId(payload.requestMapping.slaId, mapping.slaId)
          mapping.remark = payload.requestMapping.remark ?? null
        }
      }

      return buildSingleResponse(getCategoryItemResponse(existing))
    }

    const created: CategoryItem = {
      id: nextId(categoryItems),
      hotelId,
      categoryId,
      iconId,
      name,
      itemQuantity: Number(payload.itemQuantity ?? 0),
      hyperlink: payload.hyperlink ?? null,
      isActive: payload.isActive ?? true,
      isRemoved: false,
      createDate: now,
      updateDate: now,
    }

    categoryItems.push(created)

    if (payload.requestMapping) {
      requestMappings.push({
        id: nextId(requestMappings),
        hotelId,
        itemId: created.id,
        departmentId: parseId(payload.requestMapping.departmentId, '1'),
        slaId: parseId(payload.requestMapping.slaId, '1'),
        remark: payload.requestMapping.remark ?? null,
      })
    }

    return buildSingleResponse(getCategoryItemResponse(created))
  },

  archiveCategoryItem(id: string) {
    const existing = categoryItems.find((row) => row.id === id)

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Category item not found' })
    }

    existing.isRemoved = true
    existing.updateDate = nowIso()
    return buildSingleResponse(getCategoryItemResponse(existing))
  },

  getHotel(hotelId = defaultHotelId) {
    const hotel = hotels.find((row) => row.id === hotelId)

    if (!hotel) {
      throw createError({ statusCode: 404, statusMessage: 'Hotel not found' })
    }

    return buildSingleResponse(hotel)
  },

  parseLimit,
  parseDir,
}
