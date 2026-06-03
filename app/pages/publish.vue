<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RocketIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const auth = useAuth()
const isSuperAdmin = computed(() => auth.role.value === 'superadmin')

const hotels = ref<Awaited<ReturnType<typeof adminApi.listSuperadminHotels>>>([])
const hotelSetups = ref<Awaited<ReturnType<typeof adminApi.listHotelSetups>>>([])
const masterSetups = ref<Awaited<ReturnType<typeof adminApi.listMasterSetups>>>([])
const services = ref<Awaited<ReturnType<typeof adminApi.listRoomServices>>>([])
const outlets = ref<Awaited<ReturnType<typeof adminApi.listCategoryItems>>>([])
const syncs = ref<Awaited<ReturnType<typeof adminApi.listHotelSyncs>>>([])
const isLoading = ref(false)

const selectedHotel = computed(() => hotels.value.find((hotel) => hotel.id === adminApi.hotelId.value))

const setupIdByCode = computed(() => Object.fromEntries(masterSetups.value.map((item) => [item.setupCode, item.id])))
const setupValueByCode = computed(() => {
  const values: Record<string, string> = {}
  for (const [code, setupId] of Object.entries(setupIdByCode.value)) {
    const found = hotelSetups.value.find((item) => item.setupId === setupId)
    if (found?.value) {
      values[code] = found.value
    }
  }

  return values
})

const checks = computed(() => [
  { id: 'branding', label: 'Branding Setup', passed: Boolean(setupValueByCode.value.HOTEL_NAME) && Boolean(setupValueByCode.value.PRIMARY_COLOR) },
  { id: 'wifi', label: 'WiFi Setup', passed: Boolean(setupValueByCode.value.WIFI_SSID) && Boolean(setupValueByCode.value.WIFI_PASSWORD) },
  { id: 'services', label: 'Service Catalog', passed: services.value.length > 0 },
  { id: 'outlets', label: 'Outlet Catalog', passed: outlets.value.length > 0 },
  { id: 'pms', label: 'PMS Sync', passed: syncs.value.length > 0 },
])

const passCount = computed(() => checks.value.filter((item) => item.passed).length)
const readiness = computed(() => Math.round((passCount.value / checks.value.length) * 100))

async function loadData() {
  if (!isSuperAdmin.value) {
    return
  }

  isLoading.value = true
  try {
    const [hotelRows, setupRows, masterRows, serviceRows, outletRows, syncRows] = await Promise.all([
      adminApi.listSuperadminHotels(),
      adminApi.listHotelSetups(),
      adminApi.listMasterSetups(),
      adminApi.listRoomServices(),
      adminApi.listCategoryItems(),
      adminApi.listHotelSyncs(),
    ])

    hotels.value = hotelRows
    hotelSetups.value = setupRows
    masterSetups.value = masterRows
    services.value = serviceRows
    outlets.value = outletRows
    syncs.value = syncRows
  }
  finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div v-if="!isSuperAdmin" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Superadmin Access Only</h3>
    <p class="max-w-sm text-[#86868B]">
      Publish controls are available only to superadmin users.
    </p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F7]">
        <RocketIcon />
      </div>
      <div>
        <h3 class="text-lg font-bold">Publish Readiness</h3>
        <p class="text-sm text-[#86868B]">Current release readiness for selected hotel</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ selectedHotel?.name ?? 'Selected Hotel' }}</CardTitle>
        <CardDescription>Pre-publish checks based on currently available fake API modules</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold">Readiness Score</p>
          <Badge :variant="readiness >= 80 ? 'success' : 'secondary'">{{ readiness }}%</Badge>
        </div>
        <Progress :model-value="readiness" />
        <div class="space-y-2">
          <div v-for="check in checks" :key="check.id" class="flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-white px-4 py-3">
            <p class="text-sm font-semibold">{{ check.label }}</p>
            <Badge :variant="check.passed ? 'success' : 'secondary'">{{ check.passed ? 'Ready' : 'Missing' }}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter class="justify-end">
        <Button :disabled="readiness < 100">Publish Now</Button>
      </CardFooter>
    </Card>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading publish status...</p>
  </div>
</template>
