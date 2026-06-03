import { getHeader, readBody } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
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
  }>(event)

  const hotelId = body.hotelId ?? getHeader(event, 'x-hotel-id') ?? fakeAdminStore.defaultHotelId
  return fakeAdminStore.upsertCategoryItem({ ...body, hotelId })
})
