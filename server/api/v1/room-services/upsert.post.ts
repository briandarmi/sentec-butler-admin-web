import { getHeader, readBody } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    id?: string | number
    hotelId?: string | number
    iconId?: string | number
    name?: string
    description?: string | null
    hyperlink?: string | null
    isActive?: boolean
  }>(event)

  const hotelId = body.hotelId ?? getHeader(event, 'x-hotel-id') ?? fakeAdminStore.defaultHotelId
  return fakeAdminStore.upsertRoomService({ ...body, hotelId })
})
