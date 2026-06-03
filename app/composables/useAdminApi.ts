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

export interface HotelSetup {
  id: string
  hotelId: string
  setupId: string
  value: string
  createDate: string
  updateDate: string
  setup?: {
    id: string
    name: string
    setupCode: string
    inputType: string
  } | null
}

export interface MasterSetup {
  id: string
  name: string
  setupCode: string
  inputType: string
  optionValue: string | null
  createDate: string
  updateDate: string
}

export interface Application {
  id: string
  name: string
  createDate: string
  updateDate: string
}

export interface HotelSync {
  id: string
  hotelId: string
  applicationId: string
  useAsymetric: boolean
  privateKey: string | null
  secretKey?: string | null
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
}

export interface Category {
  id: string
  name: string
  iconId: string
  createDate: string
  updateDate: string
  icon: {
    id: string
    name: string
    icon: string
  }
}

export interface CategoryItem {
  id: string
  hotelId: string
  categoryId: string
  iconId: string
  name: string
  itemQuantity: number
  hyperlink: string | null
  isActive: boolean
  isRemoved: boolean
  requestMapping: {
    id: string
    departmentId: string
    slaId: string
    remark: string | null
  } | null
  createDate: string
  updateDate: string
}

export interface SuperadminHotel {
  id: string
  organizationId: string
  countryId: string
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
  languageId: string
  createDate: string
  updateDate: string
}

const DEFAULT_HOTEL_ID = '1'

async function apiRequest<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  return $fetch<T>(path, {
    baseURL,
    ...options,
  })
}

export function useAdminApi() {
  const hotelId = useState<string>('selectedHotelId', () => DEFAULT_HOTEL_ID)

  function setHotelId(nextHotelId: string) {
    hotelId.value = nextHotelId || DEFAULT_HOTEL_ID
  }

  return {
    hotelId,
    setHotelId,

    async listSuperadminHotels() {
      const res = await apiRequest<ApiListResponse<SuperadminHotel>>('/v1/superadmin/hotels', {
        query: {
          sort: 'name',
          dir: 'asc',
        },
      })

      return res.data
    },

    async listMasterSetups() {
      const res = await apiRequest<ApiListResponse<MasterSetup>>('/v1/master/setups')
      return res.data
    },

    async listHotelSetups() {
      const res = await apiRequest<ApiListResponse<HotelSetup>>('/v1/hotel-setup', {
        headers: {
          'x-hotel-id': hotelId.value,
        },
      })

      return res.data
    },

    async upsertHotelSetup(payload: { setupId: string | number; value: string }) {
      const res = await apiRequest<ApiSingleResponse<HotelSetup>>('/v1/hotel-setup', {
        method: 'POST',
        headers: {
          'x-hotel-id': hotelId.value,
        },
        body: {
          hotelId: Number(hotelId.value),
          setupId: Number(payload.setupId),
          value: payload.value,
        },
      })

      return res.data
    },

    async listApplications() {
      const res = await apiRequest<ApiListResponse<Application>>('/v1/applications')
      return res.data
    },

    async listHotelSyncs() {
      const res = await apiRequest<ApiListResponse<HotelSync>>('/v1/hotel-sync', {
        query: {
          'filter[hotelId][eq]': hotelId.value,
        },
      })

      return res.data
    },

    async upsertHotelSync(payload: {
      id?: string
      applicationId: string
      useAsymetric: boolean
      privateKey?: string
    }) {
      const res = await apiRequest<ApiSingleResponse<HotelSync>>('/v1/hotel-sync', {
        method: 'POST',
        body: {
          id: payload.id ? Number(payload.id) : undefined,
          hotelId: Number(hotelId.value),
          applicationId: Number(payload.applicationId),
          useAsymetric: payload.useAsymetric,
          privateKey: payload.privateKey ?? null,
        },
      })

      return res.data
    },

    async listRoomServices() {
      const res = await apiRequest<ApiListResponse<RoomService>>('/v1/room-services', {
        headers: {
          'x-hotel-id': hotelId.value,
        },
      })

      return res.data
    },

    async upsertRoomService(payload: {
      id?: string
      iconId?: string
      name: string
      description?: string
      hyperlink?: string
      isActive: boolean
    }) {
      const res = await apiRequest<ApiSingleResponse<RoomService>>('/v1/room-services/upsert', {
        method: 'POST',
        headers: {
          'x-hotel-id': hotelId.value,
        },
        body: {
          id: payload.id ? Number(payload.id) : undefined,
          iconId: Number(payload.iconId ?? '1'),
          name: payload.name,
          description: payload.description ?? null,
          hyperlink: payload.hyperlink ?? null,
          isActive: payload.isActive,
        },
      })

      return res.data
    },

    async deleteRoomService(id: string) {
      const res = await apiRequest<ApiSingleResponse<RoomService>>(`/v1/room-services/${id}`, {
        method: 'DELETE',
      })

      return res.data
    },

    async listCategories() {
      const res = await apiRequest<ApiListResponse<Category>>('/v1/categories')
      return res.data
    },

    async listCategoryItems() {
      const res = await apiRequest<ApiListResponse<CategoryItem>>('/v1/category-items', {
        headers: {
          'x-hotel-id': hotelId.value,
        },
      })

      return res.data
    },

    async upsertCategoryItem(payload: {
      id?: string
      categoryId: string
      iconId?: string
      name: string
      itemQuantity?: number
      hyperlink?: string
      isActive: boolean
      requestMapping?: {
        id?: string
        departmentId?: string
        slaId?: string
        remark?: string | null
      } | null
    }) {
      const res = await apiRequest<ApiSingleResponse<CategoryItem>>('/v1/category-items', {
        method: 'POST',
        headers: {
          'x-hotel-id': hotelId.value,
        },
        body: {
          id: payload.id ? Number(payload.id) : undefined,
          categoryId: Number(payload.categoryId),
          iconId: Number(payload.iconId ?? '1'),
          name: payload.name,
          itemQuantity: payload.itemQuantity ?? 0,
          hyperlink: payload.hyperlink ?? null,
          isActive: payload.isActive,
          requestMapping: payload.requestMapping
            ? {
                id: payload.requestMapping.id ? Number(payload.requestMapping.id) : undefined,
                departmentId: payload.requestMapping.departmentId ? Number(payload.requestMapping.departmentId) : undefined,
                slaId: payload.requestMapping.slaId ? Number(payload.requestMapping.slaId) : undefined,
                remark: payload.requestMapping.remark ?? null,
              }
            : null,
        },
      })

      return res.data
    },

    async deleteCategoryItem(id: string) {
      const res = await apiRequest<ApiSingleResponse<CategoryItem>>(`/v1/category-items/${id}`, {
        method: 'DELETE',
      })

      return res.data
    },
  }
}
