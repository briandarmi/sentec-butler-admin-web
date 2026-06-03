import { readBody } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    id?: string | number
    hotelId?: string | number
    applicationId?: string | number
    useAsymetric?: boolean
    privateKey?: string | null
  }>(event)

  return fakeAdminStore.upsertHotelSync(body)
})
