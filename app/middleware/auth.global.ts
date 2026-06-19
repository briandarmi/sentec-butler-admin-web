import type { AuthzResource } from '~/composables/useAuthz'

// Map each route to the resource that gates it. Routes not listed are open to
// any authenticated user.
const ROUTE_RESOURCE: Record<string, AuthzResource> = {
  '/': 'dashboard',
  '/branding': 'branding',
  '/wifi': 'hotelSetup',
  '/services': 'roomServices',
  '/catalog': 'categoryItems',
  '/routing': 'requestMapping',
  '/slas': 'slas',
  '/departments': 'hotelDepartments',
  '/users': 'users',
  '/templates': 'templateMessages',
  '/sync': 'hotelSync',
  '/organizations': 'organizations',
  '/hotels': 'hotels',
  '/master': 'master',
}

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()

  if (to.path === '/login') {
    if (auth.isAuthenticated.value) {
      return navigateTo('/')
    }
    return
  }

  if (!auth.isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Role-based route protection (mirrors backend requirePermission gating).
  const resource = ROUTE_RESOURCE[to.path]
  if (resource) {
    const { can } = useAuthz()
    if (!can('read', resource)) {
      return navigateTo('/')
    }
  }
})
