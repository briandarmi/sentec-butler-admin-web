<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  BellIcon,
  Building2Icon,
  DatabaseIcon,
  GlobeIcon,
  PaletteIcon,
  RefreshCwIcon,
  UtensilsCrossedIcon,
  UsersIcon,
  WifiIcon,
} from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'

const adminApi = useAdminApi()

const hotels = ref<Awaited<ReturnType<typeof adminApi.listSuperadminHotels>>>([])
const masterSetups = ref<Awaited<ReturnType<typeof adminApi.listMasterSetups>>>([])
const hotelSetups = ref<Awaited<ReturnType<typeof adminApi.listHotelSetups>>>([])
const services = ref<Awaited<ReturnType<typeof adminApi.listRoomServices>>>([])
const outlets = ref<Awaited<ReturnType<typeof adminApi.listCategoryItems>>>([])
const syncs = ref<Awaited<ReturnType<typeof adminApi.listHotelSyncs>>>([])
const applications = ref<Awaited<ReturnType<typeof adminApi.listApplications>>>([])

const isLoading = ref(false)

const selectedHotel = computed(() => hotels.value.find((hotel) => hotel.id === adminApi.hotelId.value))

const setupIdByCode = computed(() => Object.fromEntries(masterSetups.value.map((item) => [item.setupCode, item.id])))
const setupValueByCode = computed(() => {
  const result: Record<string, string> = {}
  for (const [code, setupId] of Object.entries(setupIdByCode.value)) {
    const found = hotelSetups.value.find((item) => item.setupId === setupId)
    if (found?.value) {
      result[code] = found.value
    }
  }

  return result
})

const requiredSetupCodes = ['HOTEL_NAME', 'HOTEL_LOGO_URL', 'PRIMARY_COLOR', 'SECONDARY_COLOR', 'FONT_FAMILY', 'WIFI_SSID', 'WIFI_PASSWORD']
const configCompletionPercent = computed(() => {
  const filled = requiredSetupCodes.filter((code) => Boolean(setupValueByCode.value[code])).length
  return Math.round((filled / requiredSetupCodes.length) * 100)
})

const stats = computed(() => [
  { label: 'Active Hotels', value: String(hotels.value.filter((hotel) => hotel.isActive).length) },
  { label: 'Services Enabled', value: String(services.value.filter((service) => service.isActive).length) },
  { label: 'Outlets Active', value: String(outlets.value.filter((outlet) => outlet.isActive).length) },
  { label: 'PMS Links', value: String(syncs.value.length) },
])

const modules = computed(() => {
  const hasBranding = configCompletionPercent.value >= 60
  const hasWifi = Boolean(setupValueByCode.value.WIFI_SSID) && Boolean(setupValueByCode.value.WIFI_PASSWORD)
  const hasPms = syncs.value.length > 0
  const hasServices = services.value.length > 0
  const hasOutlets = outlets.value.length > 0

  return [
    { id: 'branding', label: 'Branding', icon: PaletteIcon, description: 'Logo, colors, typography', ready: hasBranding },
    { id: 'wifi', label: 'WiFi', icon: WifiIcon, description: 'Guest SSID and password', ready: hasWifi },
    { id: 'pms', label: 'PMS Connection', icon: DatabaseIcon, description: `${syncs.value.length} linked application(s)`, ready: hasPms },
    { id: 'services', label: 'Services', icon: BellIcon, description: `${services.value.length} service item(s)`, ready: hasServices },
    { id: 'outlets', label: 'Outlets', icon: UtensilsCrossedIcon, description: `${outlets.value.length} outlet item(s)`, ready: hasOutlets },
    { id: 'routing', label: 'Staff Routing', icon: UsersIcon, description: 'Request mapping and SLA', ready: true },
  ]
})

const syncRows = computed(() => {
  return applications.value.map((application) => {
    const found = syncs.value.find((item) => item.applicationId === application.id)
    const mode = found ? (found.useAsymetric ? 'Asymmetric' : 'Symmetric') : 'Not Connected'
    const status = found ? 'Synced' : 'Not Connected'

    return {
      label: application.name,
      mode,
      status,
    }
  })
})

async function loadDashboard() {
  isLoading.value = true
  try {
    const [hotelRows, masterSetupRows, hotelSetupRows, serviceRows, outletRows, syncRowsData, applicationRows] = await Promise.all([
      adminApi.listSuperadminHotels(),
      adminApi.listMasterSetups(),
      adminApi.listHotelSetups(),
      adminApi.listRoomServices(),
      adminApi.listCategoryItems(),
      adminApi.listHotelSyncs(),
      adminApi.listApplications(),
    ])

    hotels.value = hotelRows
    masterSetups.value = masterSetupRows
    hotelSetups.value = hotelSetupRows
    services.value = serviceRows
    outlets.value = outletRows
    syncs.value = syncRowsData
    applications.value = applicationRows
  }
  finally {
    isLoading.value = false
  }
}

