import { getQuery } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const hotelId = typeof query['filter[hotelId][eq]'] === 'string' ? query['filter[hotelId][eq]'] : fakeAdminStore.defaultHotelId

  return fakeAdminStore.listHotelSyncs(hotelId, {
    applicationIdEq: typeof query['filter[applicationId][eq]'] === 'string' ? query['filter[applicationId][eq]'] : undefined,
    sort: typeof query.sort === 'string' ? query.sort : 'id',
    dir: fakeAdminStore.parseDir(query.dir),
    limit: fakeAdminStore.parseLimit(query.limit),
  })
})
