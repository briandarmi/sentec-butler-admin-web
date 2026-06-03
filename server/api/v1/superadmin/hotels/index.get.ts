import { getQuery } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  return fakeAdminStore.listHotels({
    nameLike: typeof query['filter[name][like]'] === 'string' ? query['filter[name][like]'] : undefined,
    sort: typeof query.sort === 'string' ? query.sort : 'name',
    dir: fakeAdminStore.parseDir(query.dir),
    limit: fakeAdminStore.parseLimit(query.limit),
  })
})
