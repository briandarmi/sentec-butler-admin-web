import { getHeader, readBody } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ hotelId?: string | number; setupId?: string | number; value?: string }>(event)
  const hotelId = body.hotelId ?? getHeader(event, 'x-hotel-id') ?? fakeAdminStore.defaultHotelId
  return fakeAdminStore.upsertHotelSetup({ ...body, hotelId })
})
