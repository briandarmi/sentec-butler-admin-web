import { getHeader, getQuery } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const hotelId = getHeader(event, 'x-hotel-id') ?? fakeAdminStore.defaultHotelId

  return fakeAdminStore.listHotelSetups(hotelId, {
    setupIdEq: typeof query['filter[setupId][eq]'] === 'string' ? query['filter[setupId][eq]'] : undefined,
    sort: typeof query.sort === 'string' ? query.sort : 'id',
    dir: fakeAdminStore.parseDir(query.dir),
    limit: fakeAdminStore.parseLimit(query.limit),
  })
})