watch(() => adminApi.hotelId.value, loadDashboard)
onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-10">
    <div class="flex items-center gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#027BFF] text-white shadow-md">
        <Building2Icon />
      </div>
      <div>
        <h2 class="text-2xl font-bold tracking-tight">{{ selectedHotel?.name ?? 'Hotel Dashboard' }}</h2>
        <p class="text-sm text-[#86868B]">Live operational view across your currently available admin modules</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label" class="gap-4">
        <CardHeader class="gap-0 pb-0">
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">{{ stat.label }}</CardDescription>
        </CardHeader>
        <CardContent class="mt-auto">
          <CardTitle class="text-3xl tracking-tight">{{ stat.value }}</CardTitle>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="text-base">Hotel Profile</CardTitle>
          <CardDescription>Current selected hotel context used by all admin pages</CardDescription>
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-[#E5E5E7] bg-white p-4">
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Hotel Name</p>
            <p class="mt-2 text-sm font-semibold">{{ selectedHotel?.name ?? '-' }}</p>
          </div>
          <div class="rounded-xl border border-[#E5E5E7] bg-white p-4">
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Contact Email</p>
            <p class="mt-2 text-sm font-semibold">{{ selectedHotel?.email ?? '-' }}</p>
          </div>
          <div class="rounded-xl border border-[#E5E5E7] bg-white p-4">
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Address</p>
            <p class="mt-2 text-sm font-semibold">{{ selectedHotel?.address ?? '-' }}</p>
          </div>
          <div class="rounded-xl border border-[#E5E5E7] bg-white p-4">
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Website</p>
            <p class="mt-2 text-sm font-semibold">{{ selectedHotel?.website ?? '-' }}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Setup Coverage</CardTitle>
          <CardDescription>Branding and connectivity readiness</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-end justify-between">
            <p class="text-3xl font-bold tracking-tight">{{ configCompletionPercent }}%</p>
            <Badge :variant="configCompletionPercent >= 80 ? 'success' : 'secondary'">
              {{ configCompletionPercent >= 80 ? 'Healthy' : 'Needs Attention' }}
            </Badge>
          </div>
          <Progress :model-value="configCompletionPercent" />
          <p class="text-xs text-[#86868B]">Based on branding, WiFi, and font setup codes currently configured.</p>
        </CardContent>
      </Card>
    </div>

    <div>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Available Features</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="module in modules"
          :key="module.id"
          class="transition-shadow hover:shadow-md"
        >
          <CardContent>
            <NuxtLink
              :to="`/${module.id}`"
              class="group flex items-center gap-4"
            >
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7] transition-colors group-hover:bg-[#027BFF]/10">
                <component :is="module.icon" class="text-[#86868B] transition-colors group-hover:text-[#027BFF]" />
              </div>
              <div>
                <p class="text-sm font-semibold">{{ module.label }}</p>
                <p class="text-xs text-[#86868B]">{{ module.description }}</p>
                <Badge class="mt-2" :variant="module.ready ? 'success' : 'secondary'">{{ module.ready ? 'Configured' : 'Pending' }}</Badge>
              </div>
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>

    <div>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">PMS Sync Status</h3>
      <Card>
        <CardContent class="space-y-0">
          <div
            v-for="item in syncRows"
            :key="`${item.label}:${item.mode}`"
            class="flex items-center justify-between border-b border-[#F5F5F7] py-4 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div>
              <p class="text-sm font-medium">{{ item.label }}</p>
              <p class="text-xs text-[#86868B]">{{ item.mode }} mode</p>
            </div>
            <Badge :variant="item.status === 'Synced' ? 'success' : 'secondary'">
              {{ item.status }}
            </Badge>
          </div>
          <div v-if="!syncRows.length" class="py-4 text-sm text-[#86868B]">No PMS applications found.</div>
        </CardContent>
      </Card>
    </div>

    <div class="flex items-center justify-end">
      <Button variant="secondary" :disabled="isLoading" @click="loadDashboard">
        <RefreshCwIcon />
        {{ isLoading ? 'Refreshing...' : 'Refresh Dashboard' }}
      </Button>
    </div>
  </div>
</template>
