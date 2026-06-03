<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  ConciergeBellIcon,
  DatabaseIcon,
  LanguagesIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PaletteIcon,
  RocketIcon,
  SmartphoneIcon,
  UtensilsCrossedIcon,
  UsersIcon,
  WifiIcon,
  XIcon,
  LogOutIcon,
} from '@lucide/vue'
import { cn } from '~/lib/utils'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const adminApi = useAdminApi()
const auth = useAuth()

const tabs = [
  { id: '', label: 'Dashboard', icon: LayoutDashboardIcon, superadminOnly: false },
  { id: 'branding', label: 'Branding', icon: PaletteIcon, superadminOnly: false },
  { id: 'pms', label: 'PMS Connection', icon: DatabaseIcon, superadminOnly: false },
  { id: 'wifi', label: 'WiFi', icon: WifiIcon, superadminOnly: false },
  { id: 'services', label: 'Services', icon: BellIcon, superadminOnly: false },
  { id: 'outlets', label: 'Outlets', icon: UtensilsCrossedIcon, superadminOnly: false },
  { id: 'routing', label: 'Staff Routing', icon: UsersIcon, superadminOnly: true },
  { id: 'languages', label: 'Languages', icon: LanguagesIcon, superadminOnly: true },
  { id: 'publish', label: 'Preview & Publish', icon: RocketIcon, superadminOnly: true },
] as const

const isMobileMenuOpen = ref(false)
const hotels = ref<Awaited<ReturnType<typeof adminApi.listSuperadminHotels>>>([])
const isHotelLoading = ref(false)

const currentUserRole = computed(() => auth.role.value)
const isSuperAdmin = computed(() => auth.isSuperAdmin.value)
const visibleTabs = computed(() => tabs.filter((tab) => isSuperAdmin.value || !tab.superadminOnly))

const selectedHotelId = computed({
  get: () => adminApi.hotelId.value,
  set: (value: string) => adminApi.setHotelId(value),
})

const pageKey = computed(() => `${route.fullPath}:${selectedHotelId.value}`)

const activeTabId = computed(() => route.path.replace(/^\//, ''))

const activeTabMeta = computed(() => tabs.find((t) => t.id === activeTabId.value) ?? tabs[0])
const activeTabLabel = computed(() => activeTabMeta.value.label)
const selectedHotelName = computed(() => hotels.value.find((hotel) => hotel.id === selectedHotelId.value)?.name ?? 'Hotel')
const totalHotelCount = computed(() => hotels.value.length)
const activeHotelCount = computed(() => hotels.value.filter((hotel) => hotel.isActive).length)
const inactiveHotelCount = computed(() => Math.max(totalHotelCount.value - activeHotelCount.value, 0))
const liveStatusDescription = computed(() => {
  if (isHotelLoading.value) {
    return 'Loading hotel status...'
  }

  if (!totalHotelCount.value) {
    return 'No hotels available in current scope.'
  }

  return `${activeHotelCount.value} active / ${inactiveHotelCount.value} inactive hotel(s)`
})
const liveStatusButtonLabel = computed(() => {
  if (isHotelLoading.value) {
    return 'Syncing...'
  }

  return `View Hotels (${totalHotelCount.value})`
})
const headerDescription = computed(() => {
  if (activeTabId.value === '') {
    return 'Welcome back — here\'s your hotel at a glance.'
  }

  return `Configure your hotel's ${activeTabLabel.value.toLowerCase()} settings.`
})

const roleLabel = computed(() => currentUserRole.value === 'superadmin' ? 'Superadmin' : 'Admin')
const accountName = computed(() => auth.username.value ? auth.username.value : 'Signed in user')
const accountInitials = computed(() => accountName.value.slice(0, 2).toUpperCase())

async function logout() {
  auth.logout()
  await navigateTo('/login')
}

async function loadHotels() {
  if (!isSuperAdmin.value) {
    return
  }

  isHotelLoading.value = true
  try {
    hotels.value = await adminApi.listSuperadminHotels()

    if (!hotels.value.some((hotel) => hotel.id === selectedHotelId.value) && hotels.value[0]) {
      adminApi.setHotelId(hotels.value[0].id)
    }
  }
  finally {
    isHotelLoading.value = false
  }
}

onMounted(loadHotels)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#F5F5F7] font-sans">
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
      @click="isMobileMenuOpen = false"
    />

    <aside
      :class="
        cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E5E5E7] bg-[#F5F5F7] p-8 transition-transform duration-300 md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )
      "
    >
      <div class="mb-10 flex items-center justify-between px-2">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#027BFF] text-white">
            <ConciergeBellIcon/>
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">Sentec Butler</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Admin</p>
          </div>
        </div>
        <div class="md:hidden">
          <Button variant="secondary" size="icon" @click="isMobileMenuOpen = false">
            <XIcon/>
          </Button>
        </div>
      </div>

      <div v-if="isSuperAdmin" class="mb-6 px-2">
        <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Selected Hotel</p>
        <Select v-model="selectedHotelId">
          <SelectTrigger>
            <SelectValue :placeholder="isHotelLoading ? 'Loading hotels...' : 'Select hotel'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="hotel in hotels" :key="hotel.id" :value="hotel.id">
              {{ hotel.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="tab in visibleTabs"
          :key="tab.id"
          :to="tab.id === '' ? '/' : `/${tab.id}`"
          :class="
            cn(
              'flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all',
              activeTabId === tab.id
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]',
            )
          "
          @click="isMobileMenuOpen = false"
        >
          <div class="flex items-center gap-3">
            <component :is="tab.icon" />
            <span class="text-sm font-medium">{{ tab.label }}</span>
          </div>
          <ChevronRightIcon v-if="activeTabId === tab.id" />
        </NuxtLink>
      </nav>

      <div class="mt-6 border-t border-[#E5E5E7] pt-6">
        <div class="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D1D1F] text-xs font-bold tracking-wide text-white">
            {{ accountInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-[#1D1D1F]">{{ accountName }}</p>
            <p class="text-xs font-medium text-[#86868B]">{{ roleLabel }}</p>
          </div>
          <Button variant="ghost" size="icon" class="shrink-0 text-[#86868B] hover:text-[#1D1D1F]" title="Logout" @click="logout">
            <LogOutIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>

    </aside>

    <main class="w-full flex-1 overflow-y-auto p-4 md:p-8">
      <div class="mx-auto max-w-5xl">
        <header class="mb-8 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div class="flex items-center gap-4">
            <div class="-ml-2 md:hidden">
              <Button variant="secondary" size="icon" @click="isMobileMenuOpen = true">
                <MenuIcon />
              </Button>
            </div>
            <div>
              <h2 class="mb-2 text-2xl font-bold tracking-tight capitalize md:text-3xl">{{ activeTabLabel }}</h2>
              <p class="text-sm font-medium text-[#86868B] md:text-base">
                {{ headerDescription }}
              </p>
              <p v-if="isSuperAdmin" class="mt-1 text-xs font-semibold uppercase tracking-widest text-[#86868B]">
                Active Hotel: {{ selectedHotelName }}
              </p>
            </div>
          </div>

          <div class="grid w-full grid-cols-1 gap-3 md:flex md:w-auto md:items-center">
            <div class="grid grid-cols-2 gap-3 md:flex md:w-auto">
            <Button variant="secondary">
              Discard
            </Button>
            <Button>
              <CheckIcon />
              Publish
            </Button>
            </div>
          </div>
        </header>

        <NuxtPage :key="pageKey" />
      </div>
    </main>
  </div>
</template>
