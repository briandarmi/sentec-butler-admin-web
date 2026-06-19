<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Building2Icon,
  ChevronRightIcon,
  ConciergeBellIcon,
  DatabaseIcon,
  GlobeIcon,
  HotelIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapPinnedIcon,
  MenuIcon,
  MessageSquareIcon,
  NetworkIcon,
  PaletteIcon,
  BellIcon,
  TimerIcon,
  UsersIcon,
  UtensilsCrossedIcon,
  WifiIcon,
  XIcon,
} from '@lucide/vue'
import { cn } from '~/lib/utils'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuth } from '~/composables/useAuth'
import { useAuthz, type AuthzResource } from '~/composables/useAuthz'

const route = useRoute()
const adminApi = useAdminApi()
const auth = useAuth()
const { can } = useAuthz()

interface NavItem { id: string; label: string; icon: unknown; resource: AuthzResource }
interface NavGroup { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: '', label: 'Dashboard', icon: LayoutDashboardIcon, resource: 'dashboard' },
    ],
  },
  {
    label: 'Hotel Configuration',
    items: [
      { id: 'branding', label: 'Branding', icon: PaletteIcon, resource: 'branding' },
      { id: 'wifi', label: 'WiFi & Setup', icon: WifiIcon, resource: 'hotelSetup' },
      { id: 'services', label: 'Room Services', icon: BellIcon, resource: 'roomServices' },
      { id: 'catalog', label: 'Categories & Items', icon: UtensilsCrossedIcon, resource: 'categoryItems' },
      { id: 'routing', label: 'Staff Routing', icon: MapPinnedIcon, resource: 'requestMapping' },
      { id: 'slas', label: 'SLAs', icon: TimerIcon, resource: 'slas' },
      { id: 'departments', label: 'Departments', icon: Building2Icon, resource: 'hotelDepartments' },
      { id: 'users', label: 'Users & Roles', icon: UsersIcon, resource: 'users' },
      { id: 'templates', label: 'Message Templates', icon: MessageSquareIcon, resource: 'templateMessages' },
      { id: 'sync', label: 'PMS / EMS Sync', icon: DatabaseIcon, resource: 'hotelSync' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { id: 'organizations', label: 'Organizations', icon: NetworkIcon, resource: 'organizations' },
      { id: 'hotels', label: 'Hotels', icon: HotelIcon, resource: 'hotels' },
      { id: 'master', label: 'Master Data', icon: GlobeIcon, resource: 'master' },
    ],
  },
]

const isMobileMenuOpen = ref(false)

const isSuperAdmin = computed(() => auth.isSuperAdmin.value)
const accessibleHotels = computed(() => auth.accessibleHotels.value)

const visibleGroups = computed(() =>
  navGroups
    .map(group => ({ ...group, items: group.items.filter(item => can('read', item.resource)) }))
    .filter(group => group.items.length > 0),
)

const allVisibleItems = computed(() => visibleGroups.value.flatMap(group => group.items))

const selectedHotelId = computed({
  get: () => adminApi.hotelId.value,
  set: (value: string) => adminApi.setHotelId(value),
})

const pageKey = computed(() => `${route.fullPath}:${selectedHotelId.value}`)
const activeTabId = computed(() => route.path.replace(/^\//, ''))
const activeItem = computed(() => allVisibleItems.value.find(item => item.id === activeTabId.value))
const activeTabLabel = computed(() => activeItem.value?.label ?? 'Dashboard')
const selectedHotelName = computed(() => accessibleHotels.value.find(hotel => hotel.id === selectedHotelId.value)?.name ?? 'Hotel')

const headerDescription = computed(() => {
  if (activeTabId.value === '') {
    return 'Welcome back — here\'s your hotel at a glance.'
  }
  return `Manage ${activeTabLabel.value.toLowerCase()} for the selected hotel.`
})

const roleLabel = computed(() => (isSuperAdmin.value ? 'Superadmin' : 'Admin'))
const accountName = computed(() => auth.displayName.value || auth.username.value || 'Signed in user')
const accountInitials = computed(() => accountName.value.slice(0, 2).toUpperCase())

async function logout() {
  auth.logout()
  await navigateTo('/login')
}

function ensureValidHotelSelection() {
  const hotels = accessibleHotels.value
  if (!hotels.length) return
  if (!hotels.some(hotel => hotel.id === selectedHotelId.value)) {
    adminApi.setHotelId(hotels[0]!.id)
  }
}

onMounted(ensureValidHotelSelection)
watch(accessibleHotels, ensureValidHotelSelection)
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
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E5E5E7] bg-[#F5F5F7] p-6 transition-transform duration-300 md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )
      "
    >
      <div class="mb-8 flex items-center justify-between px-2">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#027BFF] text-white">
            <ConciergeBellIcon />
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">Sentec Butler</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Admin</p>
          </div>
        </div>
        <div class="md:hidden">
          <Button variant="secondary" size="icon" @click="isMobileMenuOpen = false">
            <XIcon />
          </Button>
        </div>
      </div>

      <div v-if="accessibleHotels.length" class="mb-6 px-2">
        <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Active Hotel</p>
        <Select v-model="selectedHotelId">
          <SelectTrigger>
            <SelectValue placeholder="Select hotel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="hotel in accessibleHotels" :key="hotel.id" :value="hotel.id">
              {{ hotel.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto">
        <div v-for="group in visibleGroups" :key="group.label">
          <p class="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-[#A1A1A6]">{{ group.label }}</p>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in group.items"
              :key="item.id"
              :to="item.id === '' ? '/' : `/${item.id}`"
              :class="
                cn(
                  'flex w-full items-center justify-between rounded-xl px-4 py-2.5 transition-all',
                  activeTabId === item.id
                    ? 'bg-white text-[#1D1D1F] shadow-sm'
                    : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]',
                )
              "
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-3">
                <component :is="item.icon" class="h-4 w-4" />
                <span class="text-sm font-medium">{{ item.label }}</span>
              </div>
              <ChevronRightIcon v-if="activeTabId === item.id" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>
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
              <p class="mt-1 text-xs font-semibold uppercase tracking-widest text-[#86868B]">
                Active Hotel: {{ selectedHotelName }}
              </p>
            </div>
          </div>
        </header>

        <NuxtPage :key="pageKey" />
      </div>
    </main>
  </div>
</template>
