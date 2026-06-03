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
})