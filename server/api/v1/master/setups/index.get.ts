import { getQuery } from 'h3'
import { fakeAdminStore } from '~~/server/utils/fakeAdminStore'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  return fakeAdminStore.listMasterSetups({
    nameLike: typeof query['filter[name][like]'] === 'string' ? query['filter[name][like]'] : undefined,
    setupCodeEq: typeof query['filter[setupCode][eq]'] === 'string' ? query['filter[setupCode][eq]'] : undefined,
    inputTypeEq: typeof query['filter[inputType][eq]'] === 'string' ? query['filter[inputType][eq]'] : undefined,
    sort: typeof query.sort === 'string' ? query.sort : 'name',
    dir: fakeAdminStore.parseDir(query.dir),
    limit: fakeAdminStore.parseLimit(query.limit),
  })
})
