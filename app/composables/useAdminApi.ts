import { useAuth } from '~/composables/useAuth'

type ApiVersion = 'v1'

interface ApiMeta {
  totalCount: number
  nextCursor: string | null
}

interface ApiListResponse<T> {
  version: ApiVersion
  data: T[]
  meta: ApiMeta
}

interface ApiSingleResponse<T> {
  version: ApiVersion
  data: T
}

// ── entity types (match clientFakeApi responses) ──────────────────────────────

export interface Organization { id: string; name: string }
export interface Country { id: string; name: string; code: string; demonym: string | null }
export interface Language { id: string; name: string; code: string }
export interface Timezone { id: string; name: string; utcOffset: string }
export interface Application { id: string; name: string; createDate: string; updateDate: string }
export interface Icon { id: string; name: string; icon: string }

export interface Hotel {
  id: string
  organizationId: string
  countryId: string
  languageId: string
  timezoneId: string | null
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

export interface MasterSetup {
  id: string
  name: string
  setupCode: string
  inputType: 'text' | 'number' | 'option' | 'date' | 'time'
  optionValue: string | null
}

export interface HotelSetup {
  id: string
  hotelId: string
  setupId: string
  value: string
  createDate: string
  updateDate: string
  setup?: MasterSetup | null
}

export interface HotelSync {
  id: string
  hotelId: string
  applicationId: string
  syncId: string
  useAsymetric: boolean
  privateKey: string | null
  secretKey: string | null
  createDate: string
  updateDate: string
}

export interface RoomService {
  id: string
  hotelId: string
  iconId: string
  name: string
  description: string | null
  hyperlink: string | null
  isActive: boolean
  isRemoved: boolean
  createDate: string
  updateDate: string
  icon?: Icon | null
}

export interface Category {
  id: string
  iconId: string
  name: string
  createDate: string
  updateDate: string
  icon?: Icon | null
}

export interface RequestMapping {
  id: string
  departmentId: string
  slaId: string
  remark: string | null
}

export interface CategoryItem {
  id: string
  hotelId: string
  categoryId: string
  iconId: string
  name: string
  itemQuantity: boolean
  hyperlink: string | null
  isActive: boolean
  isRemoved: boolean
  requestMapping: RequestMapping | null
  createDate: string
  updateDate: string
  icon?: Icon | null
}

export interface Department { id: string; name: string }

export interface HotelDepartment {
  id: string
  hotelId: string
  departmentId: string
  isActive: boolean
  isRemoved: boolean
  createDate: string
  updateDate: string
  department?: Department | null
}

export interface Sla {
  id: string
  hotelId: string
  name: string
  responseTime: number
  resolutionTime: number
  isDefault: boolean
  createDate: string
  updateDate: string
}

export interface MessageCategory { id: string; name: string }

export interface TemplateMessage {
  id: string
  hotelId: string
  messageId: string
  title: string
  createDate: string
  updateDate: string
  messageCategory?: MessageCategory | null
}

export interface UserProfile {
  id: string
  hotelId: string
  departmentId: string
  userId: string
  position: string | null
  isAdmin: boolean
  isLeader: boolean
  isActive: boolean
  isRemoved: boolean
  createTicket: boolean
  createDate: string
  updateDate: string
  hotel?: Hotel | null
  department?: Department | null
}

export interface AdminUser {
  id: string
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
  profiles: UserProfile[]
}

const DEFAULT_HOTEL_ID = '1'

export function useAdminApi() {
  const auth = useAuth()
  const hotelId = useState<string>('selectedHotelId', () => DEFAULT_HOTEL_ID)

  function setHotelId(nextHotelId: string) {
    hotelId.value = nextHotelId || DEFAULT_HOTEL_ID
  }

  async function apiRequest<T>(
    path: string,
    options?: { method?: string; body?: unknown; query?: Record<string, unknown>; hotelId?: string },
  ): Promise<T> {
    const { handleFakeApiRequest } = await import('~/utils/clientFakeApi')
    return handleFakeApiRequest(path, {
      method: options?.method,
      body: options?.body,
      query: options?.query,
      headers: {
        'x-user-id': auth.userId.value ?? '',
        'x-hotel-id': options?.hotelId ?? hotelId.value,
      },
    }) as T
  }

  return {
    hotelId,
    setHotelId,

    // ── Organizations (superadmin) ──────────────────────────────────────────
    async listOrganizations() {
      return (await apiRequest<ApiListResponse<Organization>>('/v1/superadmin/organizations')).data
    },
    async upsertOrganization(payload: { id?: string; name: string }) {
      return (await apiRequest<ApiSingleResponse<Organization>>('/v1/superadmin/organizations', { method: 'POST', body: payload })).data
    },

    // ── Hotels (superadmin) ─────────────────────────────────────────────────
    async listHotels(filter?: { organizationId?: string }) {
      return (await apiRequest<ApiListResponse<Hotel>>('/v1/superadmin/hotels', {
        query: filter?.organizationId ? { 'filter[organizationId][eq]': filter.organizationId } : undefined,
      })).data
    },
    async upsertHotel(payload: Partial<Hotel> & { name: string }) {
      return (await apiRequest<ApiSingleResponse<Hotel>>('/v1/superadmin/hotels', { method: 'POST', body: payload })).data
    },
    async deleteHotel(id: string) {
      return (await apiRequest<ApiSingleResponse<Hotel>>(`/v1/superadmin/hotels/${id}`, { method: 'DELETE' })).data
    },
    // Current active hotel detail (admin of that hotel, or superadmin)
    async getCurrentHotel() {
      return (await apiRequest<ApiSingleResponse<Hotel>>('/v1/hotel')).data
    },
    // Branding edit (own hotel for admin, any for superadmin)
    async upsertBranding(payload: Partial<Hotel> & { id: string }) {
      return (await apiRequest<ApiSingleResponse<Hotel>>('/v1/hotels/branding', { method: 'POST', body: payload })).data
    },

    // ── Applications ────────────────────────────────────────────────────────
    async listApplications() {
      return (await apiRequest<ApiListResponse<Application>>('/v1/applications')).data
    },

    // ── Master data (superadmin) ────────────────────────────────────────────
    async listCountries() {
      return (await apiRequest<ApiListResponse<Country>>('/v1/master/countries')).data
    },
    async upsertCountry(payload: { id?: string; name: string; code: string; demonym?: string | null }) {
      return (await apiRequest<ApiSingleResponse<Country>>('/v1/master/countries', { method: 'POST', body: payload })).data
    },
    async listLanguages() {
      return (await apiRequest<ApiListResponse<Language>>('/v1/master/languages')).data
    },
    async upsertLanguage(payload: { id?: string; name: string; code: string }) {
      return (await apiRequest<ApiSingleResponse<Language>>('/v1/master/languages', { method: 'POST', body: payload })).data
    },
    async listMasterSetups() {
      return (await apiRequest<ApiListResponse<MasterSetup>>('/v1/master/setups/list')).data
    },
    async listMasterSetupKeys() {
      return (await apiRequest<ApiListResponse<MasterSetup>>('/v1/master/setups')).data
    },
    async upsertMasterSetup(payload: { id?: string; name: string; setupCode: string; inputType: string; optionValue?: string | null }) {
      return (await apiRequest<ApiSingleResponse<MasterSetup>>('/v1/master/setups', { method: 'POST', body: payload })).data
    },
    async listTimezones() {
      return (await apiRequest<ApiListResponse<Timezone>>('/v1/timezones')).data
    },
    async upsertTimezone(payload: { id?: string; name: string; utcOffset: string }) {
      return (await apiRequest<ApiSingleResponse<Timezone>>('/v1/timezones', { method: 'POST', body: payload })).data
    },
    async listIcons() {
      return (await apiRequest<ApiListResponse<Icon>>('/v1/icons')).data
    },
    async upsertIcon(payload: { id?: string; name: string; icon: string }) {
      return (await apiRequest<ApiSingleResponse<Icon>>('/v1/icons', { method: 'POST', body: payload })).data
    },

    // ── Categories ──────────────────────────────────────────────────────────
    async listCategories() {
      return (await apiRequest<ApiListResponse<Category>>('/v1/categories')).data
    },
    async upsertCategory(payload: { id?: string; name: string; iconId: string }) {
      return (await apiRequest<ApiSingleResponse<Category>>('/v1/categories/upsert', { method: 'POST', body: payload })).data
    },

    // ── Departments + Hotel Departments ──────────────────────────────────────
    async listDepartments() {
      return (await apiRequest<ApiListResponse<Department>>('/v1/departments')).data
    },
    async upsertDepartment(payload: { id?: string; name: string }) {
      return (await apiRequest<ApiSingleResponse<Department>>('/v1/departments', { method: 'POST', body: payload })).data
    },
    async listHotelDepartments() {
      return (await apiRequest<ApiListResponse<HotelDepartment>>('/v1/hotel-departments')).data
    },
    async upsertHotelDepartment(payload: { id?: string; departmentId: string; isActive?: boolean; isRemoved?: boolean }) {
      return (await apiRequest<ApiSingleResponse<HotelDepartment>>('/v1/hotel-departments', { method: 'POST', body: { hotelId: hotelId.value, ...payload } })).data
    },

    // ── SLAs ────────────────────────────────────────────────────────────────
    async listSlas() {
      return (await apiRequest<ApiListResponse<Sla>>('/v1/slas')).data
    },
    async upsertSla(payload: { id?: string; name: string; responseTime: number; resolutionTime: number; isDefault?: boolean }) {
      return (await apiRequest<ApiSingleResponse<Sla>>('/v1/slas', { method: 'POST', body: payload })).data
    },

    // ── Hotel Setup (branding/wifi/checkout key-value) ───────────────────────
    async listHotelSetups() {
      return (await apiRequest<ApiListResponse<HotelSetup>>('/v1/hotel-setup')).data
    },
    async upsertHotelSetup(payload: { setupId: string; value: string }) {
      return (await apiRequest<ApiSingleResponse<HotelSetup>>('/v1/hotel-setup', { method: 'POST', body: { hotelId: hotelId.value, ...payload } })).data
    },

    // ── Hotel Sync (superadmin) ──────────────────────────────────────────────
    async listHotelSyncs() {
      return (await apiRequest<ApiListResponse<HotelSync>>('/v1/hotel-sync', { query: { 'filter[hotelId][eq]': hotelId.value } })).data
    },
    async upsertHotelSync(payload: { id?: string; applicationId: string; syncId?: string; useAsymetric: boolean; privateKey?: string | null; secretKey?: string | null }) {
      return (await apiRequest<ApiSingleResponse<HotelSync>>('/v1/hotel-sync', { method: 'POST', body: { hotelId: hotelId.value, ...payload } })).data
    },

    // ── Room Services ─────────────────────────────────────────────────────────
    async listRoomServices() {
      return (await apiRequest<ApiListResponse<RoomService>>('/v1/room-services')).data
    },
    async upsertRoomService(payload: { id?: string; iconId?: string; name: string; description?: string | null; hyperlink?: string | null; isActive: boolean }) {
      return (await apiRequest<ApiSingleResponse<RoomService>>('/v1/room-services/upsert', { method: 'POST', body: payload })).data
    },
    async deleteRoomService(id: string) {
      return (await apiRequest<ApiSingleResponse<RoomService>>(`/v1/room-services/${id}`, { method: 'DELETE' })).data
    },

    // ── Category Items + Request Mapping ──────────────────────────────────────
    async listCategoryItems() {
      return (await apiRequest<ApiListResponse<CategoryItem>>('/v1/category-items')).data
    },
    async upsertCategoryItem(payload: {
      id?: string
      categoryId: string
      iconId?: string
      name: string
      itemQuantity?: boolean
      hyperlink?: string | null
      isActive: boolean
      requestMapping?: { id?: string; departmentId?: string; slaId?: string; remark?: string | null } | null
    }) {
      return (await apiRequest<ApiSingleResponse<CategoryItem>>('/v1/category-items/upsert', { method: 'POST', body: payload })).data
    },
    async deleteCategoryItem(id: string) {
      return (await apiRequest<ApiSingleResponse<CategoryItem>>(`/v1/category-items/${id}`, { method: 'DELETE' })).data
    },

    // ── Users & Roles ─────────────────────────────────────────────────────────
    async listUsers() {
      return (await apiRequest<ApiListResponse<AdminUser>>('/v1/users')).data
    },
    async upsertUser(payload: {
      id?: string
      firstName: string
      lastName: string
      email: string
      isActive?: boolean
      isRemoved?: boolean
      profiles?: Array<{ id?: string; hotelId: string; departmentId: string; position?: string | null; isAdmin?: boolean; isLeader?: boolean; createTicket?: boolean; isActive?: boolean; isRemoved?: boolean }>
    }) {
      return (await apiRequest<ApiSingleResponse<AdminUser>>('/v1/users/upsert', { method: 'POST', body: payload })).data
    },

    // ── Message Categories (superadmin) ──────────────────────────────────────
    async listMessageCategories() {
      return (await apiRequest<ApiListResponse<MessageCategory>>('/v1/superadmin/message-categories')).data
    },
    async upsertMessageCategory(payload: { id?: string; name: string }) {
      return (await apiRequest<ApiSingleResponse<MessageCategory>>('/v1/superadmin/message-categories', { method: 'POST', body: payload })).data
    },

    // ── Template Messages ─────────────────────────────────────────────────────
    async listTemplateMessages() {
      return (await apiRequest<ApiListResponse<TemplateMessage>>('/v1/template-messages')).data
    },
    async upsertTemplateMessage(payload: { id?: string; messageId: string; title: string }) {
      return (await apiRequest<ApiSingleResponse<TemplateMessage>>('/v1/template-messages', { method: 'POST', body: payload })).data
    },
  }
}
